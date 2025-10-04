import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, Upload, X } from "lucide-react";
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
  
  // PDF Preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState<string>('');
  
  // School Logo state
  const [schoolLogo, setSchoolLogo] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Load school logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('subtraction-school-logo');
    if (savedLogo) {
      setSchoolLogo(savedLogo);
    }
  }, []);
  
  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSchoolLogo(base64);
      localStorage.setItem('subtraction-school-logo', base64);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    setSchoolLogo('');
    localStorage.removeItem('subtraction-school-logo');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };
  
  function openHistory(i: number) {
    const item = history[i];
    setDetailItem(item || null);
    setDetailOpen(!!item);
  }

  function createProblemCard(prob: any, idx: number, totalDigits: number) {
    // Ensure all numbers display with the correct number of digits
    const topNum = prob.a;
    const secondNum = prob.b;
    const thirdNum = prob.c; // May be undefined for 2-operand problems
    
    // Convert to string and pad with spaces to ensure correct digit count
    const topStr = topNum.toString().padStart(totalDigits, ' ');
    const secondStr = secondNum.toString().padStart(totalDigits, ' ');
    const thirdStr = thirdNum != null ? thirdNum.toString().padStart(totalDigits, ' ') : null;
    
    const topDigits = topStr.split('');
    const secondDigits = secondStr.split('');
    const thirdDigits = thirdStr ? thirdStr.split('') : null;
    
    // Debug log
    if (thirdNum != null) {
      console.log(`Problem ${idx + 1}: ${topNum} - ${secondNum} - ${thirdNum}, digits: ${totalDigits}`);
    } else {
      console.log(`Problem ${idx + 1}: ${topNum} - ${secondNum}, digits: ${totalDigits}`);
    }
    
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 6px; background: #fefce8; font-family: 'Noto Sans Thai', sans-serif;">
        <div style="font-size: 7pt; margin-bottom: 4px; color: #666; display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 2px; font-size: 9pt;">★</span> ข้อ ${idx + 1}
        </div>
        
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5px; padding-top: 3px;">
          <!-- Top row (first number) with spacing for minus sign alignment -->
          <div style="display: flex; gap: 2px;">
            <div style="width: 24px; height: 24px; visibility: hidden;"></div>
            ${topDigits.map(digit => `
              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: white; border: 1.5px solid #e0e0e0; border-radius: 6px; line-height: 1;">
                <span style="transform: translateY(-2px); display: inline-block;">${digit.trim() || ''}</span>
              </div>
            `).join('')}
          </div>
          
          <!-- Second row (minus sign + second number) -->
          <div style="display: flex; gap: 2px; align-items: center;">
            <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: #fef3c7; border: 1.5px solid #fbbf24; border-radius: 6px;">
              -
            </div>
            ${secondDigits.map(digit => `
              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: white; border: 1.5px solid #e0e0e0; border-radius: 6px; line-height: 1;">
                <span style="transform: translateY(-2px); display: inline-block;">${digit.trim() || ''}</span>
              </div>
            `).join('')}
          </div>
          
          ${thirdDigits ? `
          <!-- Third row (minus sign + third number) - only for 3-operand problems -->
          <div style="display: flex; gap: 2px; align-items: center;">
            <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: #fef3c7; border: 1.5px solid #fbbf24; border-radius: 6px;">
              -
            </div>
            ${thirdDigits.map(digit => `
              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: white; border: 1.5px solid #e0e0e0; border-radius: 6px; line-height: 1;">
                <span style="transform: translateY(-2px); display: inline-block;">${digit.trim() || ''}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <!-- Divider line -->
          <div style="width: calc(100% - 3px); height: 1.5px; background: #333; margin: 2px 0;"></div>
          
          <!-- Answer boxes with spacing for alignment -->
          <div style="display: flex; gap: 2px;">
            <div style="width: 24px; height: 24px; visibility: hidden;"></div>
            ${Array(totalDigits).fill(0).map(() => `
              <div style="width: 24px; height: 24px; border: 1.5px solid #93c5fd; border-radius: 6px; background: white;"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function generatePageHTML(pageProblems: any[], startIdx: number, pageNum: number, totalPages: number) {
    return `
      <div style="width: 210mm; min-height: 297mm; background: white; padding: 8mm 20mm; page-break-after: always; font-family: 'Noto Sans Thai', sans-serif;">
        <!-- Header -->
        <div style="margin-bottom: 8mm; position: relative;">
          ${totalPages > 1 ? `<div style="position: absolute; top: 0; right: 0; font-size: 10pt; color: #666;">หน้า ${pageNum}/${totalPages}</div>` : ''}
          
          <div style="display: flex; align-items: flex-start; gap: 8mm; margin-bottom: 6mm;">
            ${schoolLogo ? `
              <!-- Logo in top left -->
              <div style="flex-shrink: 0; margin-top: -2mm;">
                <img src="${schoolLogo}" alt="โลโก้โรงเรียน" style="width: 78px; height: 78px; object-fit: contain; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 5px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
              </div>
            ` : ''}
            
            <!-- Main content area -->
            <div style="flex: 1;">
              <!-- Title centered -->
              <div style="font-size: 20pt; font-weight: bold; margin-bottom: 6mm; text-align: center; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 4mm 0;">
                ใบงานการลบ
              </div>
              
              <!-- School and student info -->
              <div style="display: flex; justify-content: space-between; font-size: 11pt; margin-bottom: 3mm;">
                <div>โรงเรียน: _______________________</div>
                <div style="display: flex; gap: 15mm;">
                  <span>ชั้น: __________</span>
                  <span>เลขที่: __________</span>
                </div>
              </div>
              <div style="font-size: 11pt;">
                ชื่อ-สกุล: _______________________
              </div>
            </div>
          </div>
        </div>

        <!-- Problems Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; max-width: 170mm; margin: 0 auto;">
          ${pageProblems.map((prob, idx) => createProblemCard(prob, startIdx + idx, digits)).join('')}
        </div>
      </div>
    `;
  }

  async function printToPDF() {
    try {
      // Calculate total pages needed (20 problems per page: 4 columns x 5 rows)
      const problemsPerPage = 20;
      const totalPages = Math.ceil(problems.length / problemsPerPage);
      
      // Generate HTML for all pages
      let allPagesHTML = '<div style="font-family: \'Noto Sans Thai\', sans-serif;">';
      
      for (let page = 0; page < totalPages; page++) {
        const startIdx = page * problemsPerPage;
        const endIdx = Math.min(startIdx + problemsPerPage, problems.length);
        const pageProblems = problems.slice(startIdx, endIdx);
        
        allPagesHTML += generatePageHTML(pageProblems, startIdx, page + 1, totalPages);
      }
      
      allPagesHTML += '</div>';
      
      // Store preview content and show preview modal
      setPdfPreviewContent(allPagesHTML);
      setShowPdfPreview(true);
      
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  }

  async function savePdfFromPreview() {
    try {
      // Create temporary container with preview content
      const printContainer = document.createElement('div');
      printContainer.innerHTML = pdfPreviewContent;
      printContainer.style.cssText = 'position: fixed; top: -10000px; left: -10000px;';
      document.body.appendChild(printContainer);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = printContainer.querySelectorAll('div[style*="page-break-after"]');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }
      
      pdf.save(`ใบงานการลบ-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Cleanup
      document.body.removeChild(printContainer);
      setShowPdfPreview(false);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก PDF');
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

  // PDF Preview Modal Component
  const PdfPreviewModal = () => {
    if (!showPdfPreview) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-[95%] h-[95%] max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b gap-4">
            <h3 className="text-xl font-bold">ตัวอย่างใบงาน PDF</h3>
            
            {/* Logo Upload in Preview */}
            <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2 border">
              <span className="text-sm text-zinc-600">โลโก้:</span>
              {schoolLogo ? (
                <div className="flex items-center gap-2">
                  <img src={schoolLogo} alt="โลโก้โรงเรียน" className="w-8 h-8 object-contain border rounded" />
                  <button
                    onClick={handleRemoveLogo}
                    className="px-2 py-1 rounded text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 flex items-center gap-1"
                  >
                    <X size={14} />
                    ลบ
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="logo-upload"
                  className="px-3 py-1 rounded text-sm font-semibold bg-white hover:bg-zinc-100 cursor-pointer flex items-center gap-1 border"
                >
                  <Upload size={14} />
                  อัปโหลด
                </label>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={savePdfFromPreview}
                className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-semibold"
              >
                <Printer size={20} />
                บันทึก PDF
              </button>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 bg-zinc-200 text-zinc-800 rounded-lg hover:bg-zinc-300"
              >
                ปิด
              </button>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-6 bg-zinc-100">
            <div 
              className="mx-auto"
              style={{ maxWidth: '210mm' }}
              dangerouslySetInnerHTML={{ __html: pdfPreviewContent }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-pink-50 text-zinc-800">
      {showPdfPreview && <PdfPreviewModal />}
      
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

          {/* Logo Upload Section */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">โลโก้โรงเรียน:</span>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            {schoolLogo ? (
              <div className="flex items-center gap-2">
                <img src={schoolLogo} alt="โลโก้โรงเรียน" className="w-10 h-10 object-contain border rounded-lg" />
                <button
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 rounded-full text-sm font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 flex items-center gap-1"
                >
                  <X size={16} />
                  ลบโลโก้
                </button>
              </div>
            ) : (
              <label
                htmlFor="logo-upload"
                className="px-4 py-2 rounded-full text-base font-semibold border-2 bg-zinc-50 hover:bg-zinc-100 cursor-pointer flex items-center gap-2"
              >
                <Upload size={16} />
                อัปโหลดโลโก้
              </label>
            )}
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