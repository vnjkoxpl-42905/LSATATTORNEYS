import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MCRCard, MCRCompletionButton } from '../MCRUIComponents';
import { MCRCoachQuiz } from '../MCRCoachQuiz';
import { MCRTwoPointCheckModal } from '../MCRTwoPointCheckModal';
import { MCRModuleWrapper } from '../MCRModuleWrapper';
import { useMCRModuleContext } from '@/context/MCRModuleContext';
import { MCR_OPINION_INDICATORS, MCR_READING_SEQUENCE } from '@/data/mainConclusionRole/constants';

const ConclusionAnalysisCard = () => {
  const { isCompleted, onComplete } = useMCRModuleContext();
  const [selected, setSelected] = useState('Obviously');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <MCRCard label="Conclusion Analysis" title="Identifying & Validating the Main Conclusion" focusMode={false} progress={{ current: 1, total: 2 }}>
      <p>To identify the main conclusion, you must first spot the author's opinion and then verify its support.</p>

      <div className="mt-8">
        <p className="text-slate-600 mb-4">When you see these words, you are looking at the author's opinion:</p>
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.keys(MCR_OPINION_INDICATORS).map(word => (
            <button
              key={word}
              onClick={() => setSelected(word)}
              className={`px-4 py-2 rounded-lg font-mono text-sm font-extrabold transition-colors ${selected === word ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-indigo-100'}`}
            >
              {word}
            </button>
          ))}
        </div>
        <div className="p-6 bg-slate-900 rounded-2xl text-white font-serif text-lg italic mb-8">
          {MCR_OPINION_INDICATORS[selected]}
        </div>
      </div>

      <div className="my-8 space-y-4">
        <p className="font-bold text-slate-800 mb-4">The 2-Point Check:</p>
        {[
          { text: <>It expresses the author's <b>Opinion</b>.</>, icon: "💭" },
          { text: <>It is <b>Supported</b> by at least one other explicit claim.</>, icon: "🏗️" }
        ].map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            whileHover={{ x: 5, backgroundColor: "#f8fafc" }}
            className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors"
          >
            <div className="text-2xl">{point.icon}</div>
            <p className="text-slate-700 font-medium">{point.text}</p>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
      >
        Run 2-Point Check on this claim
      </button>
      <MCRTwoPointCheckModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} claim={MCR_OPINION_INDICATORS[selected]} />

      <div className="mt-8">
        <MCRCompletionButton isCompleted={isCompleted} onClick={onComplete} />
      </div>
    </MCRCard>
  );
};

export const MCRProcessModule = () => {
  const { userName } = useMCRModuleContext();
  return (
    <>
      <ConclusionAnalysisCard />
      <MCRModuleWrapper title="How to Read a Stimulus Step by Step" label="Sequence" progress={{ current: 2, total: 2 }}>
        <p>{userName}, follow this sequence:</p>
        <div className="space-y-8 mt-6">
          {MCR_READING_SEQUENCE.map(step => (
            <div key={step.num} className="flex gap-6 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 tabular-nums ${step.highlight ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {step.num}
              </div>
              <div className="pt-2 text-slate-600 leading-relaxed">{step.text}</div>
            </div>
          ))}
        </div>
      </MCRModuleWrapper>
      <MCRCoachQuiz questions={[
        {
          question: "What is the correct order for analyzing an LR stimulus?",
          options: ["Read the answer choices first, then the stimulus", "Understand the argument, then use the question stem", "Skim the stimulus, then jump to the answer choices", "Read the question stem first, then ignore the stimulus"],
          correctAnswerIndex: 1,
          explanation: "You must first understand the argument structure (premises and conclusion) before you can effectively use the question stem to know what to do with it."
        }
      ]} />
    </>
  );
};
