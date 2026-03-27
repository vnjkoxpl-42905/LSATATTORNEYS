import * as React from "react";
import { supabase } from '@/integrations/supabase/client';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeText } from '@/lib/utils';
import type { LRQuestion } from '@/lib/questionLoader';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TutorChatModalProps {
  open: boolean;
  question: LRQuestion | null;
  userAnswer: string;
  onClose: () => void;
}

export function TutorChatModal({
  open,
  question,
  userAnswer,
  onClose,
}: TutorChatModalProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);
  const [showPassage, setShowPassage] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to bottom as messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when coaching surface is ready
  React.useEffect(() => {
    if (!isLoading && !initializing) {
      inputRef.current?.focus();
    }
  }, [isLoading, initializing]);

  // Open → load first Socratic question
  React.useEffect(() => {
    if (open && question && initializing) {
      loadInitialQuestion();
    }
  }, [open, question, initializing]);

  // Reset state on close
  React.useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput('');
      setInitializing(true);
      setIsLoading(false);
      setShowPassage(false);
    }
  }, [open]);

  const extractFunctionError = async (err: any): Promise<string> => {
    try {
      const ctx = (err as any)?.context;
      if (ctx && typeof (ctx as any).text === 'function') {
        const status = (ctx as any).status;
        const raw = await (ctx as any).text();
        try {
          const json = JSON.parse(raw);
          const msg = json.error || json.message || raw;
          return status ? `${msg} (HTTP ${status})` : msg;
        } catch {
          return status ? `${raw} (HTTP ${status})` : raw;
        }
      }
      return (err as any)?.message || 'Unexpected error from coaching service.';
    } catch {
      return (err as any)?.message || 'Unexpected error from coaching service.';
    }
  };

  const loadInitialQuestion = async () => {
    if (!question) return;
    setIsLoading(true);
    try {
      const questionData = {
        qid: question.qid,
        pt: question.pt,
        section: question.section,
        qnum: question.qnum,
        qtype: question.qtype,
        level: question.difficulty,
        stimulus: question.stimulus,
        questionStem: question.questionStem,
        answerChoices: question.answerChoices,
        userAnswer,
        correctAnswer: question.correctAnswer,
        breakdown: question.breakdown,
        answerChoiceExplanations: question.answerChoiceExplanations,
        reasoningType: question.reasoningType,
      };
      const { data, error } = await supabase.functions.invoke('tutor-chat', {
        body: { question: questionData, messages: [] },
      });
      if (error) throw error;
      setMessages([{ role: 'assistant', content: data.content }]);
      setInitializing(false);
    } catch (e: any) {
      const msg = await extractFunctionError(e);
      setMessages([{ role: 'assistant', content: msg }]);
      setInitializing(false);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !question || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const questionData = {
        qid: question.qid,
        pt: question.pt,
        section: question.section,
        qnum: question.qnum,
        qtype: question.qtype,
        level: question.difficulty,
        stimulus: question.stimulus,
        questionStem: question.questionStem,
        answerChoices: question.answerChoices,
        userAnswer,
        correctAnswer: question.correctAnswer,
        breakdown: question.breakdown,
        answerChoiceExplanations: question.answerChoiceExplanations,
        reasoningType: question.reasoningType,
      };
      const { data, error } = await supabase.functions.invoke('tutor-chat', {
        body: {
          question: questionData,
          messages: [...messages, { role: 'user', content: userMessage }],
        },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (e: any) {
      const msg = await extractFunctionError(e);
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open || !question) return null;

  const hasPassage = !!question.stimulus;

  return (
    <div className="h-full flex flex-col bg-white select-none">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-neutral-100 shrink-0">
        <span className="text-[10px] tracking-[0.18em] text-neutral-400 font-medium uppercase">
          Joshua
        </span>
        {hasPassage && (
          <button
            onClick={() => setShowPassage(v => !v)}
            className="text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors duration-150"
          >
            {showPassage ? '← Back' : 'Passage'}
          </button>
        )}
      </div>

      {/* ── Body — messages or passage peek ────────────────────────── */}
      {showPassage ? (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[13px] leading-[1.65] text-neutral-700 whitespace-pre-wrap select-text">
            {normalizeText(question.stimulus!)}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {messages.map((msg, idx) =>
              msg.role === 'assistant' ? (
                <p
                  key={idx}
                  className="text-[14px] leading-[1.65] text-neutral-800 whitespace-pre-wrap animate-in fade-in duration-200 select-text"
                >
                  {msg.content}
                </p>
              ) : (
                <p
                  key={idx}
                  className="text-right text-[13px] leading-[1.5] text-neutral-400 italic whitespace-pre-wrap animate-in fade-in duration-150 select-text"
                >
                  {msg.content}
                </p>
              )
            )}

            {(isLoading || initializing) && (
              <p className="text-[18px] tracking-widest text-neutral-300 animate-pulse leading-none">
                ···
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── Input + return ─────────────────────────────────────────── */}
      {!showPassage && (
        <div className="shrink-0 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-6 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || initializing}
              placeholder="Ask a follow-up…"
              className="flex-1 bg-transparent border-0 outline-none text-[14px] text-neutral-900 placeholder:text-neutral-300 disabled:opacity-40 select-text"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || initializing}
              className={cn(
                "shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150",
                input.trim() && !isLoading && !initializing
                  ? "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-95"
                  : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="text-[11px] text-neutral-300 hover:text-neutral-500 transition-colors duration-150"
            >
              Return to question →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
