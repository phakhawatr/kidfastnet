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
    
    // Support both old format (nickname, score, total) and new format (correctAnswers, totalQuestions)
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
      accountNumber 
    } = requestData;
    
    // Calculate values based on available data
    const actualScore = correctAnswers ?? rawScore ?? 0;
    const actualTotal = totalQuestions ?? total ?? 0;
    const actualPercentage = percentage ?? (actualTotal > 0 ? Math.round((actualScore / actualTotal) * 100) : 0);
    const actualTimeSpent = timeTaken ?? timeSpent ?? 'ไม่ระบุ';
    const actualNickname = nickname ?? 'นักเรียน';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's LINE user IDs
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

    // Determine which LINE account(s) to send to
    const lineUserIds = [];
    if (accountNumber === 1 && user.line_user_id) {
      lineUserIds.push(user.line_user_id);
    } else if (accountNumber === 2 && user.line_user_id_2) {
      lineUserIds.push(user.line_user_id_2);
    } else if (!accountNumber) {
      // If no accountNumber specified, send to both if connected
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

    // Check LINE message quota (20 per day)
    const { data: quotaData, error: quotaError } = await supabase
      .rpc('check_line_message_quota', { p_user_id: userId });

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to check quota'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quota = quotaData[0];
    console.log('Quota check:', quota);

    if (!quota.can_send) {
      console.log(`User ${userId} exceeded daily quota: ${quota.messages_sent_today}/${quota.quota_limit}`);
      
      // Log denied attempt
      await supabase.from('line_message_logs').insert({
        user_id: userId,
        exercise_type: exerciseType,
        message_data: { reason: 'quota_exceeded', quota: quota },
        sent_at: new Date().toISOString(),
        success: false,
        error_message: `Daily quota exceeded: ${quota.messages_sent_today}/${quota.quota_limit}`
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'quota_exceeded',
          message: `คุณส่งข้อความครบ ${quota.quota_limit} ครั้งแล้ววันนี้ กรุณารอพรุ่งนี้ค่ะ`,
          quota: quota
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send Flex Message to all connected LINE accounts
    for (const lineUserId of lineUserIds) {
      await sendLineFlexMessage(lineUserId, {
        exerciseType,
        nickname: actualNickname,
        score: actualScore,
        total: actualTotal,
        percentage: actualPercentage,
        timeSpent: actualTimeSpent,
        level: level || 'ไม่ระบุ',
        problems: problems || []
      });
    }

    // Log successful send
    await supabase.from('line_message_logs').insert({
      user_id: userId,
      exercise_type: exerciseType,
      message_data: {
        score: actualScore,
        total: actualTotal,
        percentage: actualPercentage,
        time_spent: actualTimeSpent
      },
      sent_at: new Date().toISOString(),
      success: true
    });

    console.log('Message logged successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        quota: {
          remaining: quota.remaining - 1,
          quota_limit: quota.quota_limit
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending LINE message:', error);
    
    // Log failed attempt
    try {
      const requestData = await req.clone().json();
      const userId = requestData.userId;
      const exerciseType = requestData.exerciseType || 'unknown';
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('line_message_logs').insert({
        user_id: userId,
        exercise_type: exerciseType,
        message_data: { error: error.message },
        sent_at: new Date().toISOString(),
        success: false,
        error_message: error.message || 'Unknown error'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendLineFlexMessage(lineUserId: string, data: any) {
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  
  const { exerciseType, nickname, score, total, percentage, timeSpent, level, problems } = data;
  
  console.log('Sending LINE message with data:', {
    exerciseType,
    nickname,
    score,
    total,
    percentage,
    timeSpent,
    level
  });

  // Exercise type name mapping (English to Thai)
  const exerciseNameMap: Record<string, string> = {
    'addition': 'บวก',
    'subtraction': 'ลบ',
    'multiplication': 'คูณ',
    'division': 'หาร',
    'test': 'ทดสอบ'
  };

  // Emoji mapping
  const emojiMap: Record<string, string> = {
    'addition': '➕',
    'subtraction': '➖',
    'multiplication': '✖️',
    'division': '➗',
    'test': '🧪'
  };

  const exerciseName = exerciseNameMap[exerciseType] || exerciseType;
  const emoji = emojiMap[exerciseType] || '📝';

  // Determine result color and message
  let resultColor = '#10b981'; // green
  let resultMessage = 'เก่งมาก! 🌟';
  
  if (percentage < 50) {
    resultColor = '#ef4444'; // red
    resultMessage = 'ลองอีกครั้งนะ! 💪';
  } else if (percentage < 80) {
    resultColor = '#f59e0b'; // yellow
    resultMessage = 'ดีมาก! 👍';
  }

  // Build basic info contents - always include nickname and score
  const basicInfoContents = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '👤 ชื่อ:',
          size: 'sm',
          color: '#555555',
          flex: 0
        },
        {
          type: 'text',
          text: String(nickname || 'นักเรียน'),
          size: 'sm',
          color: '#111111',
          align: 'end',
          weight: 'bold'
        }
      ]
    },
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '📊 คะแนน:',
          size: 'sm',
          color: '#555555',
          flex: 0
        },
        {
          type: 'text',
          text: `${String(score)}/${String(total)} (${String(percentage)}%)`,
          size: 'sm',
          color: '#111111',
          align: 'end',
          weight: 'bold'
        }
      ]
    }
  ];
  
  // Add time if available
  if (timeSpent && String(timeSpent) !== 'ไม่ระบุ' && String(timeSpent).trim() !== '') {
    basicInfoContents.push({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '⏱️ เวลา:',
          size: 'sm',
          color: '#555555',
          flex: 0
        },
        {
          type: 'text',
          text: String(timeSpent),
          size: 'sm',
          color: '#111111',
          align: 'end'
        }
      ]
    });
  }
  
  // Add level if available
  if (level && String(level) !== 'ไม่ระบุ' && String(level).trim() !== '') {
    basicInfoContents.push({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '🎯 ระดับ:',
          size: 'sm',
          color: '#555555',
          flex: 0
        },
        {
          type: 'text',
          text: String(level),
          size: 'sm',
          color: '#111111',
          align: 'end'
        }
      ]
    });
  }

  const flexMessage = {
    type: 'flex',
    altText: `${nickname} ทำข้อสอบ${exerciseName}ได้ ${score}/${total} คะแนน`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: emoji,
            size: '4xl',
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: exerciseName,
            weight: 'bold',
            size: 'xl',
            align: 'center',
            color: '#FFFFFF'
          }
        ],
        backgroundColor: resultColor,
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: resultMessage,
            weight: 'bold',
            size: 'lg',
            align: 'center',
            margin: 'none'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: basicInfoContents
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: '🎓 ข้อมูลจาก KidFast',
            color: '#aaaaaa',
            size: 'xs',
            align: 'center'
          },
          {
            type: 'text',
            text: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
            color: '#aaaaaa',
            size: 'xxs',
            align: 'center'
          }
        ],
        flex: 0
      }
    }
  };

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [flexMessage]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send LINE message:', errorText);
    throw new Error(`Failed to send LINE message: ${response.status}`);
  }

  return response.json();
}
