import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface SubtractionProblem {
  id: number;
  minuend: string;
  subtrahend: string;
  answer: string;
}

interface SubtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubtractionModal: React.FC<SubtractionModalProps> = ({ isOpen, onClose }) => {
  const [problems, setProblems] = useState<SubtractionProblem[]>([
    { id: 1, minuend: '65', subtrahend: '28', answer: '' },
    { id: 2, minuend: '90', subtrahend: '13', answer: '' },
    { id: 3, minuend: '50', subtrahend: '24', answer: '' },
    { id: 4, minuend: '55', subtrahend: '18', answer: '' },
    { id: 5, minuend: '61', subtrahend: '33', answer: '' },
    { id: 6, minuend: '92', subtrahend: '57', answer: '' }
  ]);

  const clearAnswer = (id: number) => {
    setProblems(prev => prev.map(p => 
      p.id === id ? { ...p, answer: '' } : p
    ));
  };

  const updateAnswer = (id: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    setProblems(prev => prev.map(p => 
      p.id === id ? { ...p, answer: value } : p
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">แบบฝึกหัดการลบ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Problems Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div key={problem.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-lg">
              {/* Star and Problem Number */}
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">ข้อ {problem.id}</span>
              </div>

              {/* Numbers Display */}
              <div className="mb-6">
                {/* First row - minuend */}
                <div className="flex justify-center gap-2 mb-2">
                  {problem.minuend.split('').map((digit, index) => (
                    <div key={index} className="w-12 h-12 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">{digit}</span>
                    </div>
                  ))}
                </div>

                {/* Second row - minus sign and subtrahend */}
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">-</span>
                  </div>
                  {problem.subtrahend.split('').map((digit, index) => (
                    <div key={index} className="w-12 h-12 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">{digit}</span>
                    </div>
                  ))}
                </div>

                {/* Underline */}
                <div className="border-b-2 border-gray-400 mx-4 mb-4"></div>

                {/* Answer boxes */}
                <div className="flex justify-center gap-2">
                  {[0, 1].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={problem.answer[index] || ''}
                      onChange={(e) => {
                        const newAnswer = problem.answer.split('');
                        newAnswer[index] = e.target.value;
                        updateAnswer(problem.id, newAnswer.join(''));
                      }}
                      className="w-12 h-12 bg-blue-50 rounded-lg border-2 border-blue-300 text-center text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                  ))}
                </div>
              </div>

              {/* Clear Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => clearAnswer(problem.id)}
                  className="px-6 py-2 bg-white border-2 border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ล้างตอบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
            >
              ปิด
            </button>
            <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium hover:from-green-400 hover:to-green-500 transition-all">
              ส่งคำตอบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtractionModal;