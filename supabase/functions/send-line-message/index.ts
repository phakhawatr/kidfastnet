import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received data:', requestData);
    
    const { 
      userId, 
      exerciseType,
      nickname,
      score: rawScore,
      total,
      correctAnswers,
      totalQuestions,
      percentage,
      timeTaken,
      timeSpent,
      level,
      problems,
      accountNumber,
      skillBreakdown,
      isAssessment,
      chartImageUrl,
      comparisonData,
    } = requestData;
    
    const actualScore = correctAnswers ?? rawScore ?? 0;
    const actualTotal = totalQuestions ?? total ?? 0;
    const actualPercentage = percentage ?? (actualTotal > 0 ? Math.round((actualScore / actualTotal) * 100) : 0);
    const actualTimeSpent = timeTaken ?? timeSpent ?? 'ไม่ระบุ';
    const actualNickname = nickname ?? 'นักเรียน';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: user, error: userError } = await supabase
      .from('user_registrations')
      .select('line_user_id, line_display_name, line_user_id_2, line_display_name_2')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.log('User not found:', userId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lineUserIds = [];
    if (accountNumber === 1 && user.line_user_id) {
      lineUserIds.push(user.line_user_id);
    } else if (accountNumber === 2 && user.line_user_id_2) {
      lineUserIds.push(user.line_user_id_2);
    } else if (!accountNumber) {
      if (user.line_user_id) lineUserIds.push(user.line_user_id);
      if (user.line_user_id_2) lineUserIds.push(user.line_user_id_2);
    }

    if (lineUserIds.length === 0) {
      console.log('No LINE accounts connected:', userId);
      return new Response(
        JSON.stringify({ error: 'LINE not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: quotaData, error: quotaError } = await supabase
      .rpc('check_line_message_quota', { p_user_id: userId });

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check quota' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quota = quotaData[0];
    if (!quota.can_send) {
      await supabase.from('line_message_logs').insert({
        user_id: userId, exercise_type: exerciseType,
        message_data: { reason: 'quota_exceeded', quota },
        sent_at: new Date().toISOString(), success: false,
        error_message: `Daily quota exceeded: ${quota.messages_sent_today}/${quota.quota_limit}`
      });
      return new Response(
        JSON.stringify({ success: false, error: 'quota_exceeded', message: `คุณส่งข้อความครบ ${quota.quota_limit} ครั้งแล้ววันนี้ กรุณารอพรุ่งนี้ค่ะ`, quota }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const lineUserId of lineUserIds) {
      if (isAssessment && skillBreakdown && skillBreakdown.length > 0) {
        await sendAssessmentFlexMessage(lineUserId, {
          exerciseType, nickname: actualNickname,
          score: actualScore, total: actualTotal,
          percentage: actualPercentage, timeSpent: actualTimeSpent,
          skillBreakdown, chartImageUrl, comparisonData,
        });
      } else {
        await sendLineFlexMessage(lineUserId, {
          exerciseType, nickname: actualNickname,
          score: actualScore, total: actualTotal,
          percentage: actualPercentage, timeSpent: actualTimeSpent,
          level: level || 'ไม่ระบุ', problems: problems || []
        });
      }
    }

    await supabase.from('line_message_logs').insert({
      user_id: userId, exercise_type: exerciseType,
      message_data: { score: actualScore, total: actualTotal, percentage: actualPercentage, time_spent: actualTimeSpent, skillBreakdown },
      sent_at: new Date().toISOString(), success: true
    });

    return new Response(
      JSON.stringify({ success: true, quota: { remaining: quota.remaining - 1, quota_limit: quota.quota_limit } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending LINE message:', error);
    try {
      const requestData = await req.clone().json();
      const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      await supabase.from('line_message_logs').insert({
        user_id: requestData.userId, exercise_type: requestData.exerciseType || 'unknown',
        message_data: { error: error.message }, sent_at: new Date().toISOString(),
        success: false, error_message: error.message || 'Unknown error'
      });
    } catch (logError) { console.error('Failed to log error:', logError); }
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// Assessment-specific Flex Message with skill breakdown (radar-chart style)
async function sendAssessmentFlexMessage(lineUserId: string, data: any) {
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  const { exerciseType, nickname, score, total, percentage, timeSpent, skillBreakdown, chartImageUrl, comparisonData } = data;

  // Determine overall status
  let headerColor = '#22c55e';
  let statusText = '🌟 ดีมาก!';
  if (percentage < 50) {
    headerColor = '#ef4444';
    statusText = '💪 ควรปรับปรุง';
  } else if (percentage < 85) {
    headerColor = '#eab308';
    statusText = '📝 ต้องปรับปรุง';
  }

  // Build skill breakdown rows
  const skillRows = skillBreakdown.map((s: any) => {
    let skillEmoji = '🟢';
    let skillColor = '#22c55e';
    if (s.percentage < 50) { skillEmoji = '🔴'; skillColor = '#ef4444'; }
    else if (s.percentage < 85) { skillEmoji = '🟡'; skillColor = '#eab308'; }
    
    return {
      type: 'box', layout: 'horizontal',
      contents: [
        { type: 'text', text: `${skillEmoji} ${s.skill}`, size: 'xs', color: '#555555', flex: 5 },
        { type: 'text', text: `${s.correct}/${s.total}`, size: 'xs', color: '#888888', flex: 2, align: 'center' },
        { type: 'text', text: `${s.percentage}%`, size: 'xs', color: skillColor, flex: 2, align: 'end', weight: 'bold' },
      ],
      margin: 'sm',
    };
  });

  const legendRow = {
    type: 'box', layout: 'horizontal',
    contents: [
      { type: 'text', text: '🟢 ≥85%', size: 'xxs', color: '#22c55e', flex: 1 },
      { type: 'text', text: '🟡 50-84%', size: 'xxs', color: '#eab308', flex: 1, align: 'center' },
      { type: 'text', text: '🔴 <50%', size: 'xxs', color: '#ef4444', flex: 1, align: 'end' },
    ],
    margin: 'lg', paddingTop: 'sm', borderWidth: 'normal', borderColor: '#eeeeee',
  };

  const mainBubble = {
    type: 'bubble', size: 'mega',
    hero: {
      type: 'box', layout: 'vertical',
      contents: [
        { type: 'text', text: '📊', size: '4xl', align: 'center', margin: 'sm' },
        { type: 'text', text: 'ผลการทดสอบวัดระดับความรู้', weight: 'bold', size: 'lg', align: 'center', color: '#FFFFFF' },
        { type: 'text', text: String(exerciseType), size: 'sm', align: 'center', color: '#FFFFFFCC', margin: 'xs' },
      ],
      backgroundColor: headerColor, paddingAll: 'lg',
    },
    body: {
      type: 'box', layout: 'vertical',
      contents: [
        { type: 'box', layout: 'vertical', contents: [
          { type: 'text', text: `${percentage}%`, size: '3xl', weight: 'bold', align: 'center', color: headerColor },
          { type: 'text', text: statusText, size: 'md', align: 'center', color: '#555555', margin: 'xs' },
        ]},
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'box', layout: 'vertical', flex: 1, contents: [
            { type: 'text', text: String(score), size: 'xl', weight: 'bold', align: 'center', color: '#22c55e' },
            { type: 'text', text: 'คำตอบถูก', size: 'xxs', align: 'center', color: '#888888' },
          ], backgroundColor: '#f0fdf4', cornerRadius: 'md', paddingAll: 'sm' },
          { type: 'box', layout: 'vertical', flex: 1, contents: [
            { type: 'text', text: String(total - score), size: 'xl', weight: 'bold', align: 'center', color: '#ef4444' },
            { type: 'text', text: 'คำตอบผิด', size: 'xxs', align: 'center', color: '#888888' },
          ], backgroundColor: '#fef2f2', cornerRadius: 'md', paddingAll: 'sm' },
        ], spacing: 'md', margin: 'lg' },
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '⏱️ เวลาที่ใช้:', size: 'xs', color: '#888888', flex: 0 },
          { type: 'text', text: String(timeSpent), size: 'xs', color: '#555555', align: 'end', weight: 'bold' },
        ], margin: 'md' },
        { type: 'separator', margin: 'lg', color: '#eeeeee' },
        { type: 'text', text: '📋 ผลแยกตามทักษะ', size: 'sm', weight: 'bold', color: '#333333', margin: 'lg' },
        ...skillRows,
        legendRow,
        // Embed radar chart image inside the bubble if available
        ...(chartImageUrl ? [
          { type: 'separator', margin: 'lg', color: '#eeeeee' },
          { type: 'text', text: '📈 กราฟความสามารถรายทักษะ', size: 'sm', weight: 'bold', color: '#333333', margin: 'md' },
          {
            type: 'image',
            url: chartImageUrl,
            size: 'full',
            aspectMode: 'fit',
            aspectRatio: '1:1',
            margin: 'md',
          },
        ] : []),
      ],
      paddingAll: 'lg',
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'sm',
      contents: [
        { type: 'text', text: `👤 ${nickname}`, color: '#888888', size: 'xs', align: 'center' },
        { type: 'text', text: '🎓 ข้อมูลจาก KidFastAI.com', color: '#aaaaaa', size: 'xxs', align: 'center' },
        { type: 'text', text: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }), color: '#aaaaaa', size: 'xxs', align: 'center' },
      ], flex: 0,
    },
  };

  // Build comparison bubble if comparison data exists
  let comparisonBubble: any = null;
  if (comparisonData && comparisonData.items && comparisonData.items.length > 0) {
    const compRows = comparisonData.items.map((item: any) => {
      let changeText = '-';
      let changeColor = '#888888';
      let changeEmoji = '➖';
      if (item.change !== null) {
        if (item.change > 0) { changeText = `+${item.change}%`; changeColor = '#22c55e'; changeEmoji = '📈'; }
        else if (item.change < 0) { changeText = `${item.change}%`; changeColor = '#ef4444'; changeEmoji = '📉'; }
        else { changeText = '0%'; changeColor = '#888888'; changeEmoji = '➖'; }
      }
      return {
        type: 'box', layout: 'horizontal',
        contents: [
          { type: 'text', text: item.skill, size: 'xxs', color: '#555555', flex: 4, wrap: true },
          { type: 'text', text: item.previousPct !== null ? `${item.previousPct}%` : '-', size: 'xxs', color: '#888888', flex: 2, align: 'center' },
          { type: 'text', text: `${item.currentPct}%`, size: 'xxs', color: '#333333', flex: 2, align: 'center', weight: 'bold' },
          { type: 'text', text: `${changeEmoji}${changeText}`, size: 'xxs', color: changeColor, flex: 3, align: 'end', weight: 'bold' },
        ],
        margin: 'sm',
      };
    });

    // Recommendations: skills below 85% or declined
    const weakSkills = comparisonData.items
      .filter((item: any) => item.currentPct < 85 || (item.change !== null && item.change < 0))
      .sort((a: any, b: any) => (a.currentPct) - (b.currentPct));

    const recommendationRows = weakSkills.slice(0, 3).map((item: any) => {
      const reason = item.change !== null && item.change < 0 
        ? `ลดลง ${Math.abs(item.change)}%` 
        : `ยังต่ำกว่า 85% (${item.currentPct}%)`;
      return {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: `🎯 ${item.skill}`, size: 'xs', color: '#333333', weight: 'bold' },
          { type: 'text', text: reason, size: 'xxs', color: '#888888' },
        ],
        margin: 'sm', paddingAll: 'sm', backgroundColor: '#fff7ed', cornerRadius: 'md',
      };
    });

    const summaryText = `ดีขึ้น ${comparisonData.improved} ทักษะ | ลดลง ${comparisonData.declined} ทักษะ | คงที่ ${comparisonData.stable} ทักษะ`;

    comparisonBubble = {
      type: 'bubble', size: 'mega',
      hero: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: '📊 บทวิเคราะห์เปรียบเทียบ', weight: 'bold', size: 'md', align: 'center', color: '#FFFFFF' },
          { type: 'text', text: 'เทียบกับการสอบครั้งก่อน', size: 'xs', align: 'center', color: '#FFFFFFCC', margin: 'xs' },
        ],
        backgroundColor: '#6366f1', paddingAll: 'lg',
      },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          // Summary
          { type: 'text', text: summaryText, size: 'xs', color: '#6366f1', align: 'center', weight: 'bold' },
          { type: 'separator', margin: 'md', color: '#eeeeee' },
          // Header row
          { type: 'box', layout: 'horizontal', margin: 'md', contents: [
            { type: 'text', text: 'ทักษะ', size: 'xxs', color: '#888888', flex: 4, weight: 'bold' },
            { type: 'text', text: 'ก่อน', size: 'xxs', color: '#888888', flex: 2, align: 'center', weight: 'bold' },
            { type: 'text', text: 'ล่าสุด', size: 'xxs', color: '#888888', flex: 2, align: 'center', weight: 'bold' },
            { type: 'text', text: 'เปลี่ยน', size: 'xxs', color: '#888888', flex: 3, align: 'end', weight: 'bold' },
          ]},
          ...compRows,
          // Recommendations section
          ...(recommendationRows.length > 0 ? [
            { type: 'separator', margin: 'lg', color: '#eeeeee' },
            { type: 'text', text: '💡 แนะนำฝึกเพิ่มเติม', size: 'sm', weight: 'bold', color: '#333333', margin: 'md' },
            ...recommendationRows,
          ] : []),
        ],
        paddingAll: 'lg',
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: `👤 ${nickname} | 🎓 KidFastAI.com`, color: '#aaaaaa', size: 'xxs', align: 'center' },
        ], flex: 0,
      },
    };
  }

  // Build messages: use carousel if comparison exists
  const messages: any[] = [];
  
  if (comparisonBubble) {
    messages.push({
      type: 'flex',
      altText: `${nickname} ผลสอบวัดระดับ ${exerciseType} - ${percentage}% พร้อมบทวิเคราะห์`,
      contents: {
        type: 'carousel',
        contents: [mainBubble, comparisonBubble],
      },
    });
  } else {
    messages.push({
      type: 'flex',
      altText: `${nickname} ผลสอบวัดระดับ ${exerciseType} - ${percentage}%`,
      contents: mainBubble,
    });
  }
  
  // Chart image is now embedded inside the main bubble — no separate image message

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${channelAccessToken}` },
    body: JSON.stringify({ to: lineUserId, messages }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send LINE assessment message:', errorText);
    throw new Error(`Failed to send LINE message: ${response.status}`);
  }
  return response.json();
}

// Original Flex Message for non-assessment exercises
async function sendLineFlexMessage(lineUserId: string, data: any) {
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  const { exerciseType, nickname, score, total, percentage, timeSpent, level, problems } = data;

  const exerciseNameMap: Record<string, string> = {
    'addition': 'บวก', 'subtraction': 'ลบ', 'multiplication': 'คูณ', 'division': 'หาร', 'test': 'ทดสอบ'
  };
  const emojiMap: Record<string, string> = {
    'addition': '➕', 'subtraction': '➖', 'multiplication': '✖️', 'division': '➗', 'test': '🧪'
  };

  const exerciseName = exerciseNameMap[exerciseType] || exerciseType;
  const emoji = emojiMap[exerciseType] || '📝';

  let resultColor = '#10b981';
  let resultMessage = 'เก่งมาก! 🌟';
  if (percentage < 50) {
    resultColor = '#ef4444';
    resultMessage = 'ควรปรับปรุง 💪';
  } else if (percentage < 85) {
    resultColor = '#eab308';
    resultMessage = 'ต้องปรับปรุง 📝';
  }

  const basicInfoContents: any[] = [
    {
      type: 'box', layout: 'horizontal',
      contents: [
        { type: 'text', text: '👤 ชื่อ:', size: 'sm', color: '#555555', flex: 0 },
        { type: 'text', text: String(nickname || 'นักเรียน'), size: 'sm', color: '#111111', align: 'end', weight: 'bold' }
      ]
    },
    {
      type: 'box', layout: 'horizontal',
      contents: [
        { type: 'text', text: '📊 คะแนน:', size: 'sm', color: '#555555', flex: 0 },
        { type: 'text', text: `${String(score)}/${String(total)} (${String(percentage)}%)`, size: 'sm', color: '#111111', align: 'end', weight: 'bold' }
      ]
    }
  ];
  
  if (timeSpent && String(timeSpent) !== 'ไม่ระบุ' && String(timeSpent).trim() !== '') {
    basicInfoContents.push({
      type: 'box', layout: 'horizontal',
      contents: [
        { type: 'text', text: '⏱️ เวลา:', size: 'sm', color: '#555555', flex: 0 },
        { type: 'text', text: String(timeSpent), size: 'sm', color: '#111111', align: 'end' }
      ]
    });
  }
  
  if (level && String(level) !== 'ไม่ระบุ' && String(level).trim() !== '') {
    basicInfoContents.push({
      type: 'box', layout: 'horizontal',
      contents: [
        { type: 'text', text: '🎯 ระดับ:', size: 'sm', color: '#555555', flex: 0 },
        { type: 'text', text: String(level), size: 'sm', color: '#111111', align: 'end' }
      ]
    });
  }

  const flexMessage = {
    type: 'flex',
    altText: `${nickname} ทำข้อสอบ${exerciseName}ได้ ${score}/${total} คะแนน`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: emoji, size: '4xl', align: 'center', margin: 'md' },
          { type: 'text', text: exerciseName, weight: 'bold', size: 'xl', align: 'center', color: '#FFFFFF' }
        ],
        backgroundColor: resultColor, paddingAll: 'lg'
      },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: resultMessage, weight: 'bold', size: 'lg', align: 'center', margin: 'none' },
          { type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm', contents: basicInfoContents }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          { type: 'text', text: '🎓 ข้อมูลจาก KidFast', color: '#aaaaaa', size: 'xs', align: 'center' },
          { type: 'text', text: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }), color: '#aaaaaa', size: 'xxs', align: 'center' }
        ],
        flex: 0
      }
    }
  };

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${channelAccessToken}` },
    body: JSON.stringify({ to: lineUserId, messages: [flexMessage] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send LINE message:', errorText);
    throw new Error(`Failed to send LINE message: ${response.status}`);
  }
  return response.json();
}
