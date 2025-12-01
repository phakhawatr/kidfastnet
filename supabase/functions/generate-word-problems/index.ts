import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordProblemRequest {
  category: 'length' | 'weight' | 'volume' | 'time';
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { category, difficulty, count }: WordProblemRequest = await req.json();

    const categoryExamples = {
      length: [
        'โบว์ผูกผมยาว 48 เซนติเมตร ยางมัดผมยาว 25 เซนติเมตร โบว์ผูกผมยาวกว่ายางมัดผมกี่เซนติเมตร',
        'ไม้ท่อนที่หนึ่งยาว 19 เมตร ไม้ท่อนที่สองยาวกว่าไม้ท่อนที่หนึ่ง 15 เมตร ไม้ท่อนที่สองยาวกี่เมตร'
      ],
      weight: [
        'ซื้อส้มโอหนัก 2 กิโลกรัม 3 ขีด ซื้อมะม่วงหนัก 1 กิโลกรัม 3 ขีด รวมหนักกี่กิโลกรัมกี่ขีด',
        'แป้งทำขนมหนัก 9 ขีด ซึ่งหนักกว่านํ้าตาล 3 ขีด นํ้าตาลหนักเท่าไร'
      ],
      volume: [
        'แม่ค้าขายผ้าให้คุณยายยาว 10 เมตร แม่ค้ายังเหลือผ้าอีก 40 เมตร เดิมแม่ค้ามีผ้ายาวกี่เมตร',
        'ขวดนํ้าจุได้ 3 ลิตร แก้วนํ้าจุได้ 2,000 มิลลิลิตร รวมกันจุได้กี่ลิตร'
      ],
      time: [
        'ระยะห่างระหว่างเรือเล็กกับท่าเรือ 780 เมตร ระยะห่างระหว่างเรือใหญ่กับท่าเรือน้อยกว่า 230 เมตร เรือใหญ่อยู่ห่างจากท่าเรือเท่าไร',
        'เดินทางไป 45 นาที พักผ่อน 15 นาที รวมเวลาทั้งหมดกี่นาที'
      ]
    };

    const systemPrompt = `คุณเป็นครูคณิตศาสตร์ระดับประถมศึกษา
สร้างโจทย์ปัญหาคณิตศาสตร์เกี่ยวกับ "${category}" ระดับความยาก "${difficulty}" จำนวน ${count} ข้อ

ข้อกำหนด:
1. โจทย์ต้องมีบริบทชีวิตจริง เหมาะกับเด็กไทย ป.1-ป.6
2. ใช้สถานการณ์ที่หลากหลาย เช่น การซื้อของ การทำอาหาร การเดินทาง
3. แต่ละข้อต้องมี:
   - โจทย์ที่ชัดเจน
   - คำตอบที่ถูกต้อง 1 ข้อ
   - คำตอบที่ผิด 3 ข้อ (ใกล้เคียงกับคำตอบที่ถูก)
   - คำอธิบายวิธีทำแบบเข้าใจง่าย

ตัวอย่างโจทย์:
${categoryExamples[category].join('\n')}

ระดับความยาก:
- easy: ตัวเลขไม่เกิน 100, คำนวณง่าย (บวก/ลบ)
- medium: ตัวเลข 100-500, อาจมีทศนิยม, มีหน่วยผสม
- hard: ตัวเลข > 500, หลายขั้นตอน, มีการแปลงหน่วย

ส่งคืนเป็น JSON array รูปแบบ:
[
  {
    "question": "โจทย์",
    "correctAnswer": ตัวเลขคำตอบที่ถูก,
    "unit": "หน่วย",
    "choices": [คำตอบ1, คำตอบ2, คำตอบ3, คำตอบ4],
    "explanation": "วิธีทำ"
  }
]`;

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
          { role: 'user', content: `สร้างโจทย์ ${count} ข้อ` }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    let problems = [];
    try {
      problems = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      problems = [];
    }

    return new Response(
      JSON.stringify({ problems }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
