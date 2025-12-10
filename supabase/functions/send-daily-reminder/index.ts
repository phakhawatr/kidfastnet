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
    console.log('🔔 Starting daily reminder notification job...');

    // Get LINE channel access token
    const lineAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!lineAccessToken) {
      console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not configured');
      errors.push({ error: 'LINE_CHANNEL_ACCESS_TOKEN not configured' });
      
      await logJobExecution(supabase, 'send-daily-reminder', startTime, {
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
    console.log(`📅 Processing reminders for date: ${bangkokDate}`);

    // Check if today is weekend
    const today = new Date(bangkokDate);
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('⏭️ Weekend detected, skipping daily reminders');
      skipReasons.push({ reason: `Weekend (day ${dayOfWeek})` });
      
      await logJobExecution(supabase, 'send-daily-reminder', startTime, {
        usersFound: 0,
        messagesSent: 0,
        messagesSkipped: 0,
        skipReasons,
        errors,
      });
      
      return new Response(
        JSON.stringify({ success: true, message: 'Weekend - no reminders sent', skipReasons }),
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
      
      await logJobExecution(supabase, 'send-daily-reminder', startTime, {
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
      
      await logJobExecution(supabase, 'send-daily-reminder', startTime, {
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
          messagesSkipped++;
          skipReasons.push({ user: user.nickname, reason: 'Notifications disabled by user' });
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
          errors.push({ user: user.nickname, error: `Missions fetch error: ${missionsError.message}` });
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

        // Determine message type based on mission status
        let flexMessage;
        let altText;
        let shouldSend = true;

        if (!todayMissions || todayMissions.length === 0) {
          // No missions at all today - send reminder to check app
          console.log(`📌 ${user.nickname}: No missions today, sending check-in reminder`);
          
          flexMessage = {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
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
                  text: 'วันนี้ยังไม่ได้เข้ามาทำภารกิจเลยนะครับ',
                  color: '#FF6B6B',
                  margin: 'sm',
                  wrap: true,
                },
                { type: 'separator', margin: 'lg' },
                {
                  type: 'text',
                  text: '💡 เข้ามาสร้างภารกิจใหม่ได้เลย!',
                  weight: 'bold',
                  margin: 'lg',
                  color: '#4A90E2',
                },
                { type: 'separator', margin: 'lg' },
                {
                  type: 'text',
                  text: `🔥 Streak: ${currentStreak} วัน`,
                  weight: 'bold',
                  margin: 'lg',
                  color: currentStreak > 0 ? '#FF8C00' : '#999999',
                },
                ...(currentStreak > 0 ? [{
                  type: 'text',
                  text: '⚠️ อย่าลืมทำภารกิจเพื่อรักษา Streak!',
                  margin: 'sm',
                  size: 'sm',
                  color: '#FF6B6B',
                  wrap: true,
                }] : []),
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
                    label: '🚀 เข้าทำภารกิจเลย',
                    uri: 'https://kidfast.netlify.app/today-mission',
                  },
                  style: 'primary',
                  color: '#00B900',
                },
              ],
            },
          };
          altText = `⏰ วันนี้ยังไม่ได้ทำภารกิจ - ${user.nickname}`;
          
        } else if (incompleteMissions.length === 0) {
          // All missions completed - send congratulations
          console.log(`🎉 ${user.nickname}: All missions completed, sending congratulations`);
          
          const totalStars = completedMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0);
          const avgAccuracy = completedMissions.length > 0
            ? Math.round(completedMissions.reduce((sum, m) => {
                const acc = m.total_questions > 0 ? (m.correct_answers / m.total_questions) * 100 : 0;
                return sum + acc;
              }, 0) / completedMissions.length)
            : 0;

          flexMessage = {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: `🎉 ยินดีด้วย ${user.nickname}!`,
                  weight: 'bold',
                  size: 'xl',
                  wrap: true,
                  color: '#1a1a1a',
                },
                {
                  type: 'text',
                  text: 'ทำภารกิจวันนี้เสร็จหมดแล้ว! เก่งมาก! 🌟',
                  color: '#00B900',
                  margin: 'sm',
                  wrap: true,
                },
                { type: 'separator', margin: 'lg' },
                {
                  type: 'text',
                  text: '📊 สรุปผลวันนี้:',
                  weight: 'bold',
                  margin: 'lg',
                  color: '#333333',
                },
                {
                  type: 'text',
                  text: `✅ ภารกิจสำเร็จ: ${completedMissions.length} ภารกิจ\n⭐ ดาวที่ได้: ${totalStars} ดวง\n📈 ความแม่นยำเฉลี่ย: ${avgAccuracy}%`,
                  wrap: true,
                  margin: 'sm',
                  size: 'md',
                  color: '#555555',
                },
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
                    label: '📊 ดูความก้าวหน้าเพิ่มเติม',
                    uri: 'https://kidfast.netlify.app/training-calendar',
                  },
                  style: 'primary',
                  color: '#4A90E2',
                },
              ],
            },
          };
          altText = `🎉 ยินดีด้วย! ภารกิจวันนี้เสร็จหมดแล้ว - ${user.nickname}`;
          
        } else {
          // Has incomplete missions - send reminder
          console.log(`⏳ ${user.nickname}: ${incompleteMissions.length} incomplete missions`);

          // Generate progress token (expires in 72 hours / 3 days)
          const token = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 72);

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

          flexMessage = {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
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
                  text: 'ภารกิจวันนี้ยังไม่เสร็จนะครับ !',
                  color: '#FF6B6B',
                  margin: 'sm',
                  wrap: true,
                },
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
                
                // Incomplete section
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
                
                // Streak section
                { type: 'separator', margin: 'lg' },
                {
                  type: 'text',
                  text: `🔥 Streak: ${currentStreak} วัน`,
                  weight: 'bold',
                  margin: 'lg',
                  color: currentStreak > 0 ? '#FF8C00' : '#999999',
                },
                ...(currentStreak > 0 ? [{
                  type: 'text',
                  text: '⚠️ ทำภารกิจให้เสร็จเพื่อรักษา Streak!',
                  margin: 'sm',
                  size: 'sm',
                  color: '#FF6B6B',
                  wrap: true,
                }] : []),
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
          altText = `⏰ เตือนความก้าวหน้าภารกิจ - ${user.nickname}`;
        }

        if (!shouldSend) {
          continue;
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
            console.log(`✅ Sent reminder to ${user.nickname} (${lineUserId})`);
            messagesSent++;
            
            // Log to line_message_logs
            await supabase.from('line_message_logs').insert({
              user_id: user.id,
              exercise_type: 'daily_reminder',
              message_data: { 
                completedMissions: completedMissions.length,
                incompleteMissions: incompleteMissions.length, 
                streak: currentStreak, 
                lineUserId,
                messageType: incompleteMissions.length === 0 ? 'congratulations' : (todayMissions?.length === 0 ? 'no_missions' : 'reminder'),
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
              exercise_type: 'daily_reminder',
              message_data: { incompleteMissions: incompleteMissions.length, streak: currentStreak, lineUserId },
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
    await logJobExecution(supabase, 'send-daily-reminder', startTime, {
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
    console.error('❌ Error in send-daily-reminder:', error);
    errors.push({ error: String(error) });
    
    // Log job execution even on error
    await logJobExecution(supabase, 'send-daily-reminder', startTime, {
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
