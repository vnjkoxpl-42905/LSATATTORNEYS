import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoutButton } from '@/components/LogoutButton';
import { MCRSidebar, MCRModuleId, MCR_MODULES } from '@/components/bootcamp/mcr/MCRSidebar';
import { MCRModuleProvider } from '@/context/MCRModuleContext';
import { MCRIntroModule } from '@/components/bootcamp/mcr/modules/MCRIntroModule';
import { MCRAnatomyModule } from '@/components/bootcamp/mcr/modules/MCRAnatomyModule';
import { MCRCoreModule } from '@/components/bootcamp/mcr/modules/MCRCoreModule';
import { MCRComponentsModule } from '@/components/bootcamp/mcr/modules/MCRComponentsModule';
import { MCRProcessModule } from '@/components/bootcamp/mcr/modules/MCRProcessModule';
import { MCRContextModule } from '@/components/bootcamp/mcr/modules/MCRContextModule';

const STORAGE_KEY = 'mcrCompletedModules';

const defaultCompleted: Record<MCRModuleId, boolean> = {
  intro: false,
  anatomy: false,
  core: false,
  components: false,
  process: false,
  context: false,
};

function loadCompleted(): Record<MCRModuleId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCompleted;
    return { ...defaultCompleted, ...JSON.parse(raw) };
  } catch {
    return defaultCompleted;
  }
}

const MainConclusionRole: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<MCRModuleId>('intro');
  const [completedModules, setCompletedModules] = useState<Record<MCRModuleId, boolean>>(loadCompleted);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  if (!user) return null;

  const userName = user.email?.split('@')[0] ?? 'Candidate';

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === 'ArrowLeft') {
      const currentIndex = MCR_MODULES.findIndex(m => m.id === activeModule);
      if (currentIndex > 0) setActiveModule(MCR_MODULES[currentIndex - 1].id as MCRModuleId);
    } else if (event.key === 'ArrowRight') {
      const currentIndex = MCR_MODULES.findIndex(m => m.id === activeModule);
      if (currentIndex < MCR_MODULES.length - 1) setActiveModule(MCR_MODULES[currentIndex + 1].id as MCRModuleId);
    } else if (event.key.toLowerCase() === 'f') {
      setFocusMode(prev => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModule]);

  const handleComplete = (id: MCRModuleId) => {
    const updated = { ...completedModules, [id]: true };
    setCompletedModules(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const currentIndex = MCR_MODULES.findIndex(m => m.id === id);
    if (currentIndex !== -1 && currentIndex < MCR_MODULES.length - 1) {
      setActiveModule(MCR_MODULES[currentIndex + 1].id as MCRModuleId);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MCRSidebar
          userName={userName}
          activeModule={activeModule}
          completedModules={completedModules}
          onSelectModule={setActiveModule}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top HUD */}
        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 z-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/classroom')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] font-bold tracking-widest hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              CLASSROOM
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Focus Mode</span>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${focusMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
              aria-label={focusMode ? 'Disable focus mode' : 'Enable focus mode'}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: focusMode ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation (Horizontal Scroll) */}
        <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto flex-shrink-0">
          <div className="flex p-2 gap-2 min-w-max">
            {MCR_MODULES.map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as MCRModuleId)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                  activeModule === mod.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                }`}
              >
                {mod.title}
                {completedModules[mod.id as MCRModuleId] && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-20">
            <MCRModuleProvider value={{
              focusMode,
              isCompleted: completedModules[activeModule],
              onComplete: () => handleComplete(activeModule),
              userName,
            }}>
              <AnimatePresence mode="wait">
                {activeModule === 'intro'      && <MCRIntroModule key="intro" />}
                {activeModule === 'anatomy'    && <MCRAnatomyModule key="anatomy" />}
                {activeModule === 'core'       && <MCRCoreModule key="core" />}
                {activeModule === 'components' && <MCRComponentsModule key="components" />}
                {activeModule === 'process'    && <MCRProcessModule key="process" />}
                {activeModule === 'context'    && <MCRContextModule key="context" />}
              </AnimatePresence>
            </MCRModuleProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainConclusionRole;
