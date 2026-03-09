import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Smart Fallback: สร้างภารกิจทันทีโดยไม่ต้องรอ AI
function generateSmartFallbackMissions(
  missionsNeeded: number,
  skillAssessments: any[],
  recentMissions: any[],
  availableSkills: string[],
  existingSkillsToday: string[]
) {
  const recentSkills = (recentMissions || []).slice(0, 5).map(m => m.skill_name);
  
  // แบ่งทักษะตามระดับ
  const weakSkills = (skillAssessments || [])
    .filter(s => s.accuracy_rate < 70)
    .map(s => s.skill_name)
    .filter(s => !existingSkillsToday.includes(s));
  
  const developingSkills = (skillAssessments || [])
    .filter(s => s.accuracy_rate >= 70 && s.accuracy_rate < 90)
    .map(s => s.skill_name)
    .filter(s => !existingSkillsToday.includes(s));
  
  const strongSkills = (skillAssessments || [])
    .filter(s => s.accuracy_rate >= 90)
    .map(s => s.skill_name)
    .filter(s => !existingSkillsToday.includes(s));
  
  // ทักษะที่ยังไม่เคยทำ
  const allPracticedSkills = (skillAssessments || []).map(s => s.skill_name);
  const newSkills = availableSkills
    .filter(s => !allPracticedSkills.includes(s) && !existingSkillsToday.includes(s));

  const missions = [];
  const usedSkills = new Set(existingSkillsToday);

  const pickSkill = (pool: string[], fallbackPool: string[]): string => {
    // เลือกจาก pool หลัก โดยหลีกเลี่ยงทักษะที่ใช้ไปแล้วและที่ทำล่าสุด
    const available = pool.filter(s => !usedSkills.has(s) && !recentSkills.slice(0, 2).includes(s));
    if (available.length > 0) {
      const picked = available[Math.floor(Math.random() * available.length)];
      usedSkills.add(picked);
      return picked;
    }
    // fallback
    const fallback = fallbackPool.filter(s => !usedSkills.has(s));
    if (fallback.length > 0) {
      const picked = fallback[Math.floor(Math.random() * fallback.length)];
      usedSkills.add(picked);
      return picked;
    }
    // last resort: random from all available
    const lastResort = availableSkills.filter(s => !usedSkills.has(s));
    if (lastResort.length > 0) {
      const picked = lastResort[Math.floor(Math.random() * lastResort.length)];
      usedSkills.add(picked);
      return picked;
    }
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  };

  // ภารกิจ 1: พัฒนาจุดอ่อน (easy)
  if (missions.length < missionsNeeded) {
    missions.push({
      skill_name: pickSkill(weakSkills, newSkills.length > 0 ? newSkills : availableSkills),
      difficulty: 'easy',
      total_questions: 10,
      reasoning: 'ฝึกทักษะที่ต้องพัฒนาเพิ่มเติม เริ่มจากระดับง่าย'
    });
  }

  // ภารกิจ 2: ฝึกฝนต่อเนื่อง (medium)
  if (missions.length < missionsNeeded) {
    missions.push({
      skill_name: pickSkill(developingSkills, availableSkills),
      difficulty: 'medium',
      total_questions: 10,
      reasoning: 'ฝึกทักษะที่กำลังพัฒนาอย่างต่อเนื่อง'
    });
  }

  // ภารกิจ 3: ท้าทาย (hard)
  if (missions.length < missionsNeeded) {
    missions.push({
      skill_name: pickSkill(strongSkills.length > 0 ? strongSkills : newSkills, availableSkills),
      difficulty: 'hard',
      total_questions: 10,
      reasoning: 'ท้าทายตัวเองกับทักษะขั้นสูง'
    });
  }

  return {
    missions,
    daily_message: 'วันนี้มาฝึกฝนกันเถอะ! ทำได้แน่นอน 💪'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, localDate, addSingleMission } = await req.json();

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

    console.log('Using Groq API for mission generation');

    // Fetch student's grade
    const { data: userData, error: userError } = await supabase
      .from('user_registrations')
      .select('grade')
      .eq('id', userId)
      .single();

    const studentGrade = userData?.grade || '';
    console.log('Student grade:', studentGrade);

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

    // Check if today's missions already exist
    const today = localDate || new Date().toISOString().split('T')[0];
    const existingMissions = recentMissions?.filter(m => m.mission_date === today) || [];

    // If addSingleMission mode, check limit
    if (addSingleMission) {
      if (existingMissions.length >= 10) {
        return new Response(
          JSON.stringify({ 
            error: 'max_missions_reached', 
            limit: 10,
            message: 'ถึงขีดจำกัด 10 ภารกิจต่อวันแล้ว'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check completed missions
    const completedMissions = existingMissions.filter(m => 
      m.status === 'completed' || m.completed_at !== null
    );
    if (!addSingleMission && completedMissions.length >= 3) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          missions: completedMissions,
          message: 'Missions already exist for today'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let missionsNeeded = 1;
    let completedCount = 0;
    
    if (addSingleMission) {
      missionsNeeded = 1;
      console.log('Single mission mode: creating 1 new mission...');
    } else {
      // Regular mode: DON'T delete yet - generate first, then delete
      completedCount = existingMissions.filter(m => m.completed_at !== null).length;
      missionsNeeded = 3 - completedCount;
    }

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
    const existingSkillsToday = existingMissions.map(m => m.skill_name);
    
    // Function to get skills based on grade level
    function getSkillsByGrade(grade: string): { skills: string[], gradeCategory: string } {
      const interactiveGames = [
        'ดอกไม้คณิตศาสตร์', 'บอลลูนคณิตศาสตร์', 'นับเลขท้าทาย', 
        'เปรียบเทียบดาว', 'นับกระดาน', 'นับผลไม้', 
        'อนุกรมรูปทรง', 'เศษส่วนรูปทรง', 'รูปทรงจับคู่'
      ];
      
      const basicSkills = [
        'การบวกเลข', 'การลบเลข', 'การคูณเลข', 'การหารเลข',
        'อนุกรมตัวเลข', 'สูตรคูณ', 'การบอกเวลา', 
        'การวัดความยาว', 'การชั่งน้ำหนัก', 'เงินและการเงิน',
        'เปรียบเทียบความยาว', 'เศษส่วนจับคู่', 'ร้อยละ'
      ];
      
      const advancedSkills = [
        'ค่าประจำหลัก', 'คิดเลขเร็ว', 'โมเดลพื้นที่', 
        'พันธะตัวเลข', 'โมเดลบาร์', 'คิดเลขด่วน', 
        'ปริศนาตารางผลบวก', 'โจทย์ปัญหา'
      ];
      
      if (grade.includes('อนุบาล') || grade.includes('อ.1') || grade.includes('อ.2') || grade.includes('อ.3')) {
        return { skills: interactiveGames, gradeCategory: 'kindergarten' };
      }
      
      if (grade.includes('ประถมศึกษาปีที่ 1') || grade.includes('ประถมศึกษาปีที่ 2') || grade.includes('ประถมศึกษาปีที่ 3') ||
          grade.includes('ป.1') || grade.includes('ป.2') || grade.includes('ป.3')) {
        return { 
          skills: [...basicSkills, ...advancedSkills.slice(0, 3)], 
          gradeCategory: 'primary_1_3' 
        };
      }
      
      if (grade.includes('ประถมศึกษาปีที่ 4') || grade.includes('ประถมศึกษาปีที่ 5') || grade.includes('ประถมศึกษาปีที่ 6') ||
          grade.includes('ป.4') || grade.includes('ป.5') || grade.includes('ป.6')) {
        return { 
          skills: [...basicSkills.slice(0, 4), ...advancedSkills], 
          gradeCategory: 'primary_4_6' 
        };
      }
      
      return { 
        skills: [...interactiveGames, ...basicSkills, ...advancedSkills], 
        gradeCategory: 'all' 
      };
    }

    const { skills: availableSkills, gradeCategory } = getSkillsByGrade(studentGrade);
    const skillsList = availableSkills.join(', ');

    let gradeGuidance = '';
    if (gradeCategory === 'kindergarten') {
      gradeGuidance = `\n**ระดับชั้น: อนุบาล (อ.1-อ.3)**\n- เน้นเกมโต้ตอบที่สนุกและเรียนรู้ผ่านภาพ\n- ระดับความยาก: ง่าย ถึง กลาง เท่านั้น\n- จำนวนโจทย์: 5-10 ข้อ`;
    } else if (gradeCategory === 'primary_1_3') {
      gradeGuidance = `\n**ระดับชั้น: ป.1-ป.3**\n- เน้นทักษะพื้นฐาน 70% + ทักษะขั้นสูง 30%\n- สามารถใช้ทุกระดับความยาก`;
    } else if (gradeCategory === 'primary_4_6') {
      gradeGuidance = `\n**ระดับชั้น: ป.4-ป.6**\n- เน้นทักษะขั้นสูง 70% + ทักษะพื้นฐาน 30%\n- สามารถใช้ทุกระดับความยาก รวมถึงยากมาก`;
    }
    
    const systemPrompt = addSingleMission 
      ? `คุณเป็น AI ครูคณิตศาสตร์สำหรับเด็กไทย มีหน้าที่สร้างภารกิจเพิ่มเติมให้นักเรียน
${gradeGuidance}

หลักการสร้างภารกิจเดี่ยว:
- เลือกทักษะที่แตกต่างจากภารกิจที่มีอยู่แล้ววันนี้
- ปรับระดับความยากตามประวัติการทำของนักเรียน
- ไม่ซ้ำทักษะที่ทำล่าสุด 3 วัน

ทักษะที่มีอยู่แล้ววันนี้: ${existingSkillsToday.join(', ') || 'ไม่มี'}

ทักษะที่สามารถเลือกได้สำหรับนักเรียนระดับนี้:
${skillsList}

สร้าง 1 ภารกิจเพิ่มเติม ที่ไม่ซ้ำกับทักษะที่มีอยู่แล้ว

ตอบกลับในรูปแบบ JSON เท่านั้น:
{
  "missions": [
    {
      "skill_name": "ชื่อทักษะ",
      "difficulty": "easy|medium|hard",
      "total_questions": 10,
      "reasoning": "เหตุผลสั้นๆ ว่าทำไมเลือกทักษะนี้"
    }
  ],
  "daily_message": "ข้อความให้กำลังใจนักเรียนสำหรับวันนี้ (1-2 ประโยค)"
}`
      : `คุณเป็น AI ครูคณิตศาสตร์สำหรับเด็กไทย มีหน้าที่สร้างภารกิจให้เลือกในแต่ละวัน ที่เหมาะสมกับระดับของนักเรียน
${gradeGuidance}

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

ทักษะที่สามารถเลือกได้สำหรับนักเรียนระดับนี้:
${skillsList}

สร้าง ${missionsNeeded} ภารกิจ สำหรับวันนี้ (มี ${completedCount} ภารกิจทำสำเร็จแล้ว)

ตอบกลับในรูปแบบ JSON เท่านั้น:
{
  "missions": [
    {
      "skill_name": "ชื่อทักษะ",
      "difficulty": "easy|medium|hard",
      "total_questions": 10,
      "reasoning": "เหตุผลสั้นๆ ว่าทำไมเลือกทักษะนี้"
    }
  ],
  "daily_message": "ข้อความให้กำลังใจนักเรียนสำหรับวันนี้ (1-2 ประโยค)"
}

หมายเหตุ: จำนวน missions ใน array ให้สร้างตามจำนวนที่ต้องการ (${missionsNeeded} ภารกิจ)`;

    const userPrompt = `${addSingleMission
      ? 'วิเคราะห์ข้อมูลนักเรียนและสร้าง 1 ภารกิจเพิ่มเติมสำหรับวันนี้'
      : 'วิเคราะห์ข้อมูลนักเรียนและสร้าง 3 ภารกิจให้เลือกสำหรับวันนี้'}:

**ประวัติการทำภารกิจ 7 วันที่ผ่านมา:**
${missionHistory.length > 0 ? JSON.stringify(missionHistory, null, 2) : 'ยังไม่มีประวัติ (นักเรียนใหม่)'}

**ทักษะที่ยังอ่อน (accuracy < 80%):**
${weakSkills.length > 0 ? JSON.stringify(weakSkills, null, 2) : 'ไม่มีข้อมูล'}

**ทักษะที่ทำล่าสุด 3 วัน:**
${recentSkills.length > 0 ? recentSkills.join(', ') : 'ไม่มี'}

${addSingleMission 
  ? `**ทักษะที่มีอยู่แล้ววันนี้:** ${existingSkillsToday.join(', ') || 'ไม่มี'}

สร้าง 1 ภารกิจเพิ่มเติมสำหรับวันนี้ (${today}) โดย:
- เลือกทักษะที่แตกต่างจากที่มีอยู่แล้ววันนี้
- หลีกเลี่ยงทักษะที่ทำซ้ำ 3 วันติด
- ปรับระดับตามประวัติการทำ`
  : `สร้าง 3 ภารกิจสำหรับวันนี้ (${today}) โดย:
- ภารกิจที่ 1: เน้นพัฒนาจุดอ่อน (ระดับง่าย-กลาง)
- ภารกิจที่ 2: ฝึกฝนต่อเนื่อง (ระดับกลาง)
- ภารกิจที่ 3: ท้าทายใหม่ (ระดับกลาง-ยาก)
- แต่ละภารกิจใช้ทักษะที่แตกต่างกัน
- หลีกเลี่ยงทักษะที่ทำซ้ำ 3 วันติด
- ถ้าเป็นนักเรียนใหม่ เริ่มจาก easy-medium ทักษะพื้นฐาน 3 ทักษะ`
}`;

    // Call Groq AI with 8-second race against Smart Fallback
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    console.log('Calling AI with 8s fallback race...');
    
    const controller = new AbortController();
    const AI_TIMEOUT_MS = 8000; // 8 seconds - then use smart fallback
    
    let missionData: any;
    let usedFallback = false;
    
    try {
      const aiPromise = fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      // Race: AI vs 8-second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI_TIMEOUT')), AI_TIMEOUT_MS);
      });

      const aiResponse = await Promise.race([aiPromise, timeoutPromise]) as Response;
      controller.abort(); // Cancel if not already done
      
      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          console.log('Rate limited, using smart fallback');
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices?.[0]?.message?.content;
      
      if (!aiContent) {
        throw new Error('No content from AI');
      }

      // Parse AI response
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          missionData = JSON.parse(jsonMatch[0]);
        } else {
          missionData = JSON.parse(aiContent);
        }
        console.log('AI response parsed successfully');
      } catch (parseError) {
        console.error('JSON parse error, using smart fallback');
        throw new Error('PARSE_ERROR');
      }
    } catch (error: any) {
      controller.abort();
      
      if (error.name === 'AbortError' || error.message === 'AI_TIMEOUT' || 
          error.message === 'RATE_LIMITED' || error.message === 'PARSE_ERROR' ||
          error.message?.includes('AI API error')) {
        console.log(`Using Smart Fallback (reason: ${error.message})`);
        usedFallback = true;
        missionData = generateSmartFallbackMissions(
          missionsNeeded,
          skillAssessments || [],
          recentMissions || [],
          availableSkills,
          existingSkillsToday
        );
      } else {
        throw error;
      }
    }

    // NOW delete old non-completed missions (create-before-delete pattern)
    // Only for regular mode (not addSingleMission)
    if (!addSingleMission) {
      const missionsToDelete = existingMissions.filter(m => 
        m.status !== 'completed' && m.completed_at === null
      );
      if (missionsToDelete.length > 0) {
        console.log(`Deleting ${missionsToDelete.length} non-completed missions after successful generation...`);
        for (const mission of missionsToDelete) {
          const { error: deleteError } = await supabase
            .from('daily_missions')
            .delete()
            .eq('id', mission.id);
          if (deleteError) {
            console.error('Error deleting mission:', mission.id, deleteError);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Calculate starting option number
    const startingOption = addSingleMission 
      ? existingMissions.length + 1 
      : completedCount + 1;

    // Create missions in database
    const missionsToInsert = (missionData.missions || []).slice(0, missionsNeeded).map((mission: any, index: number) => ({
      user_id: userId,
      mission_date: today,
      skill_name: mission.skill_name,
      difficulty: mission.difficulty,
      total_questions: 10,
      status: 'pending',
      ai_reasoning: mission.reasoning + (usedFallback ? ' (Smart Fallback)' : ''),
      mission_option: startingOption + index,
      daily_message: missionData.daily_message,
      can_retry: true,
    }));

    const { data: newMissions, error: insertError } = await supabase
      .from('daily_missions')
      .upsert(missionsToInsert, { onConflict: 'user_id,mission_date,mission_option' })
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log(`${missionsNeeded} Missions created successfully (fallback: ${usedFallback}):`, newMissions.map(m => m.id));

    const allMissions = [
      ...existingMissions.filter(m => m.completed_at !== null),
      ...newMissions
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        missions: allMissions,
        completedCount,
        newCount: missionsNeeded,
        daily_message: missionData.daily_message,
        usedFallback,
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
