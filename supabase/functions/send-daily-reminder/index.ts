import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderPayload {
  type: 'daily_reminder';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Starting daily reminder notification job...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get LINE channel access token
    const lineAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!lineAccessToken) {
      console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'LINE token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's date in Bangkok timezone
    const bangkokDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    console.log(`📅 Processing reminders for date: ${bangkokDate}`);

    // Find users who:
    // 1. Have LINE connected (line_user_id is not null)
    // 2. Have notification preferences enabled (or default to true)
    // 3. Have pending missions today OR have an active streak
    const { data: users, error: usersError } = await supabase
      .from('user_registrations')
      .select(`
        id,
        nickname,
        line_user_id,
        parent_email
      `)
      .not('line_user_id', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`👥 Found ${users?.length || 0} users with LINE connected`);

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (const user of users || []) {
      try {
        console.log(`\n🔍 Checking user: ${user.nickname} (${user.id})`);

        // Check notification preferences (default to enabled if not set)
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        const shouldSendReminder = prefs?.streak_warning !== false; // Default true
        
        if (!shouldSendReminder) {
          console.log(`⏭️ Notifications disabled for ${user.nickname}`);
          continue;
        }

        // Check for pending missions today
        const { data: todayMissions, error: missionsError } = await supabase
          .from('daily_missions')
          .select('id, skill_name, status, completed_at')
          .eq('user_id', user.id)
          .eq('mission_date', bangkokDate);

        if (missionsError) {
          console.error(`❌ Error fetching missions for ${user.nickname}:`, missionsError);
          continue;
        }

        // Count incomplete missions
        const incompleteMissions = todayMissions?.filter(
          m => m.status !== 'completed' && !m.completed_at
        ) || [];

        console.log(`📊 ${user.nickname}: ${incompleteMissions.length} incomplete missions`);

        // Get user streak data
        const { data: streak } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentStreak = streak?.current_streak || 0;
        console.log(`🔥 ${user.nickname}: Streak = ${currentStreak} days`);

        // Determine if we should send reminder
        const shouldRemind = incompleteMissions.length > 0;

        if (!shouldRemind) {
          console.log(`✅ ${user.nickname}: All missions complete, skipping`);
          continue;
        }

        // Build message based on streak status
        const hasStreak = currentStreak > 0;
        let message = '';
        let emoji = '';

        if (hasStreak && currentStreak >= 7) {
          emoji = '🔥';
          message = `อย่าลืมทำภารกิจวันนี้นะ!\n\nStreak ${currentStreak} วันของ ${user.nickname} กำลังจะหาย! ⚠️\n\nเหลือภารกิจที่ยังไม่เสร็จ: ${incompleteMissions.length} ภารกิจ\n\nกดปุ่มด้านล่างเพื่อทำภารกิจต่อ 💪`;
        } else if (hasStreak) {
          emoji = '⏰';
          message = `สวัสดีตอนเย็น! ภารกิจวันนี้ของ ${user.nickname} ยังไม่เสร็จนะ\n\nเหลืออีก: ${incompleteMissions.length} ภารกิจ\n\n${currentStreak > 0 ? `Streak ปัจจุบัน: ${currentStreak} วัน 🔥` : ''}\n\nกดปุ่มด้านล่างเพื่อทำภารกิจ`;
        } else {
          emoji = '🎯';
          message = `ภารกิจวันนี้ของ ${user.nickname} ยังไม่เสร็จนะ\n\nเหลืออีก: ${incompleteMissions.length} ภารกิจ\n\nมาเริ่มสร้าง Streak กันเถอะ! 🚀`;
        }

        // Construct LINE Flex Message
        const flexMessage = {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: emoji,
                size: '5xl',
                align: 'center',
              },
            ],
            backgroundColor: hasStreak && currentStreak >= 7 ? '#FF6B6B' : '#4A90E2',
            paddingAll: '20px',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: hasStreak && currentStreak >= 7 ? '⚠️ Streak ใกล้หาย!' : '🎯 เตือนทำภารกิจ',
                weight: 'bold',
                size: 'xl',
                color: hasStreak && currentStreak >= 7 ? '#FF6B6B' : '#4A90E2',
              },
              {
                type: 'text',
                text: message,
                wrap: true,
                margin: 'md',
                color: '#666666',
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '🚀 ทำภารกิจเลย',
                  uri: 'https://kidfastai.com/today-mission',
                },
                style: 'primary',
                color: hasStreak && currentStreak >= 7 ? '#FF6B6B' : '#4A90E2',
              },
            ],
          },
        };

        // Send LINE message
        const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineAccessToken}`,
          },
          body: JSON.stringify({
            to: user.line_user_id,
            messages: [
              {
                type: 'flex',
                altText: `${emoji} เตือนทำภารกิจประจำวัน - ${user.nickname}`,
                contents: flexMessage,
              },
            ],
          }),
        });

        if (lineResponse.ok) {
          console.log(`✅ Sent reminder to ${user.nickname}`);
          successCount++;
          
          // Log to line_message_logs
          await supabase.from('line_message_logs').insert({
            user_id: user.id,
            exercise_type: 'daily_reminder',
            message_data: { incompleteMissions: incompleteMissions.length, streak: currentStreak },
            success: true,
          });

          results.push({ user: user.nickname, status: 'success' });
        } else {
          const errorText = await lineResponse.text();
          console.error(`❌ Failed to send to ${user.nickname}:`, errorText);
          failCount++;
          
          await supabase.from('line_message_logs').insert({
            user_id: user.id,
            exercise_type: 'daily_reminder',
            message_data: { incompleteMissions: incompleteMissions.length, streak: currentStreak },
            success: false,
            error_message: errorText,
          });

          results.push({ user: user.nickname, status: 'failed', error: errorText });
        }

      } catch (userError) {
        console.error(`❌ Error processing user ${user.nickname}:`, userError);
        failCount++;
        results.push({ user: user.nickname, status: 'error', error: String(userError) });
      }
    }

    console.log(`\n📊 Summary: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: users?.length || 0,
          sent: successCount,
          failed: failCount,
        },
        results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-daily-reminder:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
