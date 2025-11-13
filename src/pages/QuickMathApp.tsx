import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCcw, CheckCircle, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Object types for measurement problems
type MeasurementObject = {
  id: string;
  name: string;
  thaiName: string;
  svgComponent: React.FC<{ className?: string }>;
  actualLength: number; // in cm
  position: number; // starting position on ruler
};

// SVG Components for different objects - all designed to start from position 0
const HandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 140 30" className={className}>
    {/* Palm */}
    <ellipse cx="35" cy="15" rx="28" ry="12" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5"/>
    {/* Thumb */}
    <ellipse cx="15" cy="18" rx="12" ry="8" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5"/>
    {/* Fingers */}
    <ellipse cx="75" cy="8" rx="8" ry="6" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    <ellipse cx="90" cy="6" rx="8" ry="5" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    <ellipse cx="105" cy="8" rx="8" ry="6" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    <ellipse cx="120" cy="12" rx="8" ry="7" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    {/* Wrist connection */}
    <rect x="5" y="12" width="15" height="6" rx="3" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    {/* Details */}
    <line x1="25" y1="10" x2="45" y2="8" stroke="#92400e" strokeWidth="1"/>
    <line x1="25" y1="20" x2="45" y2="22" stroke="#92400e" strokeWidth="1"/>
  </svg>
);

const ChainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 170 20" className={className}>
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse key={i} cx={8 + i * 13} cy="10" rx="5" ry="7" 
               fill="none" stroke="#6b7280" strokeWidth="2.5" 
               transform={`rotate(${i % 2 === 0 ? 0 : 90} ${8 + i * 13} 10)`}/>
    ))}
    {/* Chain clasp */}
    <rect x="2" y="7" width="4" height="6" rx="2" fill="#6b7280"/>
  </svg>
);

const PencilEraserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 120 18" className={className}>
    {/* Pencil body */}
    <rect x="5" y="6" width="80" height="6" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    {/* Pencil tip */}
    <polygon points="85,6 85,12 95,9" fill="#444" stroke="#222" strokeWidth="1"/>
    {/* Metal ferrule */}
    <rect x="95" y="5" width="8" height="8" fill="#c0c0c0" stroke="#888" strokeWidth="1"/>
    {/* Eraser */}
    <ellipse cx="108" cy="9" rx="8" ry="4" fill="#ff69b4" stroke="#d63384" strokeWidth="1"/>
    {/* Pencil details */}
    <line x1="15" y1="7" x2="75" y2="7" stroke="#92400e" strokeWidth="0.5"/>
    <line x1="15" y1="11" x2="75" y2="11" stroke="#92400e" strokeWidth="0.5"/>
    <text x="40" y="10" fontSize="4" fill="#92400e" textAnchor="middle">#2</text>
  </svg>
);

const SpoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 20" className={className}>
    {/* Spoon bowl */}
    <ellipse cx="15" cy="10" rx="12" ry="8" fill="#c0c0c0" stroke="#888" strokeWidth="1.5"/>
    {/* Handle */}
    <rect x="25" y="8" width="60" height="4" rx="2" fill="#c0c0c0" stroke="#888" strokeWidth="1"/>
    {/* Handle end */}
    <ellipse cx="88" cy="10" rx="6" ry="3" fill="#c0c0c0" stroke="#888" strokeWidth="1"/>
    {/* Details */}
    <ellipse cx="15" cy="10" rx="8" ry="5" fill="none" stroke="#888" strokeWidth="0.8"/>
  </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 110 20" className={className}>
    {/* Key head */}
    <circle cx="15" cy="10" r="10" fill="#ffd700" stroke="#b8860b" strokeWidth="1.5"/>
    <circle cx="15" cy="10" r="5" fill="none" stroke="#b8860b" strokeWidth="1"/>
    {/* Key shaft */}
    <rect x="23" y="8" width="60" height="4" fill="#ffd700" stroke="#b8860b" strokeWidth="1"/>
    {/* Key teeth */}
    <rect x="80" y="6" width="8" height="3" fill="#ffd700" stroke="#b8860b" strokeWidth="1"/>
    <rect x="88" y="4" width="6" height="5" fill="#ffd700" stroke="#b8860b" strokeWidth="1"/>
    <rect x="94" y="8" width="4" height="4" fill="#ffd700" stroke="#b8860b" strokeWidth="1"/>
  </svg>
);

const ToothbrushIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 130 18" className={className}>
    {/* Handle */}
    <rect x="5" y="6" width="80" height="6" rx="3" fill="#4a90e2" stroke="#2171b5" strokeWidth="1"/>
    {/* Brush head */}
    <rect x="85" y="4" width="35" height="10" rx="5" fill="#e6f3ff" stroke="#4a90e2" strokeWidth="1"/>
    {/* Bristles */}
    {Array.from({ length: 15 }).map((_, i) => (
      <line key={i} x1={88 + i * 2} y1="6" x2={88 + i * 2} y2="12" stroke="#87ceeb" strokeWidth="0.8"/>
    ))}
    {/* Handle grip */}
    <ellipse cx="45" cy="9" rx="15" ry="2" fill="#2171b5" opacity="0.3"/>
  </svg>
);

// Available objects for measurement - all start from position 0
const measurementObjects: MeasurementObject[] = [
  { id: 'hand', name: 'Hand', thaiName: 'มือ', svgComponent: HandIcon, actualLength: 5.5, position: 0 },
  { id: 'chain', name: 'Chain', thaiName: 'สร้อยคอ', svgComponent: ChainIcon, actualLength: 4.2, position: 0 },
  { id: 'pencil', name: 'Pencil with Eraser', thaiName: 'ดินสอและยางลบ', svgComponent: PencilEraserIcon, actualLength: 4.8, position: 0 },
  { id: 'spoon', name: 'Spoon', thaiName: 'ช้อน', svgComponent: SpoonIcon, actualLength: 4.0, position: 0 },
  { id: 'key', name: 'Key', thaiName: 'กุญแจ', svgComponent: KeyIcon, actualLength: 4.4, position: 0 },
  { id: 'toothbrush', name: 'Toothbrush', thaiName: 'แปรงสีฟัน', svgComponent: ToothbrushIcon, actualLength: 5.2, position: 0 },
];

// Ruler SVG Component - mathematically accurate
const Ruler: React.FC<{ object: MeasurementObject; showAnswer?: boolean }> = ({ object, showAnswer }) => {
  const rulerLength = 300; // 6cm ruler (50px per cm) for better visibility
  const objectStartPx = 10; // Always start from 0 position (10px offset for ruler margin)
  const objectLengthPx = object.actualLength * 50; // 50px per cm conversion

  return (
    <div className="relative">
      <svg width={rulerLength + 20} height="100" className="border border-gray-300 bg-white rounded-lg shadow-sm">
        {/* Ruler background */}
        <rect x="10" y="60" width={rulerLength} height="25" fill="#f8f9fa" stroke="#333" strokeWidth="1.5"/>
        
        {/* Ruler markings - every millimeter */}
        {Array.from({ length: 61 }).map((_, i) => {
          const x = 10 + (i * 5); // Every mm (5px per mm)
          const isCm = i % 10 === 0;
          const isHalfCm = i % 5 === 0;
          
          return (
            <g key={i}>
              <line
                x1={x}
                y1="60"
                x2={x}
                y2={isCm ? "52" : isHalfCm ? "55" : "58"}
                stroke="#333"
                strokeWidth={isCm ? "2" : isHalfCm ? "1" : "0.5"}
              />
              {isCm && (
                <text x={x} y="50" textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">
                  {i / 10}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Object positioned from 0 */}
        <g transform={`translate(${objectStartPx}, 30)`}>
          <object.svgComponent className="w-auto h-8" />
        </g>
        
        {/* Red measurement lines - starting exactly at 0 */}
        <line
          x1={objectStartPx}
          y1="20"
          x2={objectStartPx}
          y2="90"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        <line
          x1={objectStartPx + objectLengthPx}
          y1="20"
          x2={objectStartPx + objectLengthPx}
          y2="90"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        
        {/* Measurement arrow */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
        </defs>
        <line
          x1={objectStartPx}
          y1="15"
          x2={objectStartPx + objectLengthPx}
          y2="15"
          stroke="#ef4444"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          markerStart="url(#arrowhead)"
        />
        
        {/* Answer overlay */}
        {showAnswer && (
          <g>
            <rect x="5" y="5" width="120" height="35" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" rx="6"/>
            <text x="10" y="22" fontSize="14" fill="#059669" fontWeight="bold">
              ✓ ความยาว: {object.actualLength} เซนติเมตร
            </text>
            <text x="10" y="36" fontSize="12" fill="#059669">
              = {(object.actualLength * 10)} มิลลิเมตร
            </text>
          </g>
        )}
      </svg>
      
      {/* Scale indicator */}
      <div className="text-xs text-gray-500 mt-1 text-center">
        ไม้บรรทัด (หน่วย: เซนติเมตร)
      </div>
    </div>
  );
};

// Individual Problem Card
const ProblemCard: React.FC<{
  problem: MeasurementObject;
  index: number;
  userAnswer: { cm: string; mm: string };
  onAnswerChange: (index: number, type: 'cm' | 'mm', value: string) => void;
  showAnswer: boolean;
  result: 'correct' | 'wrong' | 'pending';
}> = ({ problem, index, userAnswer, onAnswerChange, showAnswer, result }) => {
  const flowerColors = ['text-pink-500', 'text-blue-500', 'text-green-500', 'text-purple-500', 'text-yellow-500', 'text-red-500'];
  const flowerColor = flowerColors[index % flowerColors.length];
  
  const bgColors = ['bg-pink-50', 'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-yellow-50', 'bg-red-50'];
  const bgColor = bgColors[index % bgColors.length];

  return (
    <div className={`${bgColor} rounded-3xl border-2 ${
      result === 'correct' ? 'border-green-400' : 
      result === 'wrong' ? 'border-red-400' : 'border-gray-200'
    } shadow-lg p-6`}>
      {/* Flower number */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`text-3xl ${flowerColor}`}>🌸</div>
          <span className="font-bold text-lg">{index + 1}.</span>
        </div>
        {result === 'correct' && <div className="text-green-600 text-xl">✅</div>}
        {result === 'wrong' && <div className="text-red-600 text-xl">❌</div>}
      </div>

      {/* Ruler with object */}
      <div className="mb-6 flex justify-center">
        <Ruler object={problem} showAnswer={showAnswer} />
      </div>

      {/* Answer inputs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">ความยาว:</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            className="w-20 px-3 py-2 border-2 border-blue-300 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={userAnswer.cm}
            onChange={(e) => onAnswerChange(index, 'cm', e.target.value)}
            disabled={showAnswer}
            placeholder="0.0"
          />
          <span className="text-lg font-medium">เซนติเมตร</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">หรือเท่ากับ:</span>
          <input
            type="number"
            min="0"
            max="100"
            className="w-20 px-3 py-2 border-2 border-green-300 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={userAnswer.mm}
            onChange={(e) => onAnswerChange(index, 'mm', e.target.value)}
            disabled={showAnswer}
            placeholder="0"
          />
          <span className="text-lg font-medium">มิลลิเมตร</span>
        </div>
      </div>

      {/* Result display */}
      <div className="mt-4 text-center h-6">
        {result === 'correct' && (
          <span className="text-green-600 font-semibold">🎉 ถูกต้องแล้ว!</span>
        )}
        {result === 'wrong' && (
          <span className="text-red-500 font-semibold">ลองดูใหม่อีกครั้งนะ</span>
        )}
      </div>
    </div>
  );
};

export default function QuickMathApp() {
  const { t } = useTranslation('exercises');
  const [problemCount, setProblemCount] = useState(6);
  const [problems, setProblems] = useState<MeasurementObject[]>([]);
  const [userAnswers, setUserAnswers] = useState<Array<{ cm: string; mm: string }>>([]);
  const [results, setResults] = useState<Array<'correct' | 'wrong' | 'pending'>>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize problems
  useEffect(() => {
    generateNewProblems();
  }, [problemCount]);

  // Timer
  useEffect(() => {
    if (startTime && !isCompleted) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isCompleted]);

  const generateNewProblems = () => {
    const shuffled = [...measurementObjects].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, problemCount);
    setProblems(selected);
    setUserAnswers(selected.map(() => ({ cm: '', mm: '' })));
    setResults(selected.map(() => 'pending'));
    setShowAnswers(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsCompleted(false);
  };

  const handleAnswerChange = (index: number, type: 'cm' | 'mm', value: string) => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const newAnswers = [...userAnswers];
    newAnswers[index] = { ...newAnswers[index], [type]: value };
    setUserAnswers(newAnswers);
  };

  const checkAnswers = () => {
    const newResults = problems.map((problem, index) => {
      const userCm = parseFloat(userAnswers[index].cm) || 0;
      const userMm = parseFloat(userAnswers[index].mm) || 0;
      
      // More precise checking with tolerance of 0.1 cm or 1 mm
      const correctCm = Math.abs(userCm - problem.actualLength) <= 0.1;
      const correctMm = Math.abs(userMm - (problem.actualLength * 10)) <= 1;
      
      // Accept answer if either cm or mm is correct
      return (correctCm || correctMm) ? 'correct' : 'wrong';
    });
    
    setResults(newResults);
    setIsCompleted(true);
  };

  const showAllAnswers = () => {
    setShowAnswers(true);
    setIsCompleted(true);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const correctCount = results.filter(r => r === 'correct').length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  📏 {t('quickMath.title')}
                </h1>
                <p className="text-amber-100">{t('quickMath.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 inline mr-2" />
                {formatTime(elapsedTime)}
              </div>
              {isCompleted && (
                <div className="bg-green-500 px-4 py-2 rounded-lg font-semibold">
                  {correctCount}/{problems.length} ({accuracy}%)
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-md">
            <span className="text-sm font-medium">จำนวนข้อ:</span>
            {[3, 6, 9].map((count) => (
              <button
                key={count}
                onClick={() => setProblemCount(count)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                  problemCount === count
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <button
            onClick={generateNewProblems}
            className="px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2.5"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
            }}
          >
            <span className="text-2xl">✨</span>
            <span>AI สร้างโจทย์ใหม่</span>
          </button>

          <button
            onClick={checkAnswers}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            ตรวจคำตอบ
          </button>

          <button
            onClick={showAllAnswers}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-purple-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            ดูเฉลย
          </button>
        </div>
      </div>

      {/* Problems Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={index}
              userAnswer={userAnswers[index]}
              onAnswerChange={handleAnswerChange}
              showAnswer={showAnswers}
              result={results[index]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}