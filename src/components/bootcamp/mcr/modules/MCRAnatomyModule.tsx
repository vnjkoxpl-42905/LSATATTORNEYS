import React from 'react';
import { MCRXRayBlock, MCRXText, MCRCompletionButton } from '../MCRUIComponents';
import { MCRCoachQuiz } from '../MCRCoachQuiz';
import { MCRModuleWrapper } from '../MCRModuleWrapper';
import { useMCRModuleContext } from '@/context/MCRModuleContext';

export const MCRAnatomyModule = () => {
  const { isCompleted, onComplete, userName } = useMCRModuleContext();
  return (
    <>
      <MCRModuleWrapper title="The Three Parts of an LR Question" label="Structural Triad" progress={{ current: 1, total: 2 }} narrationText={`Listen, ${userName}. Every Logical Reasoning question has three parts: the stimulus, the question stem, and the answer choices. Of those three, the stimulus matters most.`}>
        <p>Every Logical Reasoning question has three parts, {userName}: the stimulus, the question stem, and the answer choices. Of those three, <b>the stimulus matters most.</b></p>
        <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-slate-50 font-bold text-slate-800">1. Stimulus</div>
            <div className="p-6 md:w-2/3">The short passage you read first. This is where the reasoning lives. Your job is to figure out what facts or evidence the author is giving you and what claim the author is trying to prove. That means your real task is to separate premises from conclusions.</div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-slate-50 font-bold text-slate-800">2. Question Stem</div>
            <div className="p-6 md:w-2/3">The question stem tells you what job you need to do with the argument: find the flaw, strengthen the argument, weaken the argument, identify the main conclusion, or find an assumption. First understand the argument. Then use the question stem to know what to do with it.</div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-slate-50 font-bold text-slate-800">3. Answer Choices</div>
            <div className="p-6 md:w-2/3">The answer choices do not create the reasoning. They test whether you understood it correctly. Do not start by comparing answer choices before you understand the stimulus. The stimulus comes first.</div>
          </div>
        </div>
      </MCRModuleWrapper>
      <MCRCoachQuiz questions={[
        {
          question: "In an EXCEPT question, what are you looking for?",
          options: ["The correct answer choice", "The flaw that is NOT present", "The main conclusion", "The premise indicator"],
          correctAnswerIndex: 1,
          explanation: "EXCEPT questions ask you to identify the option that DOES NOT describe a flaw, meaning the other four options ARE flaws."
        }
      ]} />
      <MCRModuleWrapper title="The Stock Analysts" label="Execution Example" progress={{ current: 2, total: 2 }} narrationText="Humans are no better than apes at investing. We gave five stock analysts and one chimpanzee $1,350 each to invest. After one month, the chimp won, increasing its net worth by $210. The next best analyst increased by only $140. Question Stem: Each of the following describes a flaw in the game show host's reasoning EXCEPT:">
        <MCRXRayBlock>
          {(xray) => (
            <>
              "<MCRXText type="conclusion" xray={xray}>Humans are no better than apes at investing.</MCRXText> <MCRXText type="premise" xray={xray}>We gave five stock analysts and one chimpanzee $1,350 each to invest. After one month, the chimp won, increasing its net worth by $210. The next best analyst increased by only $140.</MCRXText>"
            </>
          )}
        </MCRXRayBlock>
        <div className="mt-8">
          <p className="font-bold text-slate-800 mb-4">Question Stem: <span className="font-normal text-slate-600">Each of the following describes a flaw in the game show host's reasoning EXCEPT:</span></p>
          <p className="font-bold text-slate-800 mb-4">Simulated Answer Choices:</p>
          <div className="space-y-3">
            {[
              { l: 'A', t: 'It draws a sweeping conclusion about two entire species based on an exceptionally small sample size.' },
              { l: 'B', t: 'It takes for granted that a single one-month trial is a reliable indicator of long-term investing skill.' },
              { l: 'C', t: "It fails to consider the possibility that the chimpanzee's success was merely the result of random chance." },
              { l: 'D', t: 'It inappropriately relies on the emotional appeal of an animal succeeding in a human profession.', correct: true },
              { l: 'E', t: 'It presumes, without providing justification, that the five chosen analysts are representative of human investors generally.' },
            ].map(choice => (
              <div key={choice.l} className={`p-4 rounded-xl border flex gap-4 transition-colors ${(choice as { correct?: boolean }).correct ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                <span className={`font-bold ${(choice as { correct?: boolean }).correct ? 'text-emerald-700' : 'text-indigo-600'}`}>({choice.l})</span>
                <div className={(choice as { correct?: boolean }).correct ? 'text-emerald-900' : 'text-slate-600'}>
                  {choice.t}
                  {(choice as { correct?: boolean }).correct && <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✓ CORRECT</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500 italic">
            *Because this is an EXCEPT question, (A), (B), (C), and (E) all describe actual logical flaws in the stimulus. (D) is the correct answer because the argument does not rely on an emotional appeal, making it the only option that DOES NOT describe a flaw.
          </p>
        </div>
        <MCRCompletionButton isCompleted={isCompleted} onClick={onComplete} />
      </MCRModuleWrapper>
    </>
  );
};
