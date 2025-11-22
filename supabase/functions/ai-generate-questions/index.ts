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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { grade, topic, difficulty, count, language = 'th' } = await req.json();

    if (!grade || !topic || !difficulty || !count) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `คุณคือครูคณิตศาสตร์ที่เชี่ยวชาญในการสร้างโจทย์คณิตศาสตร์สำหรับนักเรียนระดับประถมศึกษา

สร้างโจทย์คณิตศาสตร์ภาษา${language === 'th' ? 'ไทย' : 'อังกฤษ'} จำนวน ${count} ข้อ สำหรับ:
- ชั้น: ป.${grade}
- หัวข้อ: ${topic}
- ระดับความยาก: ${difficulty}

รูปแบบ JSON ที่ต้องการ (ตอบเป็น JSON array เท่านั้น):
[
  {
    "question_text": "โจทย์คำถาม",
    "choices": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"],
    "correct_answer": "ตัวเลือก A",
    "explanation": "คำอธิบายวิธีทำ",
    "skill_name": "${topic}"
  }
]

กฎสำคัญ:
1. โจทย์ต้องเหมาะสมกับระดับชั้น ป.${grade}
2. ระดับความยาก: ${difficulty === 'easy' ? 'ง่าย' : difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
3. ตัวเลือกต้องมี 4 ตัวเลือก และมีคำตอบที่ถูกต้อง 1 ตัวเลือก
4. คำอธิบายต้องชัดเจนและเข้าใจง่าย
5. correct_answer ต้องตรงกับหนึ่งในตัวเลือกที่ให้มา`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `สร้างโจทย์ ${count} ข้อ` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from content
    let questions;
    try {
      // Try to extract JSON array from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                        content.match(/(\[[\s\S]*?\])/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[1]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add metadata
    const enrichedQuestions = questions.map((q: any) => ({
      ...q,
      grade,
      topic,
      difficulty,
      ai_generated: true,
    }));

    return new Response(
      JSON.stringify({ questions: enrichedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});