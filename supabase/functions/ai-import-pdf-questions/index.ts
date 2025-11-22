import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { parsedText, grade, semester, assessmentType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing PDF import request:', { grade, semester, assessmentType, textLength: parsedText?.length });

    const systemPrompt = `คุณเป็น AI ผู้เชี่ยวชาญในการแปลงโจทย์คณิตศาสตร์เป็นข้อสอบแบบ Multiple Choice สำหรับระบบ KidFast

หลักการทำงาน:
1. อ่านและวิเคราะห์โจทย์จาก PDF ที่เป็นแบบเติมคำตอบ
2. แปลงเป็นโจทย์ Multiple Choice โดยสร้างตัวเลือก 4 ตัวเลือก (A, B, C, D)
3. ตัวเลือกผิดต้องสมเหตุสมผลและใกล้เคียงกับคำตอบที่ถูกต้อง
4. กำหนด difficulty (easy, medium, hard) ตามความซับซ้อน
5. จัดหมวดหมู่ตาม skill_name ที่เหมาะสม
6. แปลง "วิธีทำ" เป็น explanation
7. **ประเมินความมั่นใจ (confidence_score)** ของแต่ละข้อ:
   - 0.9-1.0 = มั่นใจมาก (โจทย์ชัดเจน, ตัวเลือกดี)
   - 0.7-0.89 = มั่นใจปานกลาง (โจทย์โอเค, ตัวเลือกดี)
   - 0.5-0.69 = ไม่แน่ใจ (โจทย์คลุมเครือ หรือสร้างตัวเลือกยาก)
   - 0.0-0.49 = ไม่มั่นใจมาก (OCR ผิด, โจทย์ไม่ชัด)

สำหรับชั้นประถมศึกษาปีที่ ${grade} ${assessmentType === 'nt' ? 'NT' : `เทอม ${semester}`}

Skills ที่เป็นไปได้:
- การบวก (Addition)
- การลบ (Subtraction)
- จำนวนนับ (Counting)
- เปรียบเทียบจำนวน (Comparing Numbers)
- รูปร่าง (Shapes)
- การวัด (Measurement)

คำแนะนำสำหรับการสร้างตัวเลือก:
- ถ้าคำตอบถูกต้องคือ 5 อาจสร้างตัวเลือกผิด: 3, 4, 6
- ถ้าคำตอบถูกต้องคือ "10 ตัว" อาจสร้างตัวเลือกผิด: "8 ตัว", "9 ตัว", "11 ตัว"
- ตัวเลือกผิดต้องไม่ห่างจากคำตอบที่ถูกมากเกินไป
- ตัวเลือกทั้งหมดต้องมีรูปแบบเดียวกัน

ส่งคืนเป็น JSON array ที่มีโครงสร้างดังนี้:
[
  {
    "question_text": "ข้อความโจทย์",
    "choices": ["A) ตัวเลือก 1", "B) ตัวเลือก 2", "C) ตัวเลือก 3", "D) ตัวเลือก 4"],
    "correct_answer": "A",
    "explanation": "คำอธิบายวิธีทำ",
    "difficulty": "easy|medium|hard",
    "skill_name": "ชื่อทักษะ",
    "topic": "หัวข้อ",
    "confidence_score": 0.95
  }
]

IMPORTANT: ส่งคืนเฉพาะ JSON array เท่านั้น ไม่ต้องมีข้อความอื่น`;

    const userPrompt = `กรุณาแปลงโจทย์ต่อไปนี้เป็นข้อสอบ Multiple Choice:

${parsedText}

กรุณาแปลงเป็นชุดละ 10-15 ข้อ และส่งคืนเป็น JSON array`;

    console.log('Calling Lovable AI...');

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. กรุณารอสักครู่แล้วลองใหม่อีกครั้ง' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. กรุณาเติม credits ใน Lovable workspace' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    let questions = [];
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        questions = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid JSON format from AI');
      }
    } else {
      throw new Error('No JSON array found in AI response');
    }

    console.log(`Successfully processed ${questions.length} questions`);

    // Enrich with metadata
    const enrichedQuestions = questions.map((q: any) => ({
      ...q,
      grade,
      semester,
      assessment_type: assessmentType,
      ai_generated: true,
      is_from_pdf: true,
      confidence_score: q.confidence_score || 0.5,
    }));

    return new Response(JSON.stringify({ 
      questions: enrichedQuestions,
      count: enrichedQuestions.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-import-pdf-questions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
