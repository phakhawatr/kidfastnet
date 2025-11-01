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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('LINE Webhook received:', JSON.stringify(body, null, 2));

    // Handle webhook events
    if (body.events && body.events.length > 0) {
      for (const event of body.events) {
        const lineUserId = event.source.userId;

        // Handle follow event (user added friend)
        if (event.type === 'follow') {
          console.log('User added friend:', lineUserId);
          
          // Send welcome message
          await sendLineMessage(lineUserId, {
            type: 'text',
            text: '🎉 ยินดีต้อนรับสู่ KidFast!\n\nเพื่อรับผลการเรียนของบุตรหลาน:\n1. เข้าสู่ระบบ KidFast\n2. ไปที่หน้า "โปรไฟล์"\n3. กดปุ่ม "เชื่อมต่อบัญชี LINE"\n4. ส่งรหัส 6 หลักมาที่นี่\n\nแล้วระบบจะส่งผลการเรียนมาให้อัตโนมัติ! ✨'
          });
        }

        // Handle message event (user sent text)
        if (event.type === 'message' && event.message.type === 'text') {
          const messageText = event.message.text.trim();
          console.log('User sent message:', messageText);

          // Check if it's a 6-digit link code
          if (/^\d{6}$/.test(messageText)) {
            console.log('Received link code:', messageText);

            // Find the link code in database
            const { data: linkCode, error: linkError } = await supabase
              .from('line_link_codes')
              .select('*, user_registrations(id, nickname, parent_email)')
              .eq('link_code', messageText)
              .is('used_at', null)
              .gt('expires_at', new Date().toISOString())
              .single();

            if (linkError || !linkCode) {
              console.error('Link code not found or expired:', linkError);
              await sendLineMessage(lineUserId, {
                type: 'text',
                text: '❌ รหัสไม่ถูกต้องหรือหมดอายุแล้ว\n\nกรุณาสร้างรหัสใหม่ในหน้าโปรไฟล์'
              });
              continue;
            }

            // Get LINE profile
            const lineProfile = await getLineProfile(lineUserId);
            
            // Update link code as used
            await supabase
              .from('line_link_codes')
              .update({
                line_user_id: lineUserId,
                used_at: new Date().toISOString()
              })
              .eq('link_code', messageText);

            // Update user registration with LINE info
            const { error: updateError } = await supabase
              .from('user_registrations')
              .update({
                line_user_id: lineUserId,
                line_display_name: lineProfile.displayName,
                line_picture_url: lineProfile.pictureUrl,
                line_connected_at: new Date().toISOString()
              })
              .eq('id', linkCode.user_id);

            if (updateError) {
              console.error('Failed to update user:', updateError);
              await sendLineMessage(lineUserId, {
                type: 'text',
                text: '❌ เกิดข้อผิดพลาดในการเชื่อมต่อ\n\nกรุณาลองใหม่อีกครั้ง'
              });
              continue;
            }

            console.log('Successfully linked account for user:', linkCode.user_id);

            // Send success message
            await sendLineMessage(lineUserId, {
              type: 'text',
              text: `✅ เชื่อมต่อสำเร็จ!\n\nบัญชี: ${(linkCode.user_registrations as any).nickname}\nอีเมล: ${(linkCode.user_registrations as any).parent_email}\n\nตอนนี้เราจะส่งผลการเรียนมาให้อัตโนมัติแล้ว! 🎉`
            });
          }
        }

        // Handle unfollow event
        if (event.type === 'unfollow') {
          console.log('User unfollowed:', lineUserId);
          
          // Disconnect LINE account
          await supabase
            .from('user_registrations')
            .update({
              line_user_id: null,
              line_display_name: null,
              line_picture_url: null,
              line_connected_at: null
            })
            .eq('line_user_id', lineUserId);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendLineMessage(userId: string, message: any) {
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [message]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send LINE message:', errorText);
    throw new Error(`Failed to send LINE message: ${response.status}`);
  }

  return response.json();
}

async function getLineProfile(userId: string) {
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  
  const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${channelAccessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get LINE profile');
  }

  return response.json();
}
