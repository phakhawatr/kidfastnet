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
    const { userId } = await req.json();

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

    // Check if today's mission already exists
    const today = new Date().toISOString().split('T')[0];
    const existingMission = recentMissions?.find(m => m.mission_date === today);

    if (existingMission) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          mission: existingMission,
          message: 'Mission already exists for today'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Construct AI prompt
    const systemPrompt = `คุณเป็น AI ครูคณิตศาสตร์สำหรับเด็กไทย มีหน้าที่สร้างภารกิจการฝึกประจำวันที่เหมาะสมกับระดับของนักเรียน

หลักการสร้างภารกิจ:
1. **Adaptive Learning**: ปรับระดับตามผลงานที่ผ่านมา
   - ถ้าเมื่อวานได้ 3 ดาว → เพิ่มความยาก หรือทักษะใหม่
   - ถ้าเมื่อวานได้ 1-2 ดาว → ทบทวนเรื่องเดิม ลดความยาก
   - ถ้าข้ามไป → ทำซ้ำเรื่องเดิมหรือลดระดับ

2. **Variety**: หลีกเลี่ยงทักษะที่ทำซ้ำกัน 3 วันติดต่อกัน

3. **Weak Skills Focus**: ให้ความสำคัญกับทักษะที่ยังไม่ชำนาญ

4. **Difficulty Levels**:
   - easy: เหมาะกับผู้เริ่มต้น ตัวเลขเล็ก โจทย์ง่าย
   - medium: ท้าทายปานกลาง ตัวเลขใหญ่ขึ้น ขั้นตอนมากขึ้น
   - hard: ยากและซับซ้อน ต้องคิดวิเคราะห์

ตอบกลับในรูปแบบ JSON:
{
  "skill_name": "ชื่อทักษะ (เช่น การบวกเลข, การคูณ, เศษส่วน)",
  "difficulty": "easy|medium|hard",
  "reasoning": "อธิบายเหตุผลว่าทำไมถึงเลือกทักษะและระดับนี้ (2-3 ประโยค)"
}`;

    const userPrompt = `วิเคราะห์ข้อมูลนักเรียนและสร้างภารกิจวันนี้:

**ประวัติการทำภารกิจ 7 วันที่ผ่านมา:**
${missionHistory.length > 0 ? JSON.stringify(missionHistory, null, 2) : 'ยังไม่มีประวัติ (นักเรียนใหม่)'}

**ทักษะที่ยังอ่อน (accuracy < 80%):**
${weakSkills.length > 0 ? JSON.stringify(weakSkills, null, 2) : 'ไม่มีข้อมูล'}

**ทักษะที่ทำล่าสุด 3 วัน:**
${recentSkills.length > 0 ? recentSkills.join(', ') : 'ไม่มี'}

สร้างภารกิจวันนี้ (${today}) ที่เหมาะสม โดยคำนึงถึง:
- หลีกเลี่ยงทักษะที่ทำซ้ำ 3 วันติด
- เน้นทักษะที่อ่อนถ้ามี
- ปรับระดับตามผลงานเมื่อวาน
- ถ้าเป็นนักเรียนใหม่ เริ่มจาก easy ทักษะพื้นฐาน`;

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
      
      // Fallback mission for new students
      missionData = {
        skill_name: 'การบวกเลข',
        difficulty: 'easy',
        reasoning: 'เริ่มต้นด้วยทักษะพื้นฐาน',
      };
    }

    // Create mission in database
    const { data: newMission, error: insertError } = await supabase
      .from('daily_missions')
      .insert({
        user_id: userId,
        mission_date: today,
        skill_name: missionData.skill_name,
        difficulty: missionData.difficulty,
        total_questions: 15,
        status: 'pending',
        ai_reasoning: missionData.reasoning,
        can_retry: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Increment AI usage
    await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_feature_type: 'daily_mission_generation',
    });

    console.log('Mission created successfully:', newMission.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mission: newMission,
        ai_reasoning: missionData.reasoning,
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
