import React, { useState, useEffect } from 'react';
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

// SVG Components for different objects
const HandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 40" className={className}>
    <path d="M10 25 Q15 20 20 22 Q25 18 30 20 Q35 16 40 18 Q45 14 50 16 Q55 12 60 14 L75 18 Q80 20 78 25 L75 30 Q70 35 60 35 L20 35 Q12 32 10 25 Z" 
          fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    <circle cx="15" cy="28" r="2" fill="#92400e"/>
    <circle cx="25" cy="26" r="2" fill="#92400e"/>
    <circle cx="35" cy="24" r="2" fill="#92400e"/>
  </svg>
);

const ChainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 20" className={className}>
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={i} cx={12 + i * 10} cy="10" rx="4" ry="6" 
               fill="none" stroke="#6b7280" strokeWidth="2" 
               transform={`rotate(${i % 2 === 0 ? 0 : 90} ${12 + i * 10} 10)`}/>
    ))}
  </svg>
);

const MilkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 60 20" className={className}>
    <text x="5" y="15" fontSize="16" fontWeight="bold" fill="#1f2937" fontFamily="Arial, sans-serif">MILK</text>
  </svg>
);

const GuitarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 80 35" className={className}>
    <ellipse cx="20" cy="17" rx="18" ry="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
    <circle cx="20" cy="17" r="6" fill="#f4a460"/>
    <rect x="35" y="15" width="40" height="4" fill="#654321"/>
    <line x1="35" y1="13" x2="75" y2="13" stroke="#333" strokeWidth="0.5"/>
    <line x1="35" y1="21" x2="75" y2="21" stroke="#333" strokeWidth="0.5"/>
    <rect x="70" y="12" width="8" height="10" fill="#8b4513"/>
  </svg>
);

const SpatulaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 90 25" className={className}>
    <rect x="5" y="8" width="25" height="8" rx="4" fill="#c0c0c0" stroke="#808080" strokeWidth="1"/>
    <rect x="28" y="11" width="50" height="2" fill="#8b4513"/>
    <circle cx="75" cy="12" r="3" fill="#654321"/>
  </svg>
);

const FlashlightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 80 25" className={className}>
    <rect x="5" y="8" width="15" height="8" rx="2" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
    <rect x="18" y="10" width="35" height="4" fill="#4b5563"/>
    <rect x="51" y="9" width="8" height="6" rx="3" fill="#6b7280"/>
    <circle cx="67" cy="12" r="8" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
    <circle cx="67" cy="12" r="4" fill="#fbbf24"/>
  </svg>
);

// Available objects for measurement
const measurementObjects: MeasurementObject[] = [
  { id: 'hand', name: 'Hand', thaiName: 'มือ', svgComponent: HandIcon, actualLength: 3.5, position: 0.5 },
  { id: 'chain', name: 'Chain', thaiName: 'สร้อยคอ', svgComponent: ChainIcon, actualLength: 4.2, position: 0.3 },
  { id: 'milk', name: 'MILK Text', thaiName: 'คำว่า MILK', svgComponent: MilkIcon, actualLength: 2.8, position: 1.0 },
  { id: 'guitar', name: 'Guitar', thaiName: 'กีตาร์', svgComponent: GuitarIcon, actualLength: 4.0, position: 0.8 },
  { id: 'spatula', name: 'Spatula', thaiName: 'ไม้พาย', svgComponent: SpatulaIcon, actualLength: 4.5, position: 0.2 },
  { id: 'flashlight', name: 'Flashlight', thaiName: 'ไฟฉาย', svgComponent: FlashlightIcon, actualLength: 3.8, position: 0.6 },
];

// Ruler SVG Component
const Ruler: React.FC<{ object: MeasurementObject; showAnswer?: boolean }> = ({ object, showAnswer }) => {
  const rulerLength = 250; // 5cm ruler (50px per cm)
  const objectStartPx = object.position * 50; // Convert cm to pixels
  const objectLengthPx = object.actualLength * 50;

  return (
    <div className="relative">
      <svg width={rulerLength + 20} height="80" className="border border-gray-300 bg-white rounded-lg">
        {/* Ruler background */}
        <rect x="10" y="50" width={rulerLength} height="20" fill="#f8f9fa" stroke="#333" strokeWidth="1"/>
        
        {/* Ruler markings */}
        {Array.from({ length: 51 }).map((_, i) => {
          const x = 10 + (i * 5); // Every mm
          const isCm = i % 10 === 0;
          const isHalfCm = i % 5 === 0;
          
          return (
            <g key={i}>
              <line
                x1={x}
                y1="50"
                x2={x}
                y2={isCm ? "45" : isHalfCm ? "47" : "49"}
                stroke="#333"
                strokeWidth={isCm ? "1.5" : "0.5"}
              />
              {isCm && (
                <text x={x} y="43" textAnchor="middle" fontSize="10" fill="#333">
                  {i / 10}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Object positioned on ruler */}
        <g transform={`translate(${10 + objectStartPx}, 25)`}>
          <object.svgComponent className="w-auto h-6" />
        </g>
        
        {/* Red measurement lines */}
        <line
          x1={10 + objectStartPx}
          y1="15"
          x2={10 + objectStartPx}
          y2="75"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1={10 + objectStartPx + objectLengthPx}
          y1="15"
          x2={10 + objectStartPx + objectLengthPx}
          y2="75"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        
        {/* Answer overlay */}
        {showAnswer && (
          <g>
            <rect x="5" y="5" width="80" height="25" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" rx="4"/>
            <text x="10" y="20" fontSize="12" fill="#059669" fontWeight="bold">
              {object.actualLength} เซนติเมตร
            </text>
            <text x="10" y="33" fontSize="11" fill="#059669">
              {(object.actualLength * 10)} มิลลิเมตร
            </text>
          </g>
        )}
      </svg>
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
      
      const correctCm = Math.abs(userCm - problem.actualLength) < 0.1;
      const correctMm = Math.abs(userMm - (problem.actualLength * 10)) < 1;
      
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
                  📏 แอปวัดความยาวด้วยไม้บรรทัด
                </h1>
                <p className="text-amber-100">ฝึกทักษะการวัดความยาวและแปลงหน่วย</p>
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
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            สุ่มใหม่
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