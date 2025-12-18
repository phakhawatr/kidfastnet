import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Sparkles, BookOpen, Clock, Target, 
  Lightbulb, CheckCircle, Loader2, Copy, Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonPlan {
  title: string;
  grade: string;
  duration: string;
  objectives: string[];
  materials: string[];
  warmUp: {
    activity: string;
    duration: string;
    instructions: string[];
  };
  mainLesson: {
    introduction: string;
    activities: Array<{
      name: string;
      duration: string;
      description: string;
      teacherActions: string[];
      studentActions: string[];
    }>;
  };
  practice: {
    guided: string[];
    independent: string[];
  };
  assessment: {
    formative: string[];
    questions: string[];
  };
  closure: {
    summary: string;
    homework: string;
  };
  differentiation: {
    struggling: string[];
    advanced: string[];
  };
}

export default function AILessonPlanner() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState("50");
  const [objectives, setObjectives] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);

  const generateLessonPlan = async () => {
    if (!topic || !grade) {
      toast.error("กรุณากรอกหัวข้อและระดับชั้น");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lesson-planner', {
        body: {
          topic,
          grade,
          duration: parseInt(duration),
          objectives: objectives.split('\n').filter(o => o.trim()),
          additionalNotes
        }
      });

      if (error) throw error;

      setLessonPlan(data.lessonPlan);
      toast.success("สร้างแผนการสอนสำเร็จ!");
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast.error("เกิดข้อผิดพลาดในการสร้างแผนการสอน");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!lessonPlan) return;
    
    const text = formatLessonPlanAsText(lessonPlan);
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกแผนการสอนแล้ว");
  };

  const formatLessonPlanAsText = (plan: LessonPlan): string => {
    let text = `แผนการสอน: ${plan.title}\n`;
    text += `ระดับชั้น: ${plan.grade}\n`;
    text += `ระยะเวลา: ${plan.duration}\n\n`;
    
    text += `จุดประสงค์การเรียนรู้:\n`;
    plan.objectives.forEach((obj, i) => text += `${i + 1}. ${obj}\n`);
    
    text += `\nสื่อการสอน:\n`;
    plan.materials.forEach((mat, i) => text += `- ${mat}\n`);
    
    text += `\n--- กิจกรรมนำเข้าสู่บทเรียน (${plan.warmUp.duration}) ---\n`;
    text += `${plan.warmUp.activity}\n`;
    plan.warmUp.instructions.forEach(inst => text += `- ${inst}\n`);
    
    text += `\n--- เนื้อหาหลัก ---\n`;
    text += `${plan.mainLesson.introduction}\n\n`;
    plan.mainLesson.activities.forEach((act, i) => {
      text += `กิจกรรมที่ ${i + 1}: ${act.name} (${act.duration})\n`;
      text += `${act.description}\n`;
      text += `ครูทำ:\n`;
      act.teacherActions.forEach(a => text += `  - ${a}\n`);
      text += `นักเรียนทำ:\n`;
      act.studentActions.forEach(a => text += `  - ${a}\n`);
      text += `\n`;
    });
    
    text += `--- การฝึกปฏิบัติ ---\n`;
    text += `แบบมีผู้นำ:\n`;
    plan.practice.guided.forEach(p => text += `- ${p}\n`);
    text += `แบบอิสระ:\n`;
    plan.practice.independent.forEach(p => text += `- ${p}\n`);
    
    text += `\n--- การประเมินผล ---\n`;
    plan.assessment.formative.forEach(a => text += `- ${a}\n`);
    text += `คำถามตรวจสอบ:\n`;
    plan.assessment.questions.forEach((q, i) => text += `${i + 1}. ${q}\n`);
    
    text += `\n--- สรุปและการบ้าน ---\n`;
    text += `สรุป: ${plan.closure.summary}\n`;
    text += `การบ้าน: ${plan.closure.homework}\n`;
    
    text += `\n--- การปรับเนื้อหา ---\n`;
    text += `สำหรับนักเรียนที่ต้องการความช่วยเหลือ:\n`;
    plan.differentiation.struggling.forEach(d => text += `- ${d}\n`);
    text += `สำหรับนักเรียนที่เก่ง:\n`;
    plan.differentiation.advanced.forEach(d => text += `- ${d}\n`);
    
    return text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/teacher')}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Lesson Planner
              </h1>
              <p className="text-slate-400 text-sm">สร้างแผนการสอนด้วย AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                ข้อมูลบทเรียน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">หัวข้อบทเรียน *</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="เช่น การบวกเลขสองหลัก, เศษส่วน"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">ระดับชั้น *</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="เลือกระดับชั้น" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="อนุบาล 1" className="text-white">อนุบาล 1</SelectItem>
                    <SelectItem value="อนุบาล 2" className="text-white">อนุบาล 2</SelectItem>
                    <SelectItem value="อนุบาล 3" className="text-white">อนุบาล 3</SelectItem>
                    <SelectItem value="ประถมศึกษาปีที่ 1" className="text-white">ประถมศึกษาปีที่ 1</SelectItem>
                    <SelectItem value="ประถมศึกษาปีที่ 2" className="text-white">ประถมศึกษาปีที่ 2</SelectItem>
                    <SelectItem value="ประถมศึกษาปีที่ 3" className="text-white">ประถมศึกษาปีที่ 3</SelectItem>
                    <SelectItem value="ประถมศึกษาปีที่ 4" className="text-white">ประถมศึกษาปีที่ 4</SelectItem>
                    <SelectItem value="ประถมศึกษาปีที่ 5" className="text-white">ประถมศึกษาปีที่ 5</SelectItem>
                    <SelectItem value="ประถมศึกษาปีที่ 6" className="text-white">ประถมศึกษาปีที่ 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">ระยะเวลา (นาที)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="30" className="text-white">30 นาที</SelectItem>
                    <SelectItem value="40" className="text-white">40 นาที</SelectItem>
                    <SelectItem value="50" className="text-white">50 นาที</SelectItem>
                    <SelectItem value="60" className="text-white">60 นาที</SelectItem>
                    <SelectItem value="90" className="text-white">90 นาที (คาบคู่)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">จุดประสงค์การเรียนรู้ (บรรทัดละข้อ)</Label>
                <Textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="นักเรียนสามารถบวกเลขสองหลักได้&#10;นักเรียนเข้าใจหลักการทด"
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div>
                <Label className="text-slate-300">หมายเหตุเพิ่มเติม</Label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="เช่น ต้องการเน้นการใช้สื่อของจริง, มีนักเรียนพิเศษ 2 คน"
                  className="bg-slate-700 border-slate-600 text-white min-h-[60px]"
                />
              </div>

              <Button
                onClick={generateLessonPlan}
                disabled={loading || !topic || !grade}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังสร้างแผนการสอน...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    สร้างแผนการสอนด้วย AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Lesson Plan */}
          <div className="space-y-4">
            {lessonPlan ? (
              <>
                {/* Header & Actions */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{lessonPlan.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{lessonPlan.grade}</Badge>
                          <Badge variant="outline" className="text-slate-300 border-slate-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {lessonPlan.duration}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyToClipboard} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Copy className="w-4 h-4 mr-1" />
                          คัดลอก
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Objectives */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      จุดประสงค์การเรียนรู้
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {lessonPlan.objectives.map((obj, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Materials */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">📦 สื่อการสอน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {lessonPlan.materials.map((mat, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-700">
                          {mat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Warm Up */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <span>🌟 กิจกรรมนำเข้าสู่บทเรียน</span>
                      <Badge variant="outline" className="text-slate-400 border-slate-600">
                        {lessonPlan.warmUp.duration}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm mb-2">{lessonPlan.warmUp.activity}</p>
                    <ul className="space-y-1">
                      {lessonPlan.warmUp.instructions.map((inst, i) => (
                        <li key={i} className="text-slate-400 text-sm">• {inst}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Main Lesson Activities */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">📚 เนื้อหาหลัก</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300 text-sm">{lessonPlan.mainLesson.introduction}</p>
                    
                    {lessonPlan.mainLesson.activities.map((act, i) => (
                      <div key={i} className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">
                            กิจกรรมที่ {i + 1}: {act.name}
                          </span>
                          <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">
                            {act.duration}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{act.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-xs">
                          <div className="bg-blue-500/10 p-2 rounded">
                            <p className="text-blue-400 font-medium mb-1">ครูทำ:</p>
                            {act.teacherActions.map((a, j) => (
                              <p key={j} className="text-slate-400">• {a}</p>
                            ))}
                          </div>
                          <div className="bg-green-500/10 p-2 rounded">
                            <p className="text-green-400 font-medium mb-1">นักเรียนทำ:</p>
                            {act.studentActions.map((a, j) => (
                              <p key={j} className="text-slate-400">• {a}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Practice */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">✏️ การฝึกปฏิบัติ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-cyan-400 text-xs font-medium mb-1">แบบมีผู้นำ (Guided)</p>
                      {lessonPlan.practice.guided.map((p, i) => (
                        <p key={i} className="text-slate-300 text-sm">• {p}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-purple-400 text-xs font-medium mb-1">แบบอิสระ (Independent)</p>
                      {lessonPlan.practice.independent.map((p, i) => (
                        <p key={i} className="text-slate-300 text-sm">• {p}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">📊 การประเมินผล</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      {lessonPlan.assessment.formative.map((a, i) => (
                        <p key={i} className="text-slate-300 text-sm">• {a}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-yellow-400 text-xs font-medium mb-1">คำถามตรวจสอบความเข้าใจ:</p>
                      {lessonPlan.assessment.questions.map((q, i) => (
                        <p key={i} className="text-slate-300 text-sm">{i + 1}. {q}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Closure */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">🏁 สรุปและการบ้าน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-slate-300 text-sm"><strong className="text-white">สรุป:</strong> {lessonPlan.closure.summary}</p>
                    <p className="text-slate-300 text-sm"><strong className="text-white">การบ้าน:</strong> {lessonPlan.closure.homework}</p>
                  </CardContent>
                </Card>

                {/* Differentiation */}
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      การปรับเนื้อหาตามความสามารถ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-orange-500/10 p-2 rounded">
                      <p className="text-orange-400 text-xs font-medium mb-1">สำหรับนักเรียนที่ต้องการความช่วยเหลือ:</p>
                      {lessonPlan.differentiation.struggling.map((d, i) => (
                        <p key={i} className="text-slate-300 text-sm">• {d}</p>
                      ))}
                    </div>
                    <div className="bg-emerald-500/10 p-2 rounded">
                      <p className="text-emerald-400 text-xs font-medium mb-1">สำหรับนักเรียนที่เก่ง:</p>
                      {lessonPlan.differentiation.advanced.map((d, i) => (
                        <p key={i} className="text-slate-300 text-sm">• {d}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800/90 border-slate-700 h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-white text-lg mb-2">สร้างแผนการสอนอัตโนมัติ</h3>
                  <p className="text-slate-400 text-sm max-w-sm">
                    กรอกข้อมูลบทเรียนทางด้านซ้าย แล้วกด "สร้างแผนการสอน" 
                    AI จะช่วยออกแบบแผนการสอนที่สมบูรณ์พร้อมกิจกรรมและการประเมินผล
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
