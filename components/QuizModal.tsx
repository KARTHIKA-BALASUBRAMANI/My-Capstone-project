import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, ChevronRight, Trophy, RefreshCw } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  questions: QuizQuestion[];
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, questions, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === questions[currentIdx].correctOptionIndex;
    if (isCorrect) setScore(s => s + 1);
    
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(p => p + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setCurrentIdx(0);
    setShowResults(false);
    setIsAnswered(false);
    setSelectedOption(null);
    onClose();
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-[fadeIn_0.3s_ease-out]">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-6">You scored {score} out of {questions.length}</p>
          
          <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>

          <button 
            onClick={resetQuiz}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Return to Learning
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded uppercase tracking-wide">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let statusClass = "border-slate-200 hover:border-blue-400 hover:bg-blue-50";
              if (selectedOption === idx) statusClass = "border-blue-500 bg-blue-50 ring-1 ring-blue-500";
              
              if (isAnswered) {
                if (idx === question.correctOptionIndex) {
                  statusClass = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500";
                } else if (idx === selectedOption) {
                  statusClass = "border-red-300 bg-red-50 text-red-700";
                } else {
                  statusClass = "opacity-50 border-slate-200";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center ${statusClass}`}
                >
                  <span>{option}</span>
                  {isAnswered && idx === question.correctOptionIndex && <Check className="w-5 h-5 text-emerald-600" />}
                  {isAnswered && idx === selectedOption && idx !== question.correctOptionIndex && <X className="w-5 h-5 text-red-500" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
              <span className="font-semibold text-slate-800 block mb-1">Explanation:</span>
              {question.explanation}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-6 py-3 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-900/10"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
            >
              {currentIdx === questions.length - 1 ? "View Results" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};