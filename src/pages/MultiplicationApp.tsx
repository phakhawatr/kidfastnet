import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, RotateCcw, CheckCircle2, Timer, PlayCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Problem {
  multiplicand: string;
  multiplier: string;
  partialProducts: string[];
  finalAnswer: string;
  dimensions: [number, number];
}

interface Answer {
  partialProducts: string[][];
  finalAnswer: string[];
}

const MultiplicationApp = () => {
  const { toast } = useToast();
  const [problemCount, setProblemCount] = useState(15);
  const [difficulty, setDifficulty] = useState('ง่าย');
  const [dimensions, setDimensions] = useState<[number, number]>([1, 1]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[][][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isCompleted]);

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate random number based on difficulty
  const generateNumber = (digits: number): string => {
    const ranges = {
      'ง่าย': [0, 6],
      'ปานกลาง': [0, 8],
      'ยาก': [1, 9]
    };
    
    const [min, max] = ranges[difficulty as keyof typeof ranges];
    let result = '';
    
    for (let i = 0; i < digits; i++) {
      if (i === 0) {
        // First digit cannot be 0
        result += Math.floor(Math.random() * (max - 1)) + 1;
      } else {
        result += Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }
    
    return result;
  };

  // Calculate long multiplication
  const calculateLongMultiplication = (multiplicand: string, multiplier: string) => {
    const partialProducts: string[] = [];
    const multiplicandNum = parseInt(multiplicand);
    
    // Calculate partial products for each digit of multiplier (from right to left)
    for (let i = multiplier.length - 1; i >= 0; i--) {
      const digit = parseInt(multiplier[i]);
      const product = multiplicandNum * digit;
      const positionFromRight = multiplier.length - 1 - i; // 0 for units, 1 for tens, 2 for hundreds, etc.
      
      if (product === 0) {
        partialProducts.push('0');
      } else {
        // Add trailing zeros based on position
        const zeros = '0'.repeat(positionFromRight);
        partialProducts.push(product.toString() + zeros);
      }
    }
    
    // Calculate final answer
    const finalAnswer = partialProducts.reduce((sum, product) => {
      return (parseInt(sum) + parseInt(product)).toString();
    }, '0');
    
    return { partialProducts, finalAnswer };
  };

  // Generate new problems
  const generateProblems = useCallback(() => {
    const newProblems: Problem[] = [];
    
    for (let i = 0; i < problemCount; i++) {
      const multiplicand = generateNumber(dimensions[0]);
      const multiplier = generateNumber(dimensions[1]);
      const { partialProducts, finalAnswer } = calculateLongMultiplication(multiplicand, multiplier);
      
      newProblems.push({
        multiplicand,
        multiplier,
        partialProducts,
        finalAnswer,
        dimensions
      });
    }
    
    setProblems(newProblems);
    
    // Initialize answers and results
    const newAnswers: Answer[] = newProblems.map(problem => ({
      partialProducts: problem.partialProducts.map(product => new Array(product.length).fill('')),
      finalAnswer: new Array(problem.finalAnswer.length).fill('')
    }));
    
    const newResults: ('correct' | 'incorrect' | null)[][][] = newProblems.map(problem => [
      ...problem.partialProducts.map(product => new Array(product.length).fill(null) as ('correct' | 'incorrect' | null)[]),
      new Array(problem.finalAnswer.length).fill(null) as ('correct' | 'incorrect' | null)[]
    ]);
    
    setAnswers(newAnswers);
    setResults(newResults);
    setIsCompleted(false);
    setShowCelebration(false);
    setStartTime(null);
    setCurrentTime(0);
  }, [problemCount, difficulty, dimensions]);

  // Initialize problems on component mount and when settings change
  useEffect(() => {
    generateProblems();
  }, [generateProblems]);

  // Start timer on first input
  const startTimer = () => {
    if (!startTime) {
      setStartTime(Date.now());
    }
  };

  // Update answer
  const updateAnswer = (problemIdx: number, rowIdx: number, digitIdx: number, value: string) => {
    startTimer();
    
    if (!/^\d*$/.test(value)) return;
    
    const newAnswers = [...answers];
    
    if (rowIdx < problems[problemIdx].partialProducts.length) {
      // Partial product answer
      newAnswers[problemIdx].partialProducts[rowIdx][digitIdx] = value;
    } else {
      // Final answer
      newAnswers[problemIdx].finalAnswer[digitIdx] = value;
    }
    
    setAnswers(newAnswers);
  };

  // Check answers
  const checkAnswers = () => {
    if (!problems.length) return;
    
    let allCorrect = true;
    const newResults = [...results];
    
    problems.forEach((problem, problemIdx) => {
      // Check partial products
      problem.partialProducts.forEach((correctProduct, rowIdx) => {
        const userAnswer = answers[problemIdx].partialProducts[rowIdx].join('');
        const isCorrect = userAnswer === correctProduct;
        
        for (let digitIdx = 0; digitIdx < correctProduct.length; digitIdx++) {
          if (newResults[problemIdx][rowIdx]) {
            newResults[problemIdx][rowIdx][digitIdx] = isCorrect ? 'correct' : 'incorrect';
          }
        }
        
        if (!isCorrect) allCorrect = false;
      });
      
      // Check final answer
      const userFinalAnswer = answers[problemIdx].finalAnswer.join('');
      const isCorrect = userFinalAnswer === problem.finalAnswer;
      const finalRowIdx = problem.partialProducts.length;
      
      for (let digitIdx = 0; digitIdx < problem.finalAnswer.length; digitIdx++) {
        if (newResults[problemIdx][finalRowIdx]) {
          newResults[problemIdx][finalRowIdx][digitIdx] = isCorrect ? 'correct' : 'incorrect';
        }
      }
      
      if (!isCorrect) allCorrect = false;
    });
    
    setResults(newResults);
    
    if (allCorrect) {
      setIsCompleted(true);
      setShowCelebration(true);
      toast({
        title: "🎉 ยอดเยี่ยม!",
        description: "คุณทำได้ครบทุกข้อแล้ว!",
      });
      
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      toast({
        title: "ลองอีกครั้ง",
        description: "ยังมีคำตอบที่ไม่ถูกต้องอยู่",
        variant: "destructive",
      });
    }
  };

  // Reset specific problem
  const resetProblem = (problemIdx: number) => {
    const newAnswers = [...answers];
    const newResults = [...results];
    
    newAnswers[problemIdx] = {
      partialProducts: problems[problemIdx].partialProducts.map(product => new Array(product.length).fill('')),
      finalAnswer: new Array(problems[problemIdx].finalAnswer.length).fill('')
    };
    
    newResults[problemIdx] = [
      ...problems[problemIdx].partialProducts.map(product => new Array(product.length).fill(null) as ('correct' | 'incorrect' | null)[]),
      new Array(problems[problemIdx].finalAnswer.length).fill(null) as ('correct' | 'incorrect' | null)[]
    ];
    
    setAnswers(newAnswers);
    setResults(newResults);
  };

  // Show all answers
  const showAnswers = () => {
    const newAnswers = [...answers];
    const newResults = [...results];
    
    problems.forEach((problem, problemIdx) => {
      // Fill partial products
      problem.partialProducts.forEach((product, rowIdx) => {
        newAnswers[problemIdx].partialProducts[rowIdx] = product.split('');
        newResults[problemIdx][rowIdx] = new Array(product.length).fill('correct');
      });
      
      // Fill final answer
      newAnswers[problemIdx].finalAnswer = problem.finalAnswer.split('');
      newResults[problemIdx][problem.partialProducts.length] = new Array(problem.finalAnswer.length).fill('correct');
    });
    
    setAnswers(newAnswers);
    setResults(newResults);
    setIsCompleted(true);
    
    toast({
      title: "📝 เฉลยคำตอบ",
      description: "แสดงคำตอบที่ถูกต้องทั้งหมดแล้ว",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/profile" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">การคูณแนวตั้ง</h1>
            <p className="text-muted-foreground">ฝึกการคูณแบบยาวตามหลักคณิตศาสตร์</p>
          </div>
          
          {/* Timer */}
          <div className="ml-auto flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-lg font-semibold text-blue-600">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="card-glass p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
            {/* Problem Count */}
            <div>
              <label className="block text-sm font-medium mb-2">จำนวนข้อ</label>
              <div className="flex flex-wrap gap-1">
                {[10, 15, 20, 30].map(count => (
                  <button
                    key={count}
                    onClick={() => setProblemCount(count)}
                    className={`chip ${problemCount === count ? 'active' : ''}`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">ระดับ</label>
              <div className="flex flex-wrap gap-1">
                {['ง่าย', 'ปานกลาง', 'ยาก'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`chip ${difficulty === level ? 'active' : ''}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium mb-2">มิติจำนวน</label>
              <div className="flex flex-wrap gap-1">
                {[[1,1], [2,1], [3,1], [2,2], [3,2], [3,3]].map(([d1, d2]) => (
                  <button
                    key={`${d1}x${d2}`}
                    onClick={() => setDimensions([d1, d2])}
                    className={`chip ${dimensions[0] === d1 && dimensions[1] === d2 ? 'active' : ''}`}
                  >
                    {d1}×{d2}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              <button onClick={generateProblems} className="btn-secondary w-full">
                <RefreshCw className="w-4 h-4" />
                สุ่มชุดใหม่
              </button>
              <button onClick={checkAnswers} className="btn-primary w-full">
                <CheckCircle2 className="w-4 h-4" />
                ตรวจคำตอบ
              </button>
              <button onClick={showAnswers} className="btn-secondary w-full">
                <PlayCircle className="w-4 h-4" />
                เฉลยคำตอบ
              </button>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {problems.map((problem, problemIdx) => (
            <div key={problemIdx} className="card-glass p-6">
              {/* Problem Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">ข้อ {problemIdx + 1}</h3>
                <button
                  onClick={() => resetProblem(problemIdx)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              {/* Problem Display */}
              <div className="text-center mb-6">
                <span className="text-2xl font-bold text-blue-600">
                  {problem.multiplicand} × {problem.multiplier} = 
                </span>
                <div className="inline-block w-20 h-10 border-2 border-dashed border-gray-300 ml-2 rounded"></div>
              </div>
              
              {/* Long Multiplication Grid */}
              <div className="bg-white rounded-lg p-4 font-mono text-xl">
                {/* Calculate grid width based on maximum digits needed */}
                {(() => {
                  // Special case for 1x1 multiplication - simpler layout
                  if (problem.dimensions[0] === 1 && problem.dimensions[1] === 1) {
                    const maxWidth = Math.max(
                      problem.multiplicand.length,
                      problem.multiplier.length,
                      problem.finalAnswer.length
                    ) + 1; // +1 for operator column
                    
                    return (
                      <div className="space-y-2">
                        {/* Multiplicand Row */}
                        <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                          <div></div> {/* Operator column placeholder */}
                          {Array.from({length: maxWidth - 1 - problem.multiplicand.length}).map((_, i) => (
                            <div key={i}></div>
                          ))}
                          {problem.multiplicand.split('').map((digit, i) => (
                            <div key={i} className="text-center py-2 font-bold text-xl">
                              {digit}
                            </div>
                          ))}
                        </div>
                        
                        {/* Multiplier Row */}
                        <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                          <div className="text-center py-2 font-bold text-xl">×</div>
                          {Array.from({length: maxWidth - 1 - problem.multiplier.length}).map((_, i) => (
                            <div key={i}></div>
                          ))}
                          {problem.multiplier.split('').map((digit, i) => (
                            <div key={i} className="text-center py-2 font-bold text-xl">
                              {digit}
                            </div>
                          ))}
                        </div>
                        
                        {/* Separator Line */}
                        <div className="border-t-2 border-black my-2"></div>
                        
                        {/* Final Answer Row */}
                        <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                          <div></div>
                          {/* Right-align the answer boxes by adding empty spaces */}
                          {Array.from({length: maxWidth - 1 - problem.finalAnswer.length}).map((_, i) => (
                            <div key={i}></div>
                          ))}
                          {/* Separate input boxes for each digit */}
                          {problem.finalAnswer.split('').map((digit, digitIdx) => (
                            <input
                              key={digitIdx}
                              type="text"
                              maxLength={1}
                              value={answers[problemIdx]?.finalAnswer[digitIdx] || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d$/.test(value)) {
                                  const newAnswer = [...answers];
                                   if (!newAnswer[problemIdx]) {
                                     newAnswer[problemIdx] = { 
                                       partialProducts: [],
                                       finalAnswer: new Array(problem.finalAnswer.length).fill('') 
                                     };
                                   }
                                  newAnswer[problemIdx].finalAnswer[digitIdx] = value;
                                  setAnswers(newAnswer);
                                }
                              }}
                              className={`w-12 h-12 text-center border-2 rounded font-mono text-xl font-bold ${
                                results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'correct' 
                                  ? 'bg-green-100 border-green-500' 
                                  : results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'incorrect'
                                  ? 'bg-red-100 border-red-500 animate-pulse'
                                  : 'border-purple-300 focus:border-purple-500'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Original complex layout for multi-digit multiplication
                  const maxWidth = Math.max(
                    problem.multiplicand.length + problem.multiplier.length,
                    problem.finalAnswer.length
                  ) + 1; // +1 for plus sign column
                  
                  return (
                    <div className="space-y-2">
                      {/* Multiplicand Row */}
                      <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                        <div></div> {/* Plus sign column placeholder */}
                        {Array.from({length: maxWidth - 1 - problem.multiplicand.length}).map((_, i) => (
                          <div key={i}></div>
                        ))}
                        {problem.multiplicand.split('').map((digit, i) => (
                          <div key={i} className="text-center py-2 font-bold text-xl">
                            {digit}
                          </div>
                        ))}
                      </div>
                      
                      {/* Multiplier Row */}
                      <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                        <div className="text-center py-2 font-bold text-xl">×</div>
                        {Array.from({length: maxWidth - 1 - problem.multiplier.length}).map((_, i) => (
                          <div key={i}></div>
                        ))}
                        {problem.multiplier.split('').map((digit, i) => (
                          <div key={i} className="text-center py-2 font-bold text-xl">
                            {digit}
                          </div>
                        ))}
                      </div>
                      
                      {/* Separator Line */}
                      <div className="border-t-2 border-black my-2"></div>
                      
                      {/* Partial Products */}
                      {problem.partialProducts.map((product, rowIdx) => {
                        const actualProduct = product === '0' ? '0' : product;
                        // Calculate how many spaces from the right edge
                        const emptySpaces = maxWidth - 1 - actualProduct.length;
                        
                        return (
                          <div key={rowIdx} className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                            <div className="text-center py-2 font-bold text-xl">
                              {rowIdx === 0 ? '+' : ''}
                            </div>
                            {/* Empty spaces to right-align the partial product */}
                            {Array.from({length: emptySpaces}).map((_, i) => (
                              <div key={i}></div>
                            ))}
                            {/* Input fields for each digit of the partial product */}
                            {actualProduct.split('').map((digit, digitIdx) => (
                              <input
                                key={digitIdx}
                                type="text"
                                maxLength={1}
                                value={answers[problemIdx]?.partialProducts[rowIdx]?.[digitIdx] || ''}
                                onChange={(e) => updateAnswer(problemIdx, rowIdx, digitIdx, e.target.value)}
                                className={`w-12 h-12 text-center border rounded font-mono text-xl ${
                                  results[problemIdx]?.[rowIdx]?.[digitIdx] === 'correct' 
                                    ? 'bg-green-100 border-green-500' 
                                    : results[problemIdx]?.[rowIdx]?.[digitIdx] === 'incorrect'
                                    ? 'bg-red-100 border-red-500 animate-pulse'
                                    : 'border-gray-300 focus:border-blue-500'
                                }`}
                              />
                            ))}
                          </div>
                        );
                      })}
                      
                      {/* Final Separator Line */}
                      <div className="border-t-2 border-black my-2"></div>
                      
                      {/* Final Answer Row */}
                      <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                        <div></div>
                        {Array.from({length: maxWidth - 1 - problem.finalAnswer.length}).map((_, i) => (
                          <div key={i}></div>
                        ))}
                        {problem.finalAnswer.split('').map((digit, digitIdx) => (
                          <input
                            key={digitIdx}
                            type="text"
                            maxLength={1}
                            value={answers[problemIdx]?.finalAnswer[digitIdx] || ''}
                            onChange={(e) => updateAnswer(problemIdx, problem.partialProducts.length, digitIdx, e.target.value)}
                            className={`w-12 h-12 text-center border-2 rounded font-mono text-xl font-bold ${
                              results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'correct' 
                                ? 'bg-green-100 border-green-500' 
                                : results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'incorrect'
                                ? 'bg-red-100 border-red-500 animate-pulse'
                                : 'border-purple-300 focus:border-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center gap-4 items-center">
          <button onClick={checkAnswers} className="btn-primary">
            <CheckCircle2 className="w-5 h-5" />
            ตรวจคำตอบ
          </button>
          <button onClick={showAnswers} className="btn-secondary">
            <PlayCircle className="w-5 h-5" />
            เฉลยคำตอบ
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">ยอดเยี่ยม!</h2>
              <p className="text-gray-600 mb-4">
                คุณทำได้ครบทุกข้อใน {formatTime(currentTime)}
              </p>
              <button 
                onClick={() => setShowCelebration(false)}
                className="btn-primary"
              >
                ดำเนินการต่อ
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MultiplicationApp;