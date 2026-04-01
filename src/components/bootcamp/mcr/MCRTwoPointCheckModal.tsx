import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoPointCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: string;
}

export const MCRTwoPointCheckModal = ({ isOpen, onClose, claim }: TwoPointCheckModalProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      const timer1 = setTimeout(() => setStep(1), 600);
      const timer2 = setTimeout(() => setStep(2), 1600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl ring-1 ring-slate-200">
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">The 2-Point Check</h2>
              <p className="text-slate-500 text-sm font-mono mb-10 uppercase tracking-widest">
                Analyzing claim: "{claim}"
              </p>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
                  className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-indigo-900">Opinion</h3>
                  </div>
                  <p className="text-indigo-800 leading-relaxed">
                    It expresses the author's subjective viewpoint or judgment.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
                  className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">Support</h3>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    It is backed by at least one other explicit premise or claim.
                  </p>
                </motion.div>
              </div>

              <button
                onClick={onClose}
                className="mt-12 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
