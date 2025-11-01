import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      userId,
      exerciseType,
      nickname,
      score,
      total,
      percentage,
      timeSpent,
      level,
      problems
    } = await req.json()

    console.log('Sending LINE notification for user:', userId, 'Exercise:', exerciseType)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get LINE Notify token from user_registrations
    const { data: userData, error: userError } = await supabase
      .from('user_registrations')
      .select('line_notify_token')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user data:', userError)
      return new Response(
        JSON.stringify({ error: 'ไม่พบข้อมูลผู้ใช้' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const lineToken = userData.line_notify_token

    if (!lineToken) {
      console.log('No LINE Notify token found for user')
      return new Response(
        JSON.stringify({ error: 'ยังไม่ได้ตั้งค่า LINE Notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Map exercise type to Thai
    const exerciseTypeMap: Record<string, string> = {
      addition: 'บวกเลข',
      subtraction: 'ลบเลข',
      multiplication: 'คูณ',
      division: 'หาร',
      test: 'ทดสอบระบบ'
    }

    const exerciseNameThai = exerciseTypeMap[exerciseType] || exerciseType

    // Build message header
    let message = `🎯 ผลการทำโจทย์คณิตศาสตร์\n\n`
    message += `👤 นักเรียน: ${nickname}\n`
    message += `📚 ประเภท: ${exerciseNameThai}\n`
    message += `⭐ คะแนน: ${score}/${total} (${percentage}%)\n`
    message += `⏱️ เวลา: ${timeSpent}\n`
    message += `📊 ระดับ: ${level}\n\n`

    // Build detailed results
    let detailsText = '📝 รายละเอียดการตอบ:\n\n'

    if (problems && problems.length > 0) {
      // Check if message would be too long
      const testMessage = problems.map((p: any) => {
        const emoji = p.isCorrect ? '✓' : '✗'
        const status = p.isCorrect ? '(ถูก)' : `(ผิด, เฉลย: ${p.correctAnswer})`
        return `${emoji} ข้อ ${p.questionNumber}: ${p.question}=${p.userAnswer} ${status}`
      }).join('\n')

      const fullMessage = message + detailsText + testMessage

      // LINE Notify has ~1000 character limit
      if (fullMessage.length > 950) {
        // Show condensed format: correct answers summary + wrong problems only
        const wrongProblems = problems.filter((p: any) => !p.isCorrect)
        const correctNumbers = problems
          .filter((p: any) => p.isCorrect)
          .map((p: any) => p.questionNumber)
          .join(', ')

        detailsText += `✓ ถูก ${score} ข้อ: ${correctNumbers || 'ไม่มี'}\n\n`

        if (wrongProblems.length > 0) {
          detailsText += '✗ ข้อที่ตอบผิด:\n'
          for (const p of wrongProblems) {
            detailsText += `ข้อ ${p.questionNumber}: ${p.question}=${p.userAnswer} (เฉลย: ${p.correctAnswer})\n`
          }
        }
      } else {
        // Show all problems in detail
        for (const p of problems) {
          const emoji = p.isCorrect ? '✓' : '✗'
          const status = p.isCorrect ? '(ถูก)' : `(ผิด, เฉลย: ${p.correctAnswer})`
          detailsText += `${emoji} ข้อ ${p.questionNumber}: ${p.question}=${p.userAnswer} ${status}\n`
        }
      }
    }

    // Add footer message
    message += detailsText + '\n'

    // Add encouraging message based on percentage
    if (percentage >= 80) {
      message += '💡 คำแนะนำ: 🌟 เก่งมาก! ทำได้ดีมากเลยค่ะ\n'
    } else if (percentage >= 60) {
      message += '💡 คำแนะนำ: 👍 ดีมาก ลองฝึกเพิ่มอีกนิดจะยอดเยี่ยมแน่นอน\n'
    } else {
      message += '💡 คำแนะนำ: 📖 ลองทบทวนและฝึกเพิ่มเติมนะคะ\n'
    }

    message += '\n🎓 ขอบคุณที่ใช้ KidFast.net'

    console.log('Sending LINE message, length:', message.length)

    // Send to LINE Notify API
    const lineResponse = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lineToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    })

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text()
      console.error('LINE Notify error:', errorText)
      return new Response(
        JSON.stringify({ error: 'ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบ LINE Notify Token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const result = await lineResponse.json()
    console.log('LINE Notify success:', result)

    return new Response(
      JSON.stringify({ success: true, message: 'ส่งข้อความสำเร็จ' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in send-line-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
