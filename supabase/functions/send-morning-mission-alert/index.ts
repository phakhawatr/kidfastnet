import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Job tracking variables
  let usersFound = 0;
  let messagesSent = 0;
  let messagesSkipped = 0;
  const skipReasons: { user?: string; reason: string }[] = [];
  const errors: { user?: string; error: string }[] = [];
  const results: any[] = [];

  try {
    console.log('🌅 Starting morning mission alert job...');

    // Get LINE channel access token
    const lineAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!lineAccessToken) {
      console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not configured');
      errors.push({ error: 'LINE_CHANNEL_ACCESS_TOKEN not configured' });
      
      // Log job execution even on config error
      await logJobExecution(supabase, 'send-morning-mission-alert', startTime, {
        usersFound: 0,
        messagesSent: 0,
        messagesSkipped: 0,
        skipReasons,
        errors,
      });
      
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
      skipReasons.push({ reason: `Weekend (day ${dayOfWeek})` });
      
      await logJobExecution(supabase, 'send-morning-mission-alert', startTime, {
        usersFound: 0,
        messagesSent: 0,
        messagesSkipped: 0,
        skipReasons,
        errors,
      });
      
      return new Response(
        JSON.stringify({ success: true, message: 'Weekend - no alerts sent', skipReasons }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find users with LINE connected
    console.log('📋 Query: Fetching users with LINE connected');
    
    const { data: users, error: usersError } = await supabase
      .from('user_registrations')
      .select(`
        id,
        nickname,
        line_user_id,
        line_user_id_2,
        parent_email
      `)
      .or('line_user_id.not.is.null,line_user_id_2.not.is.null');

    if (usersError) {
      console.error('❌ Error fetching users:', JSON.stringify(usersError));
      errors.push({ error: `Database error: ${usersError.message}` });
      
      await logJobExecution(supabase, 'send-morning-mission-alert', startTime, {
        usersFound: 0,
        messagesSent: 0,
        messagesSkipped: 0,
        skipReasons,
        errors,
      });
      
      throw usersError;
    }

    usersFound = users?.length || 0;
    console.log(`✅ Found ${usersFound} users with LINE:`, 
      users?.map(u => ({ nickname: u.nickname, hasLine1: !!u.line_user_id, hasLine2: !!u.line_user_id_2 }))
    );

    // If no users found, log and return
    if (usersFound === 0) {
      skipReasons.push({ reason: 'No users with LINE connected' });
      
      await logJobExecution(supabase, 'send-morning-mission-alert', startTime, {
        usersFound: 0,
        messagesSent: 0,
        messagesSkipped: 0,
        skipReasons,
        errors,
      });
      
      return new Response(
        JSON.stringify({ success: true, message: 'No users with LINE connected', skipReasons }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          messagesSkipped++;
          skipReasons.push({ user: user.nickname, reason: 'Notifications disabled by user' });
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
          errors.push({ user: user.nickname, error: `Missions fetch error: ${missionsError.message}` });
          continue;
        }

        // Filter only incomplete missions
        const incompleteMissions = todayMissions?.filter(
          m => m.status !== 'completed' && !m.completed_at
        ) || [];

        console.log(`📊 ${user.nickname}: ${todayMissions?.length || 0} total missions, ${incompleteMissions.length} incomplete`);

        // Get user streak data
        const { data: streak } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentStreak = streak?.current_streak || 0;
        console.log(`🔥 ${user.nickname}: Streak = ${currentStreak} days`);

        // Determine message content based on mission availability
        let flexMessage;
        let altText;
        
        if (incompleteMissions.length === 0 && (!todayMissions || todayMissions.length === 0)) {
          // No missions generated yet - send "preparing" message
          console.log(`📌 ${user.nickname}: No missions yet, sending preparation message`);
          
          flexMessage = {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
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
                  text: 'กำลังเตรียมภารกิจให้คุณอยู่นะ! 🎯',
                  color: '#4A90E2',
                  margin: 'sm',
                  wrap: true,
                },
                { type: 'separator', margin: 'lg' },
                {
                  type: 'text',
                  text: '📌 ภารกิจวันนี้กำลังถูกสร้างโดย AI',
                  weight: 'bold',
                  margin: 'lg',
                  color: '#333333',
                },
                {
                  type: 'text',
                  text: 'เข้ามาตรวจสอบภารกิจของคุณในแอพได้เลย!',
                  wrap: true,
                  margin: 'sm',
                  size: 'md',
                  color: '#555555',
                },
                { type: 'separator', margin: 'lg' },
                {
                  type: 'text',
                  text: `🔥 Streak ปัจจุบัน: ${currentStreak} วัน`,
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
                    label: '🚀 เข้าดูภารกิจ',
                    uri: 'https://kidfast.netlify.app/today-mission',
                  },
                  style: 'primary',
                  color: '#00B900',
                },
              ],
            },
          };
          altText = `🌅 ภารกิจวันนี้กำลังเตรียมให้คุณ - ${user.nickname}`;
          
        } else if (incompleteMissions.length === 0) {
          // All missions completed - send congratulations
          console.log(`🎉 ${user.nickname}: All missions completed`);
          messagesSkipped++;
          skipReasons.push({ user: user.nickname, reason: 'All missions already completed' });
          continue;
          
        } else {
          // Has incomplete missions - send normal alert
          const missionsList = incompleteMissions.slice(0, 3).map((m, i) => 
            `• ภารกิจที่ ${i + 1}: ${m.skill_name}`
          ).join('\n');

          flexMessage = {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
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
                { type: 'separator', margin: 'lg' },
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
          altText = `🌅 ภารกิจใหม่ประจำวัน - ${user.nickname}`;
        }

        // Send LINE message to both accounts if connected
        const lineUserIds = [user.line_user_id, user.line_user_id_2].filter(Boolean);
        
        for (const lineUserId of lineUserIds) {
          const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lineAccessToken}`,
            },
            body: JSON.stringify({
              to: lineUserId,
              messages: [
                {
                  type: 'flex',
                  altText,
                  contents: flexMessage,
                },
              ],
            }),
          });

          if (lineResponse.ok) {
            console.log(`✅ Sent morning alert to ${user.nickname} (${lineUserId})`);
            messagesSent++;
            
            // Log to line_message_logs
            await supabase.from('line_message_logs').insert({
              user_id: user.id,
              exercise_type: 'morning_mission_alert',
              message_data: { 
                missionsCount: incompleteMissions.length, 
                hasMissions: (todayMissions?.length || 0) > 0,
                streak: currentStreak, 
                lineUserId 
              },
              success: true,
            });

            results.push({ user: user.nickname, status: 'success', lineUserId });
          } else {
            const errorText = await lineResponse.text();
            console.error(`❌ Failed to send to ${user.nickname} (${lineUserId}):`, errorText);
            errors.push({ user: user.nickname, error: `LINE API error: ${errorText}` });
            
            await supabase.from('line_message_logs').insert({
              user_id: user.id,
              exercise_type: 'morning_mission_alert',
              message_data: { missionsCount: incompleteMissions.length, streak: currentStreak, lineUserId },
              success: false,
              error_message: errorText,
            });

            results.push({ user: user.nickname, status: 'failed', error: errorText, lineUserId });
          }
        }

      } catch (userError) {
        console.error(`❌ Error processing user ${user.nickname}:`, userError);
        errors.push({ user: user.nickname, error: String(userError) });
        results.push({ user: user.nickname, status: 'error', error: String(userError) });
      }
    }

    console.log(`\n📊 Summary: ${messagesSent} sent, ${messagesSkipped} skipped, ${errors.length} errors`);

    // Log job execution
    await logJobExecution(supabase, 'send-morning-mission-alert', startTime, {
      usersFound,
      messagesSent,
      messagesSkipped,
      skipReasons,
      errors,
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: usersFound,
          sent: messagesSent,
          skipped: messagesSkipped,
          errors: errors.length,
        },
        skipReasons,
        errors,
        results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-morning-mission-alert:', error);
    errors.push({ error: String(error) });
    
    // Log job execution even on error
    await logJobExecution(supabase, 'send-morning-mission-alert', startTime, {
      usersFound,
      messagesSent,
      messagesSkipped,
      skipReasons,
      errors,
    });
    
    return new Response(
      JSON.stringify({ success: false, error: String(error), skipReasons, errors }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to log job execution
async function logJobExecution(
  supabase: any, 
  jobName: string, 
  startTime: number,
  data: {
    usersFound: number;
    messagesSent: number;
    messagesSkipped: number;
    skipReasons: any[];
    errors: any[];
  }
) {
  const executionTimeMs = Date.now() - startTime;
  
  try {
    await supabase.from('notification_job_logs').insert({
      job_name: jobName,
      users_found: data.usersFound,
      messages_sent: data.messagesSent,
      messages_skipped: data.messagesSkipped,
      skip_reasons: data.skipReasons,
      errors: data.errors,
      execution_time_ms: executionTimeMs,
    });
    console.log(`📝 Job execution logged: ${jobName} (${executionTimeMs}ms)`);
  } catch (logError) {
    console.error('❌ Failed to log job execution:', logError);
  }
}
