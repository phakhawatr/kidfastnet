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
    const { messages, userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check AI quota
    const { data: quotaData, error: quotaError } = await supabase
      .rpc('check_and_reset_ai_quota', { p_user_id: userId });

    if (quotaError) {
      console.error('Quota check error:', quotaError);
      return new Response(JSON.stringify({ error: 'Failed to check AI quota' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hasQuota = quotaData?.[0]?.has_quota;
    const remainingQuota = quotaData?.[0]?.remaining;

    if (!hasQuota || remainingQuota <= 0) {
      return new Response(JSON.stringify({ 
        error: 'AI quota exceeded',
        message: 'คุณใช้งาน AI ครบโควต้าแล้ว โควต้าจะรีเซ็ตในวันที่ 1 ของเดือนหน้า'
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Lovable AI API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI Gateway with streaming
    const systemPrompt = `คุณคือ AI ครูคณิตศาสตร์และ STEM ที่เป็นมิตร ชื่อ "คุณครูคิดเร็ว STEM" 🎓🔬

ภารกิจของคุณ:
- อธิบายแนวคิดทาง STEM (Science, Technology, Engineering, Mathematics) ด้วยภาษาไทยที่เข้าใจง่าย
- เชื่อมโยงคณิตศาสตร์กับวิทยาศาสตร์ เทคโนโลยี และวิศวกรรม
- ใช้ตัวอย่างจากโลกจริง: การทดลอง, การออกแบบ, เทคโนโลยีในชีวิตประจำวัน
- สอนทีละขั้นตอน พร้อมยกตัวอย่างที่สนุก
- ให้กำลังใจและเชิดชูความพยายาม

สไตล์การสอน STEM:
- 🔬 วิทยาศาสตร์: ใช้ตัวอย่างการทดลอง, ธรรมชาติ, สัตว์พืช
- 💻 เทคโนโลยี: พูดถึง AI, คอมพิวเตอร์, แอป, เกม
- 🏗️ วิศวกรรม: การออกแบบ, การสร้าง, แก้ปัญหาในชีวิตจริง
- 🔢 คณิตศาสตร์: เป็น foundation ของทุกอย่าง

ตัวอย่าง STEM Stories:
- "นักวิทยาศาสตร์ปลูกต้นไม้ แล้วใช้คณิตศาสตร์วัดการเติบโต"
- "วิศวกรออกแบบสะพาน ต้องคำนวณความยาวและน้ำหนัก"
- "โปรแกรมเมอร์สร้างเกม ใช้พิกัด (x, y) จากคณิตศาสตร์"

หลีกเลี่ยง:
- ใช้ศัพท์ยาก ๆ โดยไม่อธิบาย
- ให้คำตอบเต็มทันที (ให้คำใบ้แทน)
- ทำให้เด็กรู้สึกไม่ดีถ้าทำผิด`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'ใช้งาน AI บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required',
          message: 'Workspace ไม่มี credits เพียงพอ กรุณาติดต่อผู้ดูแลระบบ'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment AI usage (fire and forget)
    supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_feature_type: 'ai_math_tutor',
      p_tokens_used: 0 // We'll track this properly later if needed
    }).then(() => {
      console.log('AI usage incremented for user:', userId);
    }).catch(err => {
      console.error('Failed to increment AI usage:', err);
    });

    // Return the stream directly
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });
  } catch (error) {
    console.error('AI Math Tutor error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
