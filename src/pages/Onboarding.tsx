import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ChevronRight, Target, CalendarDays, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const WEAKNESS_OPTIONS = [
  'Necessary Assumption',
  'Sufficient Assumption',
  'Weaken',
  'Strengthen',
  'Flaw',
  'Inference / Must Be True',
  'Parallel Reasoning',
  'Method of Reasoning',
  'Paradox',
  'Principle',
  'Not sure yet',
];

type Step = 1 | 2 | 3;

export default function Onboarding() {
  const { user, markOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [targetScore, setTargetScore] = useState<number>(170);
  const [testDate, setTestDate] = useState('');
  const [weakness, setWeakness] = useState('');
  const [saving, setSaving] = useState(false);

  const canAdvance = () => {
    if (step === 1) return true; // slider always has a valid value
    if (step === 2) return testDate !== '';
    if (step === 3) return weakness !== '';
    return false;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Primary store: auth user_metadata — always available, no migration required
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          target_score: targetScore,
          test_date: testDate || null,
          primary_weakness: weakness,
          onboarding_completed: true,
        },
      });

      if (metaError) throw metaError;

      // Best-effort: also persist to students table (requires migration to be applied)
      await (supabase as any)
        .from('students')
        .update({
          target_score: targetScore,
          test_date: testDate || null,
          primary_weakness: weakness,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      toast.success('Welcome aboard! Your profile is set.');
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      toast.error('Could not save preferences. You can update them in Profile.');
    } finally {
      // Always unlock the gate and navigate — never leave the user stuck
      markOnboardingComplete();
      navigate('/foyer', { replace: true });
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else handleFinish();
  };

  const stepMeta = [
    { icon: Target,       label: 'Target Score' },
    { icon: CalendarDays, label: 'Test Date'     },
    { icon: Brain,        label: 'Weakness'      },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {stepMeta.map((meta, i) => {
          const num = (i + 1) as Step;
          const active = num === step;
          const done   = num < step;
          const Icon   = meta.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300',
                  done   && 'bg-foreground text-background',
                  active && 'bg-foreground/10 border border-foreground text-foreground',
                  !done && !active && 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < 2 && (
                <div className={cn('h-px w-8 transition-all duration-500', done ? 'bg-foreground' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-md">
        {/* ── Step 1: Target Score ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Step 1 of 3</p>
              <h1 className="text-2xl font-semibold">What's your target score?</h1>
              <p className="text-sm text-muted-foreground">We'll pace your practice around this goal.</p>
            </div>

            {/* Score display */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-8xl font-extralight tracking-tighter tabular-nums select-none">
                {targetScore}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {targetScore === 180 ? 'Perfect score' : targetScore >= 175 ? 'Elite tier' : targetScore >= 170 ? 'Top 2%' : targetScore >= 165 ? 'Top 5%' : targetScore >= 160 ? 'Top 15%' : 'Good target'}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-3 px-1">
              <Slider
                min={120}
                max={180}
                step={1}
                value={[targetScore]}
                onValueChange={(val) => setTargetScore(val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium tabular-nums">
                <span>120</span>
                <span>180</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Test Date ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Step 2 of 3</p>
              <h1 className="text-2xl font-semibold">When is your test date?</h1>
              <p className="text-sm text-muted-foreground">Helps us show how many days you have left to prepare.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={cn(
                  'w-full rounded-xl border bg-card px-4 py-3 text-center text-lg font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-foreground/30',
                  'text-foreground border-border'
                )}
              />
              <button
                onClick={() => { setTestDate(''); handleNext(); }}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Skip — I don't have a date yet
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Biggest Weakness ─────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Step 3 of 3</p>
              <h1 className="text-2xl font-semibold">What's your biggest weakness?</h1>
              <p className="text-sm text-muted-foreground">Your Smart Drill will target this type first.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {WEAKNESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setWeakness(opt)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition-all duration-150',
                    weakness === opt
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-foreground hover:border-foreground/50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canAdvance() || saving}
            className="gap-2 px-6"
          >
            {step === 3 ? (saving ? 'Saving…' : 'Get Started') : 'Continue'}
            {step < 3 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
