import React from 'react';
import { motion } from 'framer-motion';
import { MCRXRayBlock, MCRXText, MCRCompletionButton } from '../MCRUIComponents';
import { MCRCoachQuiz } from '../MCRCoachQuiz';
import { MCRModuleWrapper } from '../MCRModuleWrapper';
import { useMCRModuleContext } from '@/context/MCRModuleContext';

export const MCRComponentsModule = () => {
  const { isCompleted, onComplete, userName } = useMCRModuleContext();
  return (
    <>
      <MCRModuleWrapper title="Premises: Statements of Fact" label="The Building Blocks" progress={{ current: 1, total: 3 }} narrationText={`${userName}, premises are the facts or evidence in the argument. They tell you what the author is giving you to work with. On the LSAT, you accept the premises as true. Do not push back on the premises. Push back on the conclusion.`}>
        <p>{userName}, premises are the facts or evidence in the argument. They tell you what the author is giving you to work with. On the LSAT, you accept the premises as true. Do not push back on the premises. Push back on the conclusion.</p>
        <p className="mt-4"><b>Key rule:</b> The question is not whether the premises are true. The question is whether the premises actually support the conclusion.</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50">
            <b className="text-blue-800 block mb-2">ARE:</b>
            <span className="text-blue-900 text-sm">Facts, Evidence, Support, Building blocks.</span>
          </div>
          <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50">
            <b className="text-rose-800 block mb-2">ARE NOT:</b>
            <span className="text-rose-900 text-sm">Main judgments, The part you attack, Final claims.</span>
          </div>
        </div>
        <div className="mt-8">
          <b className="text-slate-800 tracking-wider uppercase text-xs font-bold">Premise Indicators: FABS</b>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { word: 'FOR', desc: 'Evidence', color: 'border-blue-500', example: <>You should try the curry, <b className="text-rose-500">for</b> you like spicy food.</> },
              { word: 'AFTER ALL', desc: 'Support', color: 'border-emerald-500', example: <>You should try the curry. <b className="text-rose-500">After all</b>, you like spicy food.</> },
              { word: 'BECAUSE', desc: 'Reason', color: 'border-amber-500', example: <>You should try the curry <b className="text-rose-500">because</b> you like spicy food.</> },
              { word: 'SINCE', desc: 'Fact', color: 'border-rose-500', example: <><b className="text-rose-500">Since</b> you like spicy food, you should try the curry.</> }
            ].map(item => (
              <motion.div
                key={item.word}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`group relative p-4 rounded-xl bg-slate-900 border-t-4 ${item.color} border border-slate-800 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]`}
              >
                <div className="font-mono text-lg font-extrabold text-white group-hover:text-indigo-300 transition-colors">{item.word}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 group-hover:text-slate-300">{item.desc}</div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 w-64">
                  <div className="bg-slate-950 text-white text-sm p-4 rounded-xl shadow-2xl border border-slate-700 font-medium text-center leading-relaxed">
                    {item.example}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </MCRModuleWrapper>

      <MCRModuleWrapper title="Conclusions: The Author's Claim" label="The Main Point" progress={{ current: 2, total: 3 }} narrationText="Conclusions are the judgments the author makes. They are the main point the author wants you to accept. This is the part of the argument you should examine most carefully.">
        <p>Conclusions are the judgments the author makes. They are the main point the author wants you to accept. This is the part of the argument you should examine most carefully.</p>
        <p className="mt-4"><b>Key rule:</b> The conclusion is the part of the argument you should be most suspicious of. Ask whether it is too strong, whether it goes beyond the evidence, whether the author assumed something missing, and whether the premises really get us there.</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50">
            <b className="text-emerald-800 block mb-2">ARE:</b>
            <span className="text-emerald-900 text-sm">Author's claim, The point argued for, Part you question.</span>
          </div>
          <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50">
            <b className="text-rose-800 block mb-2">ARE NOT:</b>
            <span className="text-rose-900 text-sm">Automatically proven, Self-supporting, Always clear.</span>
          </div>
        </div>
        <div className="mt-8">
          <b className="text-slate-800">Conclusion Indicator Words:</b>
          <div className="flex flex-wrap gap-3 mt-4">
            {['SO', 'THUS', 'THEREFORE', 'HENCE', 'AS A RESULT'].map(word => (
              <motion.span
                key={word}
                whileHover={{ scale: 1.05, backgroundColor: '#ede9fe' }}
                className="px-4 py-2 rounded-lg bg-violet-100 border border-violet-300 font-mono text-sm font-extrabold text-violet-900 shadow-sm cursor-pointer transition-colors"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>
      </MCRModuleWrapper>
      <MCRCoachQuiz questions={[
        {
          question: "When you identify a conclusion in an LR stimulus, what should be your primary mindset?",
          options: ["Accept it as true immediately", "Be suspicious and look for gaps", "Ignore it and focus on premises", "Assume the author is an expert"],
          correctAnswerIndex: 1,
          explanation: "The conclusion is the part of the argument you should be most suspicious of. You need to question whether the premises actually support it."
        }
      ]} />
      <MCRModuleWrapper title="Indicators in Action" label="Indicator Drill" progress={{ current: 3, total: 3 }} narrationText="Analyze the logical structure below:">
        <p className="mb-6 text-slate-600">Analyze the logical structure below:</p>
        <MCRXRayBlock>
          {(xray) => (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-inner">
              <p className="text-xl font-medium text-slate-800 leading-relaxed">
                "<MCRXText type="conclusion" xray={xray}>The local bakery will likely sell out of sourdough by noon</MCRXText>, <MCRXText type="premise-indicator" xray={xray}>since</MCRXText> <MCRXText type="premise" xray={xray}>they have already received over fifty pre-orders for that specific loaf</MCRXText>."
              </p>
            </div>
          )}
        </MCRXRayBlock>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-teal-900 border border-teal-800 text-white">
            <div className="font-mono text-[10px] text-teal-300 uppercase tracking-widest mb-3">Premise (Support)</div>
            <p className="font-bold text-lg">They have already received over fifty pre-orders for that specific loaf.</p>
            <div className="mt-4 pt-4 border-t border-teal-800/50 flex items-center gap-2 text-teal-300 text-xs font-mono">
              <span className="px-2 py-1 bg-teal-800 rounded">INDICATOR:</span> "since"
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-indigo-900 border border-indigo-800 text-white">
            <div className="font-mono text-[10px] text-indigo-300 uppercase tracking-widest mb-3">Conclusion</div>
            <p className="font-bold text-lg">The local bakery will likely sell out of sourdough by noon.</p>
          </div>
        </div>
        <MCRCompletionButton isCompleted={isCompleted} onClick={onComplete} />
      </MCRModuleWrapper>
    </>
  );
};
