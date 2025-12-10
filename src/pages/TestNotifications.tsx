import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Bell, Clock, Send, RefreshCw, History, AlertTriangle } from "lucide-react";

interface JobLog {
  id: string;
  job_name: string;
  triggered_at: string;
  users_found: number;
  messages_sent: number;
  messages_skipped: number | null;
  skip_reasons: any[] | null;
  errors: any[] | null;
  execution_time_ms: number | null;
}

export default function TestNotifications() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchJobLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('notification_job_logs')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching job logs:', error);
      } else {
        setJobLogs((data || []) as JobLog[]);
      }
    } catch (err) {
      console.error('Exception fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchJobLogs();
  }, []);

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
        // Refresh logs after test
        setTimeout(fetchJobLogs, 1000);
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
        // Refresh logs after test
        setTimeout(fetchJobLogs, 1000);
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      toast.error(`เกิดข้อผิดพลาด: ${String(err)}`);
      setResults({ success: false, error: String(err) });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{results.summary.total}</div>
                      <div className="text-sm text-slate-300">ผู้ใช้ทั้งหมด</div>
                    </div>
                    <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/50">
                      <div className="text-2xl font-bold text-green-400">{results.summary.sent}</div>
                      <div className="text-sm text-slate-300">ส่งสำเร็จ ✓</div>
                    </div>
                    <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-500/50">
                      <div className="text-2xl font-bold text-yellow-400">{results.summary.skipped || 0}</div>
                      <div className="text-sm text-slate-300">ข้าม</div>
                    </div>
                    <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/50">
                      <div className="text-2xl font-bold text-red-400">{results.summary.errors || results.summary.failed || 0}</div>
                      <div className="text-sm text-slate-300">ผิดพลาด ✗</div>
                    </div>
                  </div>
                )}

                {/* Skip Reasons */}
                {results.skipReasons && results.skipReasons.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      เหตุผลที่ข้าม ({results.skipReasons.length}):
                    </h3>
                    <ul className="text-sm text-yellow-300 space-y-1">
                      {results.skipReasons.map((reason: any, index: number) => (
                        <li key={index}>
                          {reason.user ? `• ${reason.user}: ${reason.reason}` : `• ${reason.reason}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Errors */}
                {results.errors && results.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-400 mb-2">ข้อผิดพลาด ({results.errors.length}):</h3>
                    <ul className="text-sm text-red-300 space-y-1">
                      {results.errors.map((err: any, index: number) => (
                        <li key={index}>
                          {err.user ? `• ${err.user}: ${err.error}` : `• ${err.error}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Results */}
                {results.results && results.results.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">รายละเอียดการส่ง:</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
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
                              LINE ID: {result.lineUserId.substring(0, 20)}...
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

                {/* Raw Data */}
                <details className="bg-slate-700/50 p-4 rounded-lg">
                  <summary className="cursor-pointer text-white font-medium">
                    ดูข้อมูลแบบเต็ม (JSON)
                  </summary>
                  <pre className="mt-2 text-xs text-slate-300 overflow-x-auto max-h-48">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Logs History */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <History className="w-6 h-6 text-purple-400" />
                ประวัติการทำงาน (Job Logs)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchJobLogs}
                disabled={loadingLogs}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                {loadingLogs ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <CardDescription className="text-slate-300">
              ประวัติการเรียก Edge Functions ล่าสุด 20 รายการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobLogs.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                ยังไม่มีประวัติการทำงาน
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 text-slate-300">เวลา</th>
                      <th className="text-left p-2 text-slate-300">Job</th>
                      <th className="text-center p-2 text-slate-300">ผู้ใช้</th>
                      <th className="text-center p-2 text-slate-300">ส่ง</th>
                      <th className="text-center p-2 text-slate-300">ข้าม</th>
                      <th className="text-center p-2 text-slate-300">ผิดพลาด</th>
                      <th className="text-right p-2 text-slate-300">เวลา(ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 text-slate-300 text-xs">
                          {formatDate(log.triggered_at)}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.job_name.includes('morning') 
                              ? 'bg-orange-500/20 text-orange-300' 
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {log.job_name.includes('morning') ? '🌅 Morning' : '⏰ Reminder'}
                          </span>
                        </td>
                        <td className="text-center p-2 text-white">{log.users_found}</td>
                        <td className="text-center p-2 text-green-400">{log.messages_sent}</td>
                        <td className="text-center p-2 text-yellow-400">{log.messages_skipped}</td>
                        <td className="text-center p-2 text-red-400">
                          {log.errors?.length || 0}
                        </td>
                        <td className="text-right p-2 text-slate-400">{log.execution_time_ms}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">📋 คำแนะนำ</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• Morning Alert จะส่งข้อความแจ้งภารกิจใหม่ที่มีอยู่สำหรับวันนี้ (ถ้าไม่มีจะบอกว่ากำลังเตรียม)</p>
            <p>• Daily Reminder จะส่งสรุปความก้าวหน้า: ยินดีด้วยถ้าเสร็จหมด, เตือนถ้ายังไม่เสร็จ</p>
            <p>• ระบบจะข้ามวันเสาร์-อาทิตย์โดยอัตโนมัติ</p>
            <p>• ทุกครั้งที่ job ถูกเรียก จะบันทึกลง Job Logs เพื่อติดตาม</p>
            <p>• ตรวจสอบ LINE ของคุณหลังจากกดทดสอบเพื่อยืนยันว่าได้รับข้อความ</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
