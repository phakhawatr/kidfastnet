import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Trash2, Sun, Moon, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScratchPadProps {
  open: boolean;
  onClose: () => void;
  questionNumber: number;
  questionText: string;
}

const INITIAL_HEIGHT = 400;
const PAGE_INCREMENT = 400;

const ScratchPad: React.FC<ScratchPadProps> = ({ open, onClose, questionNumber, questionText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [penSize, setPenSize] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [canvasHeight, setCanvasHeight] = useState(INITIAL_HEIGHT);

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
    ctx.strokeStyle = isDarkMode ? '#93c5fd' : '#1e3a5f';
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, [getPos, penSize, isDarkMode]);

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = isDarkMode ? '#334155' : '#e8dcc8';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }, [isDarkMode]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = isDarkMode ? '#1e293b' : '#fdf6e3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  }, [isDarkMode, drawGrid]);

  const addPage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHeight = canvasHeight + PAGE_INCREMENT;
    setCanvasHeight(newHeight);
    requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      const c = canvasRef.current;
      const cx = c.getContext('2d');
      if (!cx) return;
      cx.putImageData(imageData, 0, 0);
      cx.fillStyle = isDarkMode ? '#1e293b' : '#fdf6e3';
      cx.fillRect(0, canvasHeight, c.width, PAGE_INCREMENT);
      drawGrid(cx, c.width, newHeight);
      // scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [canvasHeight, isDarkMode, drawGrid]);

  const clearAll = useCallback(() => {
    setCanvasHeight(INITIAL_HEIGHT);
    setTimeout(() => clearCanvas(), 50);
  }, [clearCanvas]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => clearCanvas(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, clearCanvas]);

  // Re-draw background when mode changes (clears canvas)
  useEffect(() => {
    if (open) clearCanvas();
  }, [isDarkMode, open, clearCanvas]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`max-w-2xl p-4 ${isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📝 กระดาษทด - ข้อที่ {questionNumber}
            </DialogTitle>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isDarkMode
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              {isDarkMode ? 'สว่าง' : 'มืด'}
            </button>
          </div>
          <p className={`text-sm rounded-lg px-3 py-2 mt-2 leading-relaxed ${
            isDarkMode ? 'text-amber-300 bg-amber-500/10' : 'text-amber-700 bg-amber-50 border border-amber-200'
          }`}>
            📖 {questionText}
          </p>
        </DialogHeader>
        <div
          ref={scrollRef}
          className={`rounded-xl overflow-y-auto overflow-x-hidden border-2 touch-none ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}
          style={{ maxHeight: '55vh' }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={canvasHeight}
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
        <div className="flex justify-center">
          <button
            onClick={addPage}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isDarkMode
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <PlusCircle size={14} /> เพิ่มกระดาษ
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>เส้น:</span>
            {[2, 4, 6].map(s => (
              <button
                key={s}
                onClick={() => setPenSize(s)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  penSize === s
                    ? 'bg-purple-500 text-white'
                    : isDarkMode
                      ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                <div className="rounded-full bg-current" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className={isDarkMode
                ? 'border-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50'
                : 'border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
              }
            >
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
