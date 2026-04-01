import React from 'react';
import { MCRGapSimulator, MCRCompletionButton } from '../MCRUIComponents';
import { MCRCoachQuiz } from '../MCRCoachQuiz';
import { MCRModuleWrapper } from '../MCRModuleWrapper';
import { useMCRModuleContext } from '@/context/MCRModuleContext';

export const MCRCoreModule = () => {
  const { isCompleted, onComplete, userName } = useMCRModuleContext();
  return (
    <>
      <MCRModuleWrapper title="Arguments vs. Facts" label="The Foundation" progress={{ current: 1, total: 2 }} narrationText={`${userName}, not everything you read on the LSAT is an argument. Some stimuli are just sets of facts. An argument requires a claim (conclusion) supported by evidence (premises).`}>
        <p>{userName}, not everything you read on the LSAT is an argument. Some stimuli are just sets of facts. An argument requires a claim (conclusion) supported by evidence (premises).</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800 mb-2">Fact Set</h3>
            <p className="text-sm">A collection of statements without a central claim being proven. You cannot "weaken" a fact set.</p>
          </div>
          <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/50">
            <h3 className="font-bold text-indigo-900 mb-2">Argument</h3>
            <p className="text-sm text-indigo-800">Contains at least one premise and one conclusion. The author is trying to convince you of something.</p>
          </div>
        </div>
      </MCRModuleWrapper>
      <MCRCoachQuiz questions={[
        {
          question: "What is the fundamental difference between a 'Fact Set' and an 'Argument'?",
          options: ["Arguments contain more words", "Fact sets are always true, arguments are always false", "Arguments have a conclusion, fact sets do not", "Fact sets are harder to read"],
          correctAnswerIndex: 2,
          explanation: "An argument requires a claim (conclusion) supported by evidence (premises). A fact set is just a collection of statements without a central claim."
        }
      ]} />
      <MCRModuleWrapper title="The Logical Gap" label="Structural Integrity" progress={{ current: 2, total: 2 }} narrationText="Arguments are like physical structures. The premises are the pillars, and the conclusion is the roof. If the pillars are weak, missing, or don't reach the roof, the structure collapses. This missing piece is the Logical Gap.">
        <p>Arguments are like physical structures. The premises are the pillars, and the conclusion is the roof. If the pillars are weak, missing, or don't reach the roof, the structure collapses. This missing piece is the <b>Logical Gap</b>.</p>
        <MCRGapSimulator />
        <div className="mt-8 space-y-4">
          <p><b>Valid Argument:</b> Premises support conclusions. Conclusions rely on premises.</p>
          <p><b>Invalid Argument (Gap):</b> When evidence is removed or insufficient, the support fails, and the conclusion collapses.</p>
        </div>
        <MCRCompletionButton isCompleted={isCompleted} onClick={onComplete} />
      </MCRModuleWrapper>
    </>
  );
};
