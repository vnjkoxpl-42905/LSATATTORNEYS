import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

export type MCRModuleId = 'intro' | 'anatomy' | 'core' | 'components' | 'process' | 'context';

export const MCR_MODULES = [
  { id: 'intro',      title: '01. Foundations' },
  { id: 'anatomy',   title: '02. Anatomy' },
  { id: 'core',      title: '03. The Core' },
  { id: 'components',title: '04. Components' },
  { id: 'process',   title: '05. The Process' },
  { id: 'context',   title: '06. Context' },
] as const;

interface MCRSidebarProps {
  userName: string;
  activeModule: MCRModuleId;
  completedModules: Record<MCRModuleId, boolean>;
  onSelectModule: (id: MCRModuleId) => void;
}

export const MCRSidebar = ({ userName, activeModule, completedModules, onSelectModule }: MCRSidebarProps) => {
  const completedCount = Object.values(completedModules).filter(Boolean).length;
  const progress = Math.round((completedCount / MCR_MODULES.length) * 100);

  const springProgress = useSpring(progress, { stiffness: 100, damping: 20 });
  const displayProgress = useTransform(springProgress, (latest: number) => Math.round(latest));

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen flex-shrink-0">
      <div className="p-8 border-b border-slate-200">
        <div className="font-serif font-bold text-slate-800 text-lg tracking-wide">ASPIRING ATTORNEYS</div>
        <div className="font-mono text-xs text-slate-500 mt-2">CANDIDATE: {userName.toUpperCase()}</div>

        <div className="mt-8">
          <div className="flex justify-between font-mono text-xs text-slate-500 mb-2 tabular-nums">
            <span>CURRICULUM PROGRESS</span>
            <span><motion.span>{displayProgress}</motion.span>%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {MCR_MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          const isCompleted = completedModules[mod.id as MCRModuleId];

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id as MCRModuleId)}
              aria-label={`Select module: ${mod.title}`}
              className={`w-full flex items-center justify-between p-4 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="uppercase tracking-wide">{mod.title}</span>
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </motion.div>
              ) : (
                <Circle className={`w-5 h-5 ${isActive ? 'text-indigo-300' : 'text-slate-300'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
