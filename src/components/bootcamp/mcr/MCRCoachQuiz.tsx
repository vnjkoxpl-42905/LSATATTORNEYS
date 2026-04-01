import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const MCRCoachQuiz = ({ questions }: { questions: QuizQuestion[] }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = questions[currentQuestionIndex];

  const handleOptionClick = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 mb-8 ring-1 ring-slate-200 shadow-2xl shadow-slate-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">?</div>
        <h3 className="text-2xl font-serif font-bold text-slate-800">Check-in</h3>
      </div>
      <p className="text-lg text-slate-700 mb-6 font-medium">{question.question}</p>
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            className={`w-full p-4 rounded-xl border text-left transition-all font-medium ${
              selectedOption === index
                ? index === question.correctAnswerIndex
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-6 bg-slate-900 rounded-2xl text-white"
          >
            <p className="font-bold text-lg mb-2">
              {selectedOption === question.correctAnswerIndex ? 'Spot on!' : "Not quite, let's refine that."}
            </p>
            <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
            <button
              onClick={nextQuestion}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
