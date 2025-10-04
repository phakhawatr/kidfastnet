import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSubtractionGame } from "../hooks/useSubtractionGame";
import { ProblemCard } from "../components/ProblemCard";
import { 
  formatMS, 
  fmtDate, 
  calcStars, 
  praiseText, 
  answerToNumber,
  type HistoryItem, 
  type SummaryData 
} from "../utils/subtractionUtils";

const SubtractionApp: React.FC = () => {
  const {
    count, level, digits, allowBorrow, operands, problems, answers, results,
    showAnswers, celebrate, showSummary, summary, startedAt, finishedAt, 
    elapsedMs, history,
    setAnswer, startTimerIfNeeded, applyNewCount, applyLevel, applyDigits,
    applyBorrow, applyOperands, resetAll, checkAnswers, showAll, onReset,
    clearHistory, saveStats, setShowSummary, setSummary,
  } = useSubtractionGame();

  // Detail modal state for viewing previous results
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HistoryItem | null>(null);
  
  function openHistory(i: number) {
    const item = history[i];
    setDetailItem(item || null);
    setDetailOpen(!!item);
  }

  async function printToPDF() {
    try {
      // Create a special print container
      const printContainer = document.createElement('div');
      printContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 210mm;
        height: 297mm;
        background: white;
        padding: 20mm;
        z-index: 9999;
      `;

      // Add header section
      const header = document.createElement('div');
      header.style.cssText = 'margin-bottom: 15mm; border-bottom: 2px solid #333; padding-bottom: 10mm;';
      header.innerHTML = `
        <div style="text-align: center; font-family: 'Noto Sans Thai', sans-serif;">
          <div style="font-size: 18pt; font-weight: bold; margin-bottom: 8mm;">แบบฝึกหัดการลบ</div>
          <div style="display: flex; justify-content: space-between; font-size: 12pt;">
            <div>โรงเรียน: ___________________________</div>
            <div>ชื่อ-สกุล: ___________________________</div>
          </div>
          <div style="text-align: left; font-size: 12pt; margin-top: 3mm;">
            ชั้น: ___________________________
          </div>
        </div>
      `;
      printContainer.appendChild(header);

      // Create problems grid (4 columns x 5 rows = 20 problems max per page)
      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8mm;
        max-width: 170mm;
        margin: 0 auto;
      `;

      // Add up to 20 problems (5 rows x 4 columns)
      const problemsToShow = problems.slice(0, 20);
      problemsToShow.forEach((prob, idx) => {
        const card = document.createElement('div');
        card.style.cssText = `
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px;
          background: #fafafa;
          text-align: center;
          font-family: 'Noto Sans Thai', sans-serif;
        `;
        
        const problemNum = document.createElement('div');
        problemNum.style.cssText = 'font-size: 9pt; margin-bottom: 4px; color: #666;';
        problemNum.textContent = `ข้อ ${idx + 1}`;
        
        const problemContent = document.createElement('div');
        problemContent.style.cssText = 'font-size: 16pt; font-weight: bold; margin: 8px 0;';
        
        const top = prob.a.toString().padStart(digits, ' ').split('').join(' ');
        const bottom = prob.b.toString().padStart(digits, ' ').split('').join(' ');
        
        problemContent.innerHTML = `
          <div style="text-align: right; margin-bottom: 2px;">${top}</div>
          <div style="text-align: right; border-top: 2px solid #333; padding-top: 2px;">- ${bottom}</div>
        `;
        
        const answerBoxes = document.createElement('div');
        answerBoxes.style.cssText = 'display: flex; justify-content: center; gap: 4px; margin-top: 8px;';
        for (let i = 0; i < digits; i++) {
          const box = document.createElement('div');
          box.style.cssText = `
            width: 20px;
            height: 25px;
            border: 1px solid #999;
            border-radius: 4px;
            background: white;
          `;
          answerBoxes.appendChild(box);
        }
        
        card.appendChild(problemNum);
        card.appendChild(problemContent);
        card.appendChild(answerBoxes);
        grid.appendChild(card);
      });

      printContainer.appendChild(grid);
      document.body.appendChild(printContainer);

      // Generate PDF
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`แบบฝึกหัดการลบ-${new Date().toISOString().split('T')[0]}.pdf`);

      // Remove print container
      document.body.removeChild(printContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  }

  const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );

  interface HistoryDetailModalProps {
    open: boolean;
    item: HistoryItem | null;
    onClose: () => void;
  }

  const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ open, item, onClose }) => {
    if (!open || !item) return null;
    const hasSnap = Array.isArray(item.snapshot);
    return (
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 mx-auto my-4 w-[96%] max-w-5xl">
          <div className="rounded-2xl bg-white shadow-xl border flex flex-col overflow-hidden h-[85vh]" style={{ height: '85svh' }}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div className="font-bold text-lg">ผลการทำที่ผ่านมา • {fmtDate(item.ts)}</div>
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200">ปิด</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              {!hasSnap ? (
                <div className="text-sm text-zinc-500">รายการนี้ไม่มีข้อมูลโจทย์ที่บันทึกไว้</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.snapshot!.map((s, idx) => {
                    const ok = parseInt(s.answer, 10) === s.correct;
                    return (
                      <div key={idx} className="rounded-2xl border bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-500">ข้อ {idx + 1}</div>
                          <div className={ok ? "text-emerald-600 text-xl" : "text-rose-600 text-xl"}>{ok ? "✅" : "❌"}</div>
                        </div>
                        <div className="text-2xl font-bold my-1">
                          {s.c != null ? (<><span>{s.a}</span> - <span>{s.b}</span> - <span>{s.c}</span> = <span className="text-sky-700">{s.correct}</span></>) : (<><span>{s.a}</span> - <span>{s.b}</span> = <span className="text-sky-700">{s.correct}</span></>)}
                        </div>
                        <div className="text-sm">ตอบของฉัน: <span className={ok ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{s.answer || '—'}</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  interface SummaryModalProps {
    open: boolean;
    onClose: () => void;
    data: SummaryData | null;
    onShowAnswers: () => void;
    alreadyShowing: boolean;
    onSave: () => void;
  }

  const SummaryModal: React.FC<SummaryModalProps> = ({ open, onClose, data, onShowAnswers, alreadyShowing, onSave }) => {
    if (!open || !data) return null;
    const pct = Math.round((data.correct / Math.max(1, data.total)) * 100);
    let icon = "💪";
    let title = "สู้ต่ออีกนิด!";
    let color = "text-rose-600";
    if (pct >= 90) { icon = "🏆"; title = "ยอดเยี่ยม!"; color = "text-emerald-600"; }
    else if (pct >= 70) { icon = "🎯"; title = "ดีมาก!"; color = "text-sky-600"; }
    else if (pct >= 40) { icon = "👍"; title = "ใช้ได้!"; color = "text-amber-600"; }

    const stars = calcStars(data.correct, data.total);
    const msg = praiseText(pct);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-xl border p-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{icon}</div>
            <div>
              <div className={`text-xl font-bold ${color}`}>{title}</div>
              <div className="text-zinc-500 text-sm">ผลคะแนนและเวลาในรอบนี้</div>
            </div>
          </div>

          <div className="mt-3 flex justify-center items-center gap-1">
            {[0,1,2].map(i => (
              <span key={`star-${i}`} className={i < stars ? 'text-amber-400 text-3xl' : 'text-zinc-300 text-3xl'}>★</span>
            ))}
          </div>
          <div className="text-center text-sm mt-1 text-zinc-600">{msg}</div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">คะแนน</div>
              <div className="text-2xl font-semibold">{data.correct}/{data.total}</div>
              <div className="text-xs text-zinc-400">{Math.round((data.correct / Math.max(1, data.total)) * 100)}%</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">เวลา</div>
              <div className="text-2xl font-semibold">{formatMS(data.elapsedMs)}</div>
              <div className="text-xs text-zinc-400">ระดับ: {data.level === 'easy' ? 'ง่าย' : data.level === 'medium' ? 'ปานกลาง' : 'ยาก'}</div>
            </div>
          </div>

          <div className="mt-5 flex gap-2 justify-end">
            {alreadyShowing ? (
              <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-medium">👀 แสดงเฉลยแล้ว</div>
            ) : (
              <button onClick={onShowAnswers} className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">ดูเฉลยทั้งหมด</button>
            )}
            <button onClick={() => { if (onSave) onSave(); if (onClose) onClose(); }} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200">ปิด</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-pink-50 text-zinc-800">
      <header className="max-w-6xl mx-auto p-6 pb-2">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white shadow-sm border"
          >
            <ArrowLeft size={20} />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">➖ การลบที่ผลลัพธ์ไม่เกิน 1,000</h1>
        <p className="text-zinc-600 mt-1 text-base">ตอบผลลัพธ์ของโจทย์ลบ 2 หรือ 3 จำนวน โดยผลลัพธ์ไม่เกิน 1,000</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        {/* === Control Panel === */}
        <div className="control-panel flex flex-wrap items-center gap-2 mb-4">
          {/* จำนวนข้อ */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนข้อ:</span>
            {[10, 15, 20, 30].map((n) => (
              <button key={n} onClick={() => applyNewCount(n)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${count === n ? "bg-sky-600 text-white border-sky-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{n}</button>
            ))}
          </div>

          {/* ระดับ */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">ระดับ:</span>
            {[{ key: "easy", label: "ง่าย" }, { key: "medium", label: "ปานกลาง" }, { key: "hard", label: "ยาก" }].map((lv) => (
              <button key={lv.key} onClick={() => applyLevel(lv.key)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${level === lv.key ? "bg-purple-600 text-white border-purple-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{lv.label}</button>
            ))}
          </div>

          {/* จำนวนหลัก */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนหลัก:</span>
            {[1, 2, 3].map((d) => (
              <button key={d} onClick={() => applyDigits(d)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${digits === d ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{d} หลัก</button>
            ))}
          </div>

          {/* การยืม */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">การยืม:</span>
            {[{ val: true, label: "มี" }, { val: false, label: "ไม่มี" }].map((opt) => (
              <button key={opt.label} onClick={() => applyBorrow(opt.val)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${allowBorrow === opt.val ? "bg-rose-600 text-white border-rose-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{opt.label}</button>
            ))}
          </div>

          {/* จำนวนชุดตัวเลข */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนชุดตัวเลข:</span>
            {[{k:2,label:"2 จำนวน"},{k:3,label:"3 จำนวน"}].map(op => (
              <button key={op.k} onClick={() => applyOperands(op.k)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${operands===op.k?"bg-teal-600 text-white border-teal-600":"bg-zinc-50 hover:bg-zinc-100"}`}>{op.label}</button>
            ))}
          </div>

          {/* action buttons */}
          <button 
            onClick={resetAll} 
            className="px-6 py-3 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
            }}
          >
            <span className="text-2xl">✨</span>
            <span>AI สร้างโจทย์ใหม่</span>
          </button>
          <button onClick={checkAnswers} className="px-5 py-3 rounded-2xl text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">✅ ตรวจคำตอบ (Check)</button>
          <button onClick={() => showAll({ openSummary: true })} className="px-5 py-3 rounded-2xl text-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg">👀 เฉลยทั้งหมด (Show Answers)</button>
          <button onClick={printToPDF} className="px-5 py-3 rounded-2xl text-lg bg-purple-600 text-white hover:bg-purple-700 shadow-lg flex items-center gap-2">
            <Printer size={20} />
            🖨️ พิมพ์ PDF
          </button>

          {/* Live timer */}
          <div className="ml-auto text-base bg-sky-50 border-2 border-sky-200 rounded-full px-4 py-2 font-semibold">⏱️ เวลา: <span className="font-semibold">{formatMS(elapsedMs)}</span>{startedAt && !finishedAt && <span className="text-zinc-400"> (นับอยู่)</span>}</div>
        </div>

        {/* Problems grid */}
        <div className="problems-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <ProblemCard
              key={i}
              idx={i}
              prob={p}
              answer={answers[i]}
              setAnswer={setAnswer}
              result={results[i]}
              showAnswer={showAnswers}
              onReset={onReset}
              onFirstType={startTimerIfNeeded}
              digits={digits}
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="mt-6 flex justify-center">
          <button onClick={checkAnswers} className="px-8 py-4 rounded-3xl text-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">✅ ตรวจคำตอบ</button>
        </div>

        {/* History panel */}
        <section className="mt-10 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-base font-semibold">สถิติรอบที่ผ่านมา</h2>
            <button onClick={clearHistory} className="ml-auto text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200">ล้างสถิติ</button>
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-zinc-500">ยังไม่มีสถิติ ลองทำโจทย์แล้วกด "ตรวจคำตอบ" แล้วกดปุ่ม "ปิด" เพื่อบันทึก</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3">วันที่/เวลา</th>
                    <th className="py-2 pr-3">ระดับ</th>
                    <th className="py-2 pr-3">จำนวนข้อ</th>
                    <th className="py-2 pr-3">เวลา</th>
                    <th className="py-2 pr-3">คะแนน</th>
                    <th className="py-2 pr-3">ระดับ</th>
                    <th className="py-2 pr-3">ดูผล</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(h.ts)}</td>
                      <td className="py-2 pr-3">{h.level === 'easy' ? 'ง่าย' : h.level === 'medium' ? 'ปานกลาง' : 'ยาก'}</td>
                      <td className="py-2 pr-3">{h.count}</td>
                      <td className="py-2 pr-3">{formatMS(h.durationMs)}</td>
                      <td className="py-2 pr-3">{h.correct}/{h.count}</td>
                      <td className="py-2 pr-3">{Array.from({length: h.stars}).map((_, si) => '★').join('')}{Array.from({length: 3 - h.stars}).map((_, si) => '☆').join('')}</td>
                      <td className="py-2 pr-3">
                        <button onClick={() => openHistory(i)} className="text-sky-600 hover:text-sky-800 text-xs underline">ดูรายละเอียด</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modals and Overlays */}
      {celebrate && <Confetti />}
      
      <SummaryModal 
        open={showSummary} 
        onClose={() => setShowSummary(false)} 
        data={summary} 
        onShowAnswers={() => showAll({ openSummary: false })} 
        alreadyShowing={showAnswers} 
        onSave={saveStats} 
      />
      
      <HistoryDetailModal 
        open={detailOpen} 
        item={detailItem} 
        onClose={() => setDetailOpen(false)} 
      />
    </div>
  );
};

export default SubtractionApp;