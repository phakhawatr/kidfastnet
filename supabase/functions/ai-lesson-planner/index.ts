import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, grade, duration, objectives, additionalNotes } = await req.json();

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านการออกแบบแผนการสอนคณิตศาสตร์สำหรับเด็กประถมศึกษาในประเทศไทย
    
กรุณาสร้างแผนการสอนที่มีโครงสร้างดังนี้:
1. กิจกรรมนำเข้าสู่บทเรียน (warm-up) ที่สนุกและกระตุ้นความสนใจ
2. เนื้อหาหลักที่แบ่งเป็นกิจกรรมย่อย พร้อมระบุสิ่งที่ครูทำและนักเรียนทำ
3. การฝึกปฏิบัติทั้งแบบมีผู้นำและแบบอิสระ
4. การประเมินผลระหว่างเรียนและคำถามตรวจสอบความเข้าใจ
5. สรุปบทเรียนและการบ้าน
6. การปรับเนื้อหาสำหรับนักเรียนที่มีความสามารถต่างกัน

ตอบเป็น JSON เท่านั้น ในรูปแบบ:
{
  "title": "ชื่อแผนการสอน",
  "grade": "ระดับชั้น",
  "duration": "ระยะเวลา (เช่น 50 นาที)",
  "objectives": ["จุดประสงค์ 1", "จุดประสงค์ 2"],
  "materials": ["สื่อ 1", "สื่อ 2"],
  "warmUp": {
    "activity": "ชื่อกิจกรรม",
    "duration": "5 นาที",
    "instructions": ["ขั้นตอน 1", "ขั้นตอน 2"]
  },
  "mainLesson": {
    "introduction": "คำอธิบายเบื้องต้น",
    "activities": [
      {
        "name": "ชื่อกิจกรรม",
        "duration": "15 นาที",
        "description": "คำอธิบาย",
        "teacherActions": ["สิ่งที่ครูทำ"],
        "studentActions": ["สิ่งที่นักเรียนทำ"]
      }
    ]
  },
  "practice": {
    "guided": ["กิจกรรมฝึกแบบมีผู้นำ"],
    "independent": ["กิจกรรมฝึกแบบอิสระ"]
  },
  "assessment": {
    "formative": ["วิธีประเมิน"],
    "questions": ["คำถามตรวจสอบ"]
  },
  "closure": {
    "summary": "สรุปบทเรียน",
    "homework": "การบ้าน"
  },
  "differentiation": {
    "struggling": ["สำหรับนักเรียนที่ต้องการความช่วยเหลือ"],
    "advanced": ["สำหรับนักเรียนที่เก่ง"]
  }
}`;

    const userPrompt = `สร้างแผนการสอนวิชาคณิตศาสตร์:
- หัวข้อ: ${topic}
- ระดับชั้น: ${grade}
- ระยะเวลา: ${duration} นาที
${objectives?.length > 0 ? `- จุดประสงค์ที่ต้องการ: ${objectives.join(', ')}` : ''}
${additionalNotes ? `- หมายเหตุ: ${additionalNotes}` : ''}

กรุณาออกแบบแผนการสอนที่เหมาะสมกับวัยและระดับชั้น มีกิจกรรมที่หลากหลาย น่าสนใจ และเน้นการลงมือปฏิบัติ`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let lessonPlan;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      lessonPlan = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify({ lessonPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-lesson-planner:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
