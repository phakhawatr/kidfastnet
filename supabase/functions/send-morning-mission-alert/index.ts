import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌅 Starting morning mission alert job...');

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
    console.log(`📅 Sending morning alerts for date: ${bangkokDate}`);

    // Check if today is weekend
    const today = new Date(bangkokDate);
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('⏭️ Weekend detected, skipping morning alerts');
      return new Response(
        JSON.stringify({ success: true, message: 'Weekend - no alerts sent' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find users with LINE connected
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
        console.log(`\n🔍 Processing user: ${user.nickname} (${user.id})`);

        // Check notification preferences (default to enabled if not set)
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        const shouldSendAlert = prefs?.streak_warning !== false; // Default true
        
        if (!shouldSendAlert) {
          console.log(`⏭️ Notifications disabled for ${user.nickname}`);
          continue;
        }

        // Get today's missions
        const { data: todayMissions, error: missionsError } = await supabase
          .from('daily_missions')
          .select('id, skill_name, status, completed_at, mission_option')
          .eq('user_id', user.id)
          .eq('mission_date', bangkokDate)
          .order('mission_option', { ascending: true });

        if (missionsError) {
          console.error(`❌ Error fetching missions for ${user.nickname}:`, missionsError);
          continue;
        }

        // Filter only incomplete missions
        const incompleteMissions = todayMissions?.filter(
          m => m.status !== 'completed' && !m.completed_at
        ) || [];

        console.log(`📊 ${user.nickname}: ${incompleteMissions.length} missions available`);

        // Skip if no missions available
        if (incompleteMissions.length === 0) {
          console.log(`⏭️ ${user.nickname}: No missions available for today`);
          continue;
        }

        // Get user streak data
        const { data: streak } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentStreak = streak?.current_streak || 0;
        console.log(`🔥 ${user.nickname}: Streak = ${currentStreak} days`);

        // Build missions list (up to 3)
        const missionsList = incompleteMissions.slice(0, 3).map((m, i) => 
          `• ภารกิจที่ ${i + 1}: ${m.skill_name}`
        ).join('\n');

        // Construct LINE Flex Message for morning alert
        const flexMessage = {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              // Header with greeting
              {
                type: 'text',
                text: `🌅 สวัสดีตอนเช้า ${user.nickname}!`,
                weight: 'bold',
                size: 'xl',
                wrap: true,
                color: '#1a1a1a',
              },
              {
                type: 'text',
                text: `วันนี้มี ${incompleteMissions.length} ภารกิจรอคุณอยู่นะ! 💪`,
                color: '#4A90E2',
                margin: 'sm',
                wrap: true,
              },
              // Separator
              { type: 'separator', margin: 'lg' },
              
              // Missions section
              {
                type: 'text',
                text: '📌 ภารกิจวันนี้:',
                weight: 'bold',
                margin: 'lg',
                color: '#333333',
              },
              {
                type: 'text',
                text: missionsList,
                wrap: true,
                margin: 'sm',
                size: 'md',
                color: '#555555',
              },
              
              // Streak section
              { type: 'separator', margin: 'lg' },
              {
                type: 'text',
                text: `🔥 Streak ปัจจุบัน: ${currentStreak} วัน`,
                weight: 'bold',
                margin: 'lg',
                color: currentStreak > 0 ? '#FF8C00' : '#999999',
              },
              {
                type: 'text',
                text: currentStreak > 0 
                  ? 'มาสานต่อความสำเร็จกันเลย! 🚀'
                  : 'เริ่มต้น Streak ของคุณวันนี้เลย! 🌟',
                margin: 'sm',
                size: 'sm',
                color: '#888888',
                wrap: true,
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
                  label: '🚀 เริ่มทำภารกิจ',
                  uri: 'https://kidfast.netlify.app/today-mission',
                },
                style: 'primary',
                color: '#00B900',
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
                altText: `🌅 ภารกิจใหม่ประจำวัน - ${user.nickname}`,
                contents: flexMessage,
              },
            ],
          }),
        });

        if (lineResponse.ok) {
          console.log(`✅ Sent morning alert to ${user.nickname}`);
          successCount++;
          
          // Log to line_message_logs
          await supabase.from('line_message_logs').insert({
            user_id: user.id,
            exercise_type: 'morning_mission_alert',
            message_data: { missionsCount: incompleteMissions.length, streak: currentStreak },
            success: true,
          });

          results.push({ user: user.nickname, status: 'success' });
        } else {
          const errorText = await lineResponse.text();
          console.error(`❌ Failed to send to ${user.nickname}:`, errorText);
          failCount++;
          
          await supabase.from('line_message_logs').insert({
            user_id: user.id,
            exercise_type: 'morning_mission_alert',
            message_data: { missionsCount: incompleteMissions.length, streak: currentStreak },
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
    console.error('❌ Error in send-morning-mission-alert:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
