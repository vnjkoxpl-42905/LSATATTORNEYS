import React from 'react';
import { MCRXRayBlock, MCRXText, MCRCompletionButton } from '../MCRUIComponents';
import { MCRCoachQuiz } from '../MCRCoachQuiz';
import { MCRModuleWrapper } from '../MCRModuleWrapper';
import { useMCRModuleContext } from '@/context/MCRModuleContext';

export const MCRContextModule = () => {
  const { isCompleted, onComplete, userName } = useMCRModuleContext();
  return (
    <>
      <MCRModuleWrapper title="Peripheral Information" label="Contextual Layer" progress={{ current: 1, total: 3 }} narrationText={`${userName}, when we dissect arguments, we want to focus on the relationship between the conclusion and the premises. But arguments can also include peripheral information. These elements do not form the core structure, but they add context and complexity.`}>
        <p>{userName}, when we dissect arguments, we want to focus on the relationship between the conclusion and the premises. But arguments can also include peripheral information. These elements do not form the core structure, but they add context and complexity.</p>
        <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-slate-50 font-bold text-slate-800">1. Background Info</div>
            <div className="p-6 md:w-2/3">Sets the stage and provides context but does not directly support the conclusion. Like describing the room before making a recommendation.<br/><br/><i className="text-slate-500">Ex: "The average American consumes 222 pounds of meat each year."</i></div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-slate-50 font-bold text-purple-700">2. Opposing Views</div>
            <div className="p-6 md:w-2/3">Ideas that challenge the main conclusion. Authors often bring them up to show they are considering other perspectives before reinforcing their own point.<br/><br/><i className="text-slate-500">Ex: "Many people argue that eating meat is necessary for a balanced diet."</i></div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-slate-50 font-bold text-amber-600">3. Concessions</div>
            <div className="p-6 md:w-2/3">A concession happens when the author acknowledges a point from the opposing side but then <b>immediately answers it</b> in order to strengthen the original position. Be ready for the author's real point right after it.</div>
          </div>
        </div>
        <MCRXRayBlock>
          {(xray) => (
            <>
              "<MCRXText type="opposing" xray={xray}>Yes, it is true that a vegetarian diet can lack some nutrients</MCRXText>, <MCRXText type="premise-indicator" xray={xray}>but</MCRXText> <MCRXText type="conclusion" xray={xray}>supplements can easily make up for it.</MCRXText>"
            </>
          )}
        </MCRXRayBlock>
      </MCRModuleWrapper>

      <MCRModuleWrapper title="Valid vs. Invalid" label="Standard of Truth" progress={{ current: 2, total: 3 }}>
        <div className="space-y-8">
          <div>
            <b className="text-emerald-600 text-xl block mb-2">Valid Conclusion = Proven</b>
            <p>A valid conclusion is one that must be true if the premises are true. That means there is no gap, no wiggle room, and no missing assumption. If the premises are true, the conclusion has to be true.</p>
          </div>
          <div>
            <b className="text-rose-600 text-xl block mb-2">Invalid Conclusion = Not Fully Proven</b>
            <p>An invalid conclusion is not guaranteed by the premises. The premises may make it sound plausible, tempting, or even likely. But if the conclusion does not have to follow, then it is not valid. That is where flaws, assumptions, weakeners, and strengtheners come in.</p>
          </div>
        </div>
      </MCRModuleWrapper>
      <MCRCoachQuiz questions={[
        {
          question: "What is the key difference between a 'Valid' and an 'Invalid' conclusion?",
          options: ["Valid conclusions are always true in the real world", "Valid conclusions must follow if the premises are true", "Invalid conclusions are always false", "Invalid conclusions are always shorter"],
          correctAnswerIndex: 1,
          explanation: "A valid conclusion is one that must be true if the premises are true. An invalid conclusion is not guaranteed by the premises."
        }
      ]} />
      <MCRModuleWrapper title="The Student Takeaway" label="Executive Summary" progress={{ current: 3, total: 3 }}>
        <p>When you read an LR stimulus, always ask three questions:</p>
        <div className="my-8 p-8 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl font-mono text-indigo-900 font-bold text-lg space-y-6">
          <p>1. What is the conclusion?</p>
          <p>2. What are the premises?</p>
          <p>3. Do the premises actually prove the conclusion?</p>
        </div>
        <p>If you get good at those three questions, LR becomes much more manageable.</p>
        <MCRCompletionButton isCompleted={isCompleted} onClick={onComplete} />
      </MCRModuleWrapper>
    </>
  );
};
