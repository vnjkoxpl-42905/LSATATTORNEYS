import React from 'react';
import { MCRCompletionButton } from '../MCRUIComponents';
import { MCRCoachQuiz } from '../MCRCoachQuiz';
import { MCRModuleWrapper } from '../MCRModuleWrapper';
import { useMCRModuleContext } from '@/context/MCRModuleContext';

export const MCRIntroModule = () => {
  const { isCompleted, onComplete, userName } = useMCRModuleContext();
  return (
    <>
      <MCRModuleWrapper title="How to Read an LR Stimulus" label="Primary Directive" progress={{ current: 1, total: 2 }} narrationText={`Listen closely, ${userName}. The core job: When you read an LR stimulus, do not read passively. Find the conclusion, find the premises, and ask whether the premises really prove the conclusion.`}>
        <p><b>The core job, {userName}:</b> When you read an LR stimulus, do not read passively. Find the conclusion, find the premises, and ask whether the premises really prove the conclusion.</p>
      </MCRModuleWrapper>
      <MCRCoachQuiz questions={[
        {
          question: "When reading an LR stimulus, what is the most important thing to do?",
          options: ["Read as quickly as possible", "Find the conclusion and premises", "Focus only on the answer choices", "Assume the premises are false"],
          correctAnswerIndex: 1,
          explanation: "The core job is to identify the argument structure: the conclusion and the premises, so you can evaluate the relationship between them."
        }
      ]} />
      <MCRModuleWrapper title="What Logical Reasoning Tests" label="Assessment Metrics" progress={{ current: 2, total: 2 }} narrationText="1. Read Intently: You must pay attention to what each sentence is doing. If you do not really understand what you are reading, you will not answer the question correctly. Do not skim. Do not assume. Do not paraphrase too loosely. Track the role of each statement. 2. Question the Author: Many students read an LR stimulus and think, 'That sounds fine.' That is the wrong mindset. The author's conclusion is often the weak point. Ask whether the evidence actually proves the claim, whether the author is going too far, and whether there is a gap between the premises and the conclusion.">
        <p><b>1. Read Intently:</b> You must pay attention to what each sentence is doing. If you do not really understand what you are reading, you will not answer the question correctly. Do not skim. Do not assume. Do not paraphrase too loosely. Track the role of each statement.</p>
        <p><b>2. Question the Author:</b> Many students read an LR stimulus and think, "That sounds fine." That is the wrong mindset. The author's conclusion is often the weak point. Ask whether the evidence actually proves the claim, whether the author is going too far, and whether there is a gap between the premises and the conclusion.</p>
        <MCRCompletionButton isCompleted={isCompleted} onClick={onComplete} />
      </MCRModuleWrapper>
    </>
  );
};
