import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Eraser, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScratchPadProps {
  open: boolean;
  onClose: () => void;
  questionNumber: number;
}

const ScratchPad: React.FC<ScratchPadProps> = ({ open, onClose, questionNumber }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [penSize, setPenSize] = useState(3);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, [getPos, penSize]);

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw grid lines
    ctx.strokeStyle = '#e8dcc8';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }, []);

  useEffect(() => {
    if (open) {
      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => clearCanvas(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, clearCanvas]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl bg-slate-800/95 border-slate-700 p-4">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            📝 กระดาษทด - ข้อที่ {questionNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-xl overflow-hidden border-2 border-slate-600 touch-none">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full cursor-crosshair"
            style={{ touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">เส้น:</span>
            {[2, 4, 6].map(s => (
              <button
                key={s}
                onClick={() => setPenSize(s)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${penSize === s ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                <div className="rounded-full bg-current" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearCanvas} className="border-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50">
              <Trash2 size={16} className="mr-1" /> ลบทั้งหมด
            </Button>
            <Button size="sm" onClick={onClose} className="bg-purple-600 hover:bg-purple-500 text-white">
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchPad;
