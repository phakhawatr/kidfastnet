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

        // Check for missions today with detailed info
        const { data: todayMissions, error: missionsError } = await supabase
          .from('daily_missions')
          .select('id, skill_name, status, completed_at, total_questions, correct_answers, stars_earned')
          .eq('user_id', user.id)
          .eq('mission_date', bangkokDate);

        if (missionsError) {
          console.error(`❌ Error fetching missions for ${user.nickname}:`, missionsError);
          continue;
        }

        // Separate completed and incomplete missions
        const completedMissions = todayMissions?.filter(
          m => m.status === 'completed' || m.completed_at !== null
        ) || [];

        const incompleteMissions = todayMissions?.filter(
          m => m.status !== 'completed' && !m.completed_at
        ) || [];

        console.log(`📊 ${user.nickname}: ${completedMissions.length} completed, ${incompleteMissions.length} incomplete missions`);

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

        // Generate progress token (expires in 1 hour)
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await supabase.from('progress_view_tokens').insert({
          token,
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
        });

        // Build completed missions list with accuracy
        const completedList = completedMissions.map(m => {
          const accuracy = m.total_questions > 0 
            ? Math.round((m.correct_answers / m.total_questions) * 100) 
            : 0;
          const passStatus = accuracy >= 80 ? 'ผ่าน' : 'ไม่ผ่าน';
          const stars = '⭐'.repeat(m.stars_earned || 0);
          return `• ${m.skill_name} - ${accuracy}% (${passStatus} ${stars})`;
        }).join('\n');

        // Build incomplete missions list
        const incompleteList = incompleteMissions.map((m, i) => 
          `• ${m.skill_name || `ภารกิจที่ ${i + 1}`}`
        ).join('\n');

        // Construct new LINE Flex Message with detailed mission info
        const flexMessage = {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              // Header with greeting
              {
                type: 'text',
                text: `⏰ สวัสดีท่านผู้ปกครองของ ${user.nickname} !`,
                weight: 'bold',
                size: 'lg',
                wrap: true,
                color: '#1a1a1a',
              },
              {
                type: 'text',
                text: incompleteMissions.length > 0 
                  ? 'ภารกิจวันนี้ยังไม่เสร็จนะครับ !'
                  : 'ยอดเยี่ยม! ภารกิจวันนี้เสร็จหมดแล้ว! 🎉',
                color: incompleteMissions.length > 0 ? '#FF6B6B' : '#00B900',
                margin: 'sm',
                wrap: true,
              },
              // Separator
              { type: 'separator', margin: 'lg' },
              
              // Completed section (if any)
              ...(completedMissions.length > 0 ? [
                {
                  type: 'text',
                  text: `✅ เสร็จแล้ว : ${completedMissions.length} ภารกิจ ได้แก่`,
                  weight: 'bold',
                  margin: 'lg',
                  color: '#00B900',
                },
                {
                  type: 'text',
                  text: completedList,
                  wrap: true,
                  margin: 'sm',
                  size: 'sm',
                  color: '#555555',
                },
              ] : []),
              
              // Incomplete section (if any)
              ...(incompleteMissions.length > 0 ? [
                {
                  type: 'text',
                  text: `⏳ เหลืออีก: ${incompleteMissions.length} ภารกิจ ได้แก่`,
                  weight: 'bold',
                  margin: 'lg',
                  color: '#FF6B6B',
                },
                {
                  type: 'text',
                  text: incompleteList,
                  wrap: true,
                  margin: 'sm',
                  size: 'sm',
                  color: '#555555',
                },
              ] : []),
              
              // Streak section
              { type: 'separator', margin: 'lg' },
              {
                type: 'text',
                text: `🔥 Streak: ${currentStreak} วัน`,
                weight: 'bold',
                margin: 'lg',
                color: currentStreak > 0 ? '#FF8C00' : '#999999',
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
                  label: '🚀 ดูความก้าวหน้า',
                  uri: `https://kidfast.netlify.app/view-progress?token=${token}`,
                },
                style: 'primary',
                color: '#4A90E2',
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
                altText: `⏰ เตือนความก้าวหน้าภารกิจ - ${user.nickname}`,
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
