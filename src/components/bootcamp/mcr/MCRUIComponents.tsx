import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { MCRNarrationButton } from './MCRNarrationButton';

export const MCRCard = ({
  label,
  title,
  children,
  focusMode,
  progress,
  narrationText,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  focusMode: boolean;
  progress?: { current: number; total: number };
  narrationText?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)' }}
      className={`bg-white rounded-3xl p-8 md:p-10 mb-8 ring-1 ring-slate-200 shadow-xl shadow-slate-200/50 transition-all duration-500 ${
        focusMode ? 'opacity-40 blur-[2px] scale-[0.98] hover:opacity-100 hover:blur-0 hover:scale-100 hover:z-10 relative' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="font-mono text-xs text-indigo-600 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-4">
          {narrationText && <MCRNarrationButton text={narrationText} />}
          {progress && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400">
                {progress.current} / {progress.total}
              </span>
              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-3xl font-serif font-bold text-slate-800 mb-6 leading-tight">{title}</h2>
      <div className="text-lg text-slate-600 leading-relaxed space-y-6">{children}</div>
    </motion.div>
  );
};

export const MCRXText = ({
  type,
  xray,
  children,
}: {
  type: 'premise' | 'conclusion' | 'opposing' | 'premise-indicator' | 'conclusion-indicator';
  xray: boolean;
  children: React.ReactNode;
}) => {
  const [isActive, setIsActive] = useState(false);

  const styles = {
    premise: 'bg-blue-50 text-blue-700 border-b-2 border-blue-400 rounded px-1 not-italic',
    conclusion: 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-400 rounded px-1 not-italic',
    opposing: 'bg-purple-50 text-purple-700 border-b-2 border-purple-400 rounded px-1 not-italic',
    'premise-indicator': 'text-teal-600 font-bold not-italic',
    'conclusion-indicator': 'text-indigo-500 font-extrabold not-italic',
  };

  const isSince = children === 'since';

  return (
    <motion.span
      onClick={() => setIsActive(!isActive)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}
      className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-300 ${xray ? styles[type] : ''} ${
        isSince
          ? 'animate-pulse text-rose-600 underline decoration-rose-400 decoration-4 underline-offset-4 font-bold'
          : ''
      }`}
    >
      {children}
    </motion.span>
  );
};

export const MCRXRayBlock = ({ children }: { children: (xray: boolean) => React.ReactNode }) => {
  const [xray, setXray] = useState(false);

  return (
    <div
      className={`relative p-8 rounded-2xl border-l-4 my-8 transition-colors duration-300 ${
        xray ? 'bg-indigo-50/50 border-indigo-400' : 'bg-slate-50 border-slate-300'
      }`}
    >
      <button
        onClick={() => setXray(!xray)}
        aria-label={xray ? 'Disable X-Ray scan' : 'Enable X-Ray scan'}
        className={`absolute -top-4 right-6 px-4 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-sm ${
          xray
            ? 'bg-rose-100 text-rose-700 border border-rose-200'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
      >
        {xray ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {xray ? 'HIDE ANALYSIS' : 'ANALYZE STRUCTURE'}
      </button>
      <div className="text-lg italic text-slate-700 leading-relaxed">{children(xray)}</div>
    </div>
  );
};

export const MCRGapSimulator = () => {
  const [premise1Fallen, setPremise1Fallen] = useState(false);
  const [premise2Fallen, setPremise2Fallen] = useState(false);
  const [unstable, setUnstable] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const invalidatePremise = (premise: 1 | 2) => {
    if (collapsed) return;
    setUnstable(true);
    setTimeout(() => {
      if (premise === 1) setPremise1Fallen(true);
      else setPremise2Fallen(true);
      setCollapsed(true);
      setUnstable(false);
    }, 600);
  };

  const reset = () => {
    setPremise1Fallen(false);
    setPremise2Fallen(false);
    setCollapsed(false);
    setUnstable(false);
  };

  return (
    <div
      className={`rounded-3xl p-12 my-8 relative overflow-hidden transition-colors duration-300 ${
        collapsed ? 'bg-[#E11D48]' : 'bg-[#0F172A]'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center">
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 font-mono text-white text-sm font-bold tracking-widest mb-8"
          >
            STATUS: ARGUMENT COLLAPSED // STRUCTURAL INTEGRITY FAILED
          </motion.div>
        )}

        <motion.div
          animate={
            collapsed
              ? { rotate: -10, y: 40, x: -20 }
              : unstable
              ? { rotate: [0, -2, 2, -2, 2, 0], transition: { duration: 0.3, repeat: Infinity } }
              : { rotate: 0, y: 0, x: 0 }
          }
          className="w-full max-w-sm h-20 bg-[#4F46E5] flex items-center justify-center font-bold text-white tracking-widest mb-4 shadow-lg"
        >
          CONCLUSION
        </motion.div>

        <div className="flex justify-center gap-8 w-full max-w-sm">
          <motion.div
            animate={premise1Fallen ? { rotate: -90, x: -50, y: 20 } : { rotate: 0, x: 0, y: 0 }}
            className="w-24 h-32 bg-[#0D9488] flex items-center justify-center text-white font-bold shadow-lg"
          >
            P1
          </motion.div>
          <motion.div
            animate={premise2Fallen ? { rotate: 90, x: 50, y: 20 } : { rotate: 0, x: 0, y: 0 }}
            className="w-24 h-32 bg-[#0D9488] flex items-center justify-center text-white font-bold shadow-lg"
          >
            P2
          </motion.div>
        </div>

        <div className="mt-16 flex gap-4">
          {!collapsed ? (
            <>
              <button
                onClick={() => invalidatePremise(1)}
                className="px-6 py-3 bg-white text-[#0F172A] font-mono font-bold rounded-lg shadow-md hover:bg-slate-200"
              >
                Invalidate Premise I
              </button>
              <button
                onClick={() => invalidatePremise(2)}
                className="px-6 py-3 bg-white text-[#0F172A] font-mono font-bold rounded-lg shadow-md hover:bg-slate-200"
              >
                Invalidate Premise II
              </button>
            </>
          ) : (
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-[#E11D48] font-mono font-bold rounded-lg shadow-md hover:bg-slate-100"
            >
              Reconstruct Argument
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const MCRCompletionButton = ({
  isCompleted,
  onClick,
}: {
  isCompleted: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isCompleted}
      aria-label={isCompleted ? 'Module already completed' : 'Mark module as completed'}
      className={`w-full py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all mt-8 border-2 ${
        isCompleted
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed'
          : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'
      }`}
    >
      {isCompleted ? 'MODULE COMPLETED ✓' : 'Finalize Module'}
    </button>
  );
};
