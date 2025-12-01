import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's skill assessments
    const { data: assessments, error: assessError } = await supabase
      .from('skill_assessments')
      .select('*')
      .eq('user_id', userId);

    if (assessError) {
      console.error('Error fetching assessments:', assessError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch skill assessments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch practice history
    const { data: sessions, error: sessionsError } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(20);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    }

    // Check and reset AI quota
    const { data: quotaData, error: quotaError } = await supabase
      .rpc('check_and_reset_ai_quota', { p_user_id: userId });

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
      return new Response(
        JSON.stringify({ error: 'Failed to check AI quota' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [quota] = quotaData || [];
    if (!quota?.has_quota) {
      return new Response(
        JSON.stringify({ 
          error: 'AI quota exceeded',
          remainingQuota: quota?.remaining || 0 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI
    const skillsData = assessments?.map(a => ({
      skill: a.skill_name,
      accuracy: a.accuracy_rate,
      attempts: a.total_attempts,
      avgTime: a.average_time,
      difficulty: a.difficulty_level,
    })) || [];

    const recentPerformance = sessions?.slice(0, 10).map(s => ({
      skill: s.skill_name,
      accuracy: s.accuracy,
      difficulty: s.difficulty,
      date: s.session_date,
    })) || [];

    // Call Groq AI
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `คุณเป็น AI Learning Advisor สำหรับระบบการเรียนคณิตศาสตร์ 
วิเคราะห์ข้อมูลการฝึกฝนของนักเรียนและสร้าง learning path ที่เหมาะสม
คำนึงถึง:
- ทักษะที่อ่อนแอที่สุด (accuracy ต่ำ) ควรฝึกก่อน
- ทักษะที่มี accuracy สูงแล้ว (>85%) ควรเพิ่มความยาก
- สร้างเส้นทางการเรียนรู้แบบค่อยเป็นค่อยไป
- ระยะเวลาโดยประมาณในการฝึกแต่ละทักษะ

ตอบกลับในรูปแบบ JSON เท่านั้น:
{
  "pathName": "ชื่อเส้นทางการเรียนรู้",
  "skillsToFocus": ["skill1", "skill2", ...],
  "difficultyProgression": "easy->medium->hard",
  "steps": [
    {
      "step": 1,
      "skill": "ชื่อทักษะ",
      "difficulty": "easy|medium|hard",
      "estimatedTime": 15,
      "reasoning": "เหตุผลการเลือก"
    }
  ],
  "totalSteps": 5,
  "estimatedDuration": 75,
  "overallReasoning": "สรุปภาพรวมของ learning path"
}`;

    const userPrompt = `วิเคราะห์ข้อมูลนักเรียนและสร้าง learning path:

ทักษะปัจจุบัน:
${JSON.stringify(skillsData, null, 2)}

ประวัติการฝึกล่าสุด:
${JSON.stringify(recentPerformance, null, 2)}

สร้าง learning path 5-7 ขั้นตอนที่เหมาะสม`;

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from AI response
    let learningPathData;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                       aiContent.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      learningPathData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', rawResponse: aiContent }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save learning path to database
    const { data: savedPath, error: saveError } = await supabase
      .from('learning_paths')
      .insert({
        user_id: userId,
        path_name: learningPathData.pathName,
        total_steps: learningPathData.totalSteps,
        skills_to_focus: learningPathData.skillsToFocus,
        difficulty_progression: learningPathData.difficultyProgression,
        estimated_duration: learningPathData.estimatedDuration,
        ai_reasoning: learningPathData.overallReasoning,
        status: 'active',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving learning path:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save learning path' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create AI recommendations from steps
    const recommendations = learningPathData.steps?.map((step: any) => ({
      user_id: userId,
      recommendation_type: 'practice',
      skill_name: step.skill,
      suggested_difficulty: step.difficulty,
      reasoning: step.reasoning,
      priority: step.step,
    })) || [];

    if (recommendations.length > 0) {
      const { error: recError } = await supabase
        .from('ai_recommendations')
        .insert(recommendations);

      if (recError) {
        console.error('Error saving recommendations:', recError);
      }
    }

    // Increment AI usage
    await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_feature_type: 'learning_path',
      p_tokens_used: 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        learningPath: savedPath,
        steps: learningPathData.steps,
        remainingQuota: quota?.remaining - 1 || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-learning-path:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
