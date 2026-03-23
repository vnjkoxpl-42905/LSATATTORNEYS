import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface QuickStartProps {
  onStart: () => void;
}

export function QuickStart({ onStart }: QuickStartProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-neutral-900/80 backdrop-blur-xl border border-white/[0.06] p-8 transition-all duration-200 ease-out hover:border-white/[0.12] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.06)] group animate-fade-in">
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4">
          <Zap className="w-3 h-3 text-neutral-400" />
          Quick Start
        </div>

        <h2 className="text-[28px] font-semibold leading-tight mb-2 text-white">
          Start Adaptive Drill
        </h2>

        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          Jump into an intelligent practice session tailored to your performance.
        </p>

        <Button
          onClick={onStart}
          size="lg"
          className="relative overflow-hidden h-11 px-7 text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-150"
        >
          <span className="relative z-10">Start Adaptive Drill</span>
        </Button>
      </div>
    </div>
  );
}
