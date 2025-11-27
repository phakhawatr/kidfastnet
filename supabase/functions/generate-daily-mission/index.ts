import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, localDate } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check AI quota
    const { data: quotaData, error: quotaError } = await supabase.rpc(
      'check_and_reset_ai_quota',
      { p_user_id: userId }
    );

    if (quotaError) {
      console.error('Quota check error:', quotaError);
      throw quotaError;
    }

    if (!quotaData?.[0]?.has_quota) {
      return new Response(
        JSON.stringify({ error: 'AI quota exceeded', remaining: 0 }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI quota available:', quotaData[0].remaining);

    // Get last 7 days of missions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMissions, error: missionsError } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .gte('mission_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('mission_date', { ascending: false });

    if (missionsError) {
      console.error('Error fetching missions:', missionsError);
      throw missionsError;
    }

    // Get skill assessments
    const { data: skillAssessments, error: skillsError } = await supabase
      .from('skill_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('accuracy_rate', { ascending: true })
      .limit(10);

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
      throw skillsError;
    }

    // Check if today's missions already exist (3 missions)
    // Use localDate from client to avoid timezone issues
    const today = localDate || new Date().toISOString().split('T')[0];
    const existingMissions = recentMissions?.filter(m => m.mission_date === today) || [];

    // If we have 3 complete missions for today, return them
    const completedMissions = existingMissions.filter(m => m.status === 'completed');
    if (completedMissions.length >= 3) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          missions: completedMissions,
          message: 'Missions already exist for today'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete only NON-COMPLETED missions for today before generating new ones
    const missionsToDelete = existingMissions.filter(m => m.status !== 'completed');
    if (missionsToDelete.length > 0) {
      console.log(`Deleting ${missionsToDelete.length} non-completed missions...`);
      
      // Delete missions one by one to avoid conflicts
      for (const mission of missionsToDelete) {
        const { error: deleteError } = await supabase
          .from('daily_missions')
          .delete()
          .eq('id', mission.id);

        if (deleteError) {
          console.error('Error deleting mission:', mission.id, deleteError);
          // Continue deleting others even if one fails
        }
      }
      
      // Wait a moment to ensure deletions are processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate how many new missions we need (3 - completed count)
    const completedCount = existingMissions.filter(m => m.status === 'completed').length;
    const missionsNeeded = 3 - completedCount;

    if (missionsNeeded <= 0) {
      console.log('All missions already completed for today');
      return new Response(
        JSON.stringify({ 
          success: true, 
          missions: existingMissions.filter(m => m.status === 'completed'),
          message: 'All missions completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${missionsNeeded} new missions (${completedCount} already completed)...`);

    // Prepare data for AI
    const missionHistory = (recentMissions || []).map(m => ({
      date: m.mission_date,
      skill: m.skill_name,
      difficulty: m.difficulty,
      status: m.status,
      stars: m.stars_earned || 0,
      accuracy: m.correct_answers && m.total_questions 
        ? ((m.correct_answers / m.total_questions) * 100).toFixed(0)
        : 'N/A',
      time_minutes: m.time_spent ? (m.time_spent / 60).toFixed(1) : 'N/A',
    }));

    const weakSkills = (skillAssessments || [])
      .filter(s => s.accuracy_rate < 80)
      .map(s => ({
        skill: s.skill_name,
        accuracy: s.accuracy_rate.toFixed(0),
        attempts: s.total_attempts,
      }));

    const recentSkills = missionHistory.slice(0, 3).map(m => m.skill);

    // Construct AI prompt - Generate missions based on need
    const systemPrompt = `คุณเป็น AI ครูคณิตศาสตร์สำหรับเด็กไทย มีหน้าที่สร้างภารกิจให้เลือกในแต่ละวัน ที่เหมาะสมกับระดับของนักเรียน

หลักการสร้าง 3 ภารกิจ:
1. **ภารกิจที่ 1 - พัฒนาจุดอ่อน**: ทักษะที่อ่อนที่สุด/ต้องปรับปรุง (ระดับง่าย-กลาง) เน้นทบทวนพื้นฐาน
2. **ภารกิจที่ 2 - ฝึกฝนต่อเนื่อง**: ทักษะที่กำลังพัฒนา (ระดับกลาง) เน้นความสม่ำเสมอ
3. **ภารกิจที่ 3 - ท้าทาย**: ทักษะที่ชำนาญแล้ว/ท้าทายใหม่ (ระดับกลาง-ยาก) เน้นความก้าวหน้า

หลักการปรับระดับ:
- ถ้าเมื่อวานได้ 3 ดาว → เพิ่มความยาก หรือทักษะใหม่
- ถ้าเมื่อวานได้ 1-2 ดาว → ทบทวนเรื่องเดิม ลดความยาก
- ถ้าข้ามไป → ทำซ้ำเรื่องเดิมหรือลดระดับ
- หลีกเลี่ยงทักษะที่ทำซ้ำกัน 3 วันติดต่อกัน
- แต่ละภารกิจควรใช้ App ฝึกที่แตกต่างกัน!

ทักษะที่มี: การบวกเลข, การลบเลข, การคูณเลข, การหารเลข, เศษส่วน, ทศนิยม, ร้อยละ, เงินและการเงิน, การบอกเวลา, การชั่งน้ำหนัก, การวัดความยาว, รูปทรงจับคู่, อนุกรมรูปทรง, อนุกรมตัวเลข, พันธะตัวเลข, โมเดลบาร์, โมเดลพื้นที่, คิดเลขเร็ว, สูตรคูณ, ปริศนาตารางผลบวก, โจทย์ปัญหา

สร้าง ${missionsNeeded} ภารกิจ สำหรับวันนี้ (มี ${completedCount} ภารกิจทำสำเร็จแล้ว)

ตอบกลับในรูปแบบ JSON:
{
  "missions": [
    {
      "skill_name": "ชื่อทักษะ",
      "difficulty": "easy|medium|hard",
      "total_questions": 10-15,
      "reasoning": "เหตุผลสั้นๆ ว่าทำไมเลือกทักษะนี้"
    },
    {
      "skill_name": "ทักษะที่ 2 (ต่างจากที่ 1)",
      "difficulty": "easy|medium|hard",
      "total_questions": 10-15,
      "reasoning": "เหตุผล"
    },
    {
      "skill_name": "ทักษะที่ 3 (ต่างจากที่ 1 และ 2)",
      "difficulty": "easy|medium|hard",
      "total_questions": 10-15,
      "reasoning": "เหตุผล"
    }
  ],
  "daily_message": "ข้อความให้กำลังใจนักเรียนสำหรับวันนี้ (1-2 ประโยค)"
}`;

    const userPrompt = `วิเคราะห์ข้อมูลนักเรียนและสร้าง 3 ภารกิจให้เลือกสำหรับวันนี้:

**ประวัติการทำภารกิจ 7 วันที่ผ่านมา:**
${missionHistory.length > 0 ? JSON.stringify(missionHistory, null, 2) : 'ยังไม่มีประวัติ (นักเรียนใหม่)'}

**ทักษะที่ยังอ่อน (accuracy < 80%):**
${weakSkills.length > 0 ? JSON.stringify(weakSkills, null, 2) : 'ไม่มีข้อมูล'}

**ทักษะที่ทำล่าสุด 3 วัน:**
${recentSkills.length > 0 ? recentSkills.join(', ') : 'ไม่มี'}

สร้าง 3 ภารกิจสำหรับวันนี้ (${today}) โดย:
- ภารกิจที่ 1: เน้นพัฒนาจุดอ่อน (ระดับง่าย-กลาง)
- ภารกิจที่ 2: ฝึกฝนต่อเนื่อง (ระดับกลาง)
- ภารกิจที่ 3: ท้าทายใหม่ (ระดับกลาง-ยาก)
- แต่ละภารกิจใช้ทักษะที่แตกต่างกัน
- หลีกเลี่ยงทักษะที่ทำซ้ำ 3 วันติด
- ถ้าเป็นนักเรียนใหม่ เริ่มจาก easy-medium ทักษะพื้นฐาน 3 ทักษะ`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    const aiContent = aiData.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('No content from AI');
    }

    // Parse AI response
    let missionData;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        missionData = JSON.parse(jsonMatch[0]);
      } else {
        missionData = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI content:', aiContent);
      
      // Fallback missions for new students (generate only what's needed)
      const fallbackMissions = [
        { skill_name: 'การบวกเลข', difficulty: 'easy', total_questions: 10, reasoning: 'เริ่มต้นด้วยทักษะพื้นฐาน' },
        { skill_name: 'การลบเลข', difficulty: 'easy', total_questions: 10, reasoning: 'ฝึกทักษะพื้นฐานที่สอง' },
        { skill_name: 'รูปทรงจับคู่', difficulty: 'medium', total_questions: 10, reasoning: 'ท้าทายด้วยรูปทรง' },
      ];
      
      missionData = {
        missions: fallbackMissions.slice(0, missionsNeeded),
        daily_message: 'วันนี้มาฝึกฝนกันเถอะ! 💪',
      };
    }

    // Calculate starting option number (e.g., if 1 completed, start at option 2)
    const startingOption = completedCount + 1;

    // Create missions in database (only the needed count)
    const missionsToInsert = (missionData.missions || []).slice(0, missionsNeeded).map((mission: any, index: number) => ({
      user_id: userId,
      mission_date: today,
      skill_name: mission.skill_name,
      difficulty: mission.difficulty,
      total_questions: mission.total_questions || 15,
      status: 'pending',
      ai_reasoning: mission.reasoning,
      mission_option: startingOption + index, // Use correct option numbers
      daily_message: missionData.daily_message,
      can_retry: true,
    }));

    // Create 3 missions in database using upsert to handle race conditions
    const { data: newMissions, error: insertError } = await supabase
      .from('daily_missions')
      .upsert(missionsToInsert, {
        onConflict: 'user_id,mission_date,mission_option',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Increment AI usage
    await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_feature_type: 'daily_mission_generation',
    });

    console.log(`${missionsNeeded} Missions created successfully:`, newMissions.map(m => m.id));

    // Combine completed missions with new missions for response
    const allMissions = [
      ...existingMissions.filter(m => m.status === 'completed'),
      ...newMissions
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        missions: allMissions,
        completedCount,
        newCount: missionsNeeded,
        daily_message: missionData.daily_message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
