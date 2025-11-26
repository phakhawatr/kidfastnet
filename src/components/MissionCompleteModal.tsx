import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Clock, Target, RotateCcw, Calendar, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MissionCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stars: number;
  correct: number;
  total: number;
  timeSpent: number; // in seconds
  isPassed: boolean; // >80% = pass
  onRetry?: () => void;
}

export function MissionCompleteModal({
  open,
  onOpenChange,
  stars,
  correct,
  total,
  timeSpent,
  isPassed,
  onRetry
}: MissionCompleteModalProps) {
  const navigate = useNavigate();
  const accuracy = Math.round((correct / total) * 100);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isPassed ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  🎉 ภารกิจสำเร็จ!
                </h2>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Target className="w-16 h-16 text-orange-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  💪 ยังไม่ผ่าน - ลองใหม่!
                </h2>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stars Display */}
          {isPassed && (
            <div className="flex justify-center gap-2 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-12 h-12 transition-all duration-300",
                    i < stars
                      ? "text-yellow-400 fill-yellow-400 scale-110 animate-pulse"
                      : "text-slate-600 fill-slate-600 scale-90"
                  )}
                />
              ))}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300 text-sm font-medium">คะแนน</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {correct}/{total}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                accuracy > 80 ? "text-green-400" : "text-orange-400"
              )}>
                ({accuracy}%)
              </div>
            </Card>

            <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300 text-sm font-medium">เวลาที่ใช้</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-slate-400">
                นาที
              </div>
            </Card>
          </div>

          {/* Pass/Fail Message */}
          <Card className={cn(
            "p-4 text-center",
            isPassed 
              ? "bg-green-500/20 border-green-500/50" 
              : "bg-orange-500/20 border-orange-500/50"
          )}>
            <p className="text-white font-medium">
              {isPassed ? (
                <>
                  🎯 ยอดเยี่ยม! คุณทำได้ดีมาก
                  <br />
                  <span className="text-green-400">ผ่านเกณฑ์ {accuracy}% (ต้อง &gt;80%)</span>
                </>
              ) : (
                <>
                  💪 อีกนิดเดียว! ลองอีกครั้งนะ
                  <br />
                  <span className="text-orange-400">ต้องทำให้ได้มากกว่า 80%</span>
                </>
              )}
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {isPassed ? (
              <>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/today-mission?refresh=true');
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg py-6"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  กลับสู่ปฏิทิน
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/mission-history');
                  }}
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-800"
                >
                  <History className="w-5 h-5 mr-2" />
                  ดูประวัติภารกิจ
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    if (onRetry) onRetry();
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-lg py-6"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  ทำใหม่อีกครั้ง
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/today-mission?refresh=true');
                  }}
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-800"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  กลับสู่ปฏิทิน
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
