import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Bell, Clock, Send } from "lucide-react";

export default function TestNotifications() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const testMorningAlert = async () => {
    setLoading('morning');
    setResults(null);
    
    try {
      console.log('🌅 Testing morning alert...');
      
      const { data, error } = await supabase.functions.invoke('send-morning-mission-alert', {
        body: { test: true }
      });

      if (error) {
        console.error('❌ Error:', error);
        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
        setResults({ success: false, error: error.message });
      } else {
        console.log('✅ Success:', data);
        toast.success(`ส่ง Morning Alert สำเร็จ! ส่งไปแล้ว ${data.summary?.sent || 0} ข้อความ`);
        setResults(data);
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      toast.error(`เกิดข้อผิดพลาด: ${String(err)}`);
      setResults({ success: false, error: String(err) });
    } finally {
      setLoading(null);
    }
  };

  const testDailyReminder = async () => {
    setLoading('reminder');
    setResults(null);
    
    try {
      console.log('⏰ Testing daily reminder...');
      
      const { data, error } = await supabase.functions.invoke('send-daily-reminder', {
        body: { test: true }
      });

      if (error) {
        console.error('❌ Error:', error);
        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
        setResults({ success: false, error: error.message });
      } else {
        console.log('✅ Success:', data);
        toast.success(`ส่ง Daily Reminder สำเร็จ! ส่งไปแล้ว ${data.summary?.sent || 0} ข้อความ`);
        setResults(data);
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      toast.error(`เกิดข้อผิดพลาด: ${String(err)}`);
      setResults({ success: false, error: String(err) });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Bell className="w-10 h-10 text-yellow-400" />
            ทดสอบการส่ง LINE Notifications
          </h1>
          <p className="text-slate-300">
            ทดสอบการส่งข้อความแจ้งเตือนไปยัง LINE ของผู้ใช้ที่เชื่อมต่อแล้ว
          </p>
        </div>

        {/* Test Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Morning Alert Test */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-400" />
                Morning Alert (8:00 AM)
              </CardTitle>
              <CardDescription className="text-slate-300">
                ทดสอบการส่งข้อความแจ้งเตือนภารกิจใหม่ตอนเช้า
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testMorningAlert}
                disabled={loading !== null}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading === 'morning' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    🌅 ทดสอบส่ง Morning Alert
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Daily Reminder Test */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Daily Reminder (18:00)
              </CardTitle>
              <CardDescription className="text-slate-300">
                ทดสอบการส่งข้อความเตือนความก้าวหน้าตอนเย็น
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testDailyReminder}
                disabled={loading !== null}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading === 'reminder' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    ⏰ ทดสอบส่ง Daily Reminder
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        {results && (
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">ผลการทดสอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                {results.summary && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{results.summary.total}</div>
                      <div className="text-sm text-slate-300">ผู้ใช้ทั้งหมด</div>
                    </div>
                    <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/50">
                      <div className="text-2xl font-bold text-green-400">{results.summary.sent}</div>
                      <div className="text-sm text-slate-300">ส่งสำเร็จ ✓</div>
                    </div>
                    <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/50">
                      <div className="text-2xl font-bold text-red-400">{results.summary.failed}</div>
                      <div className="text-sm text-slate-300">ส่งล้มเหลว ✗</div>
                    </div>
                  </div>
                )}

                {/* Detailed Results */}
                {results.results && results.results.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">รายละเอียด:</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {results.results.map((result: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            result.status === 'success'
                              ? 'bg-green-500/10 border border-green-500/30'
                              : 'bg-red-500/10 border border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{result.user}</span>
                            <span
                              className={`text-sm ${
                                result.status === 'success' ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {result.status === 'success' ? '✓ ส่งสำเร็จ' : '✗ ล้มเหลว'}
                            </span>
                          </div>
                          {result.lineUserId && (
                            <div className="text-xs text-slate-400 mt-1">
                              LINE ID: {result.lineUserId}
                            </div>
                          )}
                          {result.error && (
                            <div className="text-xs text-red-300 mt-1">
                              Error: {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {results.error && (
                  <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-400 mb-2">เกิดข้อผิดพลาด:</h3>
                    <pre className="text-sm text-red-300 whitespace-pre-wrap">
                      {results.error}
                    </pre>
                  </div>
                )}

                {/* Raw Data */}
                <details className="bg-slate-700/50 p-4 rounded-lg">
                  <summary className="cursor-pointer text-white font-medium">
                    ดูข้อมูลแบบเต็ม (JSON)
                  </summary>
                  <pre className="mt-2 text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">📋 คำแนะนำ</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• Morning Alert จะส่งข้อความแจ้งภารกิจใหม่ที่มีอยู่สำหรับวันนี้</p>
            <p>• Daily Reminder จะส่งข้อความเตือนภารกิจที่ยังไม่เสร็จและแสดงความก้าวหน้า</p>
            <p>• ระบบจะส่งไปยังผู้ใช้ที่เชื่อมต่อ LINE แล้วเท่านั้น</p>
            <p>• ตรวจสอบ LINE ของคุณหลังจากกดทดสอบเพื่อยืนยันว่าได้รับข้อความ</p>
            <p>• หากส่งล้มเหลว ตรวจสอบ Edge Function Logs ใน Supabase Dashboard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
