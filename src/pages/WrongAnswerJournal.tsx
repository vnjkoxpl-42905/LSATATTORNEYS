import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { getWAJEntries, type WAJEntry, type WAJHistoryItem } from '@/lib/wajService';
import { questionBank } from '@/lib/questionLoader';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(ms: number | null | undefined): string {
  if (ms == null || isNaN(ms)) return '—';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${seconds}s`;
}

/** Safely parse history_json — always returns an array */
function safeHistory(raw: unknown): WAJHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => item && typeof item === 'object');
}

// ─────────────────────────────────────────────────────────────────────────────
// Dark label component
// ─────────────────────────────────────────────────────────────────────────────
function IL({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium select-none">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: 'wrong' | 'right' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium',
        status === 'right'
          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
          : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
      )}
    >
      {status === 'right' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {status === 'right' ? 'Correct' : 'Wrong'}
    </span>
  );
}

function QTypeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-800 text-neutral-300 ring-1 ring-white/[0.06]">
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function WrongAnswerJournal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<WAJEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedEntry, setSelectedEntry] = React.useState<WAJEntry | null>(null);
  const [classId, setClassId] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<{
    qtype?: string;
    level?: number;
    pt?: number;
    last_status?: 'wrong' | 'right';
  }>({});

  // Auth guard
  React.useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  // Resolve class_id — guard: if lookup fails, stop loading
  React.useEffect(() => {
    if (!user) return;
    const fetchClassId = async () => {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('class_id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (student?.class_id) {
          setClassId(student.class_id);
        } else {
          // No student record — stop loading so page renders the empty state
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    fetchClassId();
  }, [user]);

  // Load entries when classId resolves or filters change
  React.useEffect(() => {
    if (classId) loadEntries();
  }, [filters, classId]);

  const loadEntries = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await getWAJEntries(classId, filters);
      setEntries(data ?? []);
    } catch (err) {
      console.error('Failed to load WAJ entries:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReattempt = (entry: WAJEntry) => {
    navigate('/drill', {
      state: {
        mode: 'type-drill',
        config: {
          qtypes: [entry.qtype],
          difficulties: [entry.level],
          pts: [entry.pt],
          count: 1,
        },
      },
    });
  };

  // Derived filter options — guard against questionBank not loaded
  const allQTypes = React.useMemo(() => {
    try {
      return Array.from(new Set(questionBank.getAllQuestions().map((q) => q.qtype)));
    } catch {
      return [];
    }
  }, []);

  const allPTs = React.useMemo(() => {
    try {
      return Array.from(new Set(questionBank.getAllQuestions().map((q) => q.pt))).sort(
        (a, b) => a - b,
      );
    } catch {
      return [];
    }
  }, []);

  const allLevels = [1, 2, 3, 4, 5];
  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-950">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] -ml-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Workspace
          </Button>
          <IL>Wrong Answer Journal</IL>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-5">

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div
          className={cn(
            'rounded-xl bg-neutral-900/80 border border-white/[0.06] p-4',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
          )}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {/* Question Type */}
            <Select
              value={filters.qtype || 'all'}
              onValueChange={(v) =>
                setFilters({ ...filters, qtype: v === 'all' ? undefined : v })
              }
            >
              <SelectTrigger className="w-[190px] h-8 bg-neutral-800 border-neutral-700/80 text-neutral-200 text-[13px] focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="All Question Types" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700/80 text-neutral-200">
                <SelectItem value="all" className="text-[13px] focus:bg-neutral-800 focus:text-white">
                  All Question Types
                </SelectItem>
                {allQTypes.map((qt) => (
                  <SelectItem key={qt} value={qt} className="text-[13px] focus:bg-neutral-800 focus:text-white">
                    {qt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level */}
            <Select
              value={filters.level?.toString() || 'all'}
              onValueChange={(v) =>
                setFilters({ ...filters, level: v === 'all' ? undefined : parseInt(v) })
              }
            >
              <SelectTrigger className="w-[130px] h-8 bg-neutral-800 border-neutral-700/80 text-neutral-200 text-[13px] focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700/80 text-neutral-200">
                <SelectItem value="all" className="text-[13px] focus:bg-neutral-800 focus:text-white">
                  All Levels
                </SelectItem>
                {allLevels.map((l) => (
                  <SelectItem key={l} value={l.toString()} className="text-[13px] focus:bg-neutral-800 focus:text-white">
                    Level {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* PT */}
            <Select
              value={filters.pt?.toString() || 'all'}
              onValueChange={(v) =>
                setFilters({ ...filters, pt: v === 'all' ? undefined : parseInt(v) })
              }
            >
              <SelectTrigger className="w-[120px] h-8 bg-neutral-800 border-neutral-700/80 text-neutral-200 text-[13px] focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="All PTs" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700/80 text-neutral-200">
                <SelectItem value="all" className="text-[13px] focus:bg-neutral-800 focus:text-white">
                  All PTs
                </SelectItem>
                {allPTs.map((pt) => (
                  <SelectItem key={pt} value={pt.toString()} className="text-[13px] focus:bg-neutral-800 focus:text-white">
                    PT {pt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.last_status || 'all'}
              onValueChange={(v) =>
                setFilters({
                  ...filters,
                  last_status: v === 'all' ? undefined : (v as 'wrong' | 'right'),
                })
              }
            >
              <SelectTrigger className="w-[140px] h-8 bg-neutral-800 border-neutral-700/80 text-neutral-200 text-[13px] focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700/80 text-neutral-200">
                <SelectItem value="all" className="text-[13px] focus:bg-neutral-800 focus:text-white">
                  All Status
                </SelectItem>
                <SelectItem value="wrong" className="text-[13px] focus:bg-neutral-800 focus:text-white">
                  Still Wrong
                </SelectItem>
                <SelectItem value="right" className="text-[13px] focus:bg-neutral-800 focus:text-white">
                  Now Correct
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
                className="gap-1.5 h-8 text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.05] text-[11px] px-3"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* ── Entry list ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-8 h-8 border border-white/10 border-t-white/30 rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Loading</p>
          </div>
        ) : entries.length === 0 ? (
          <div
            className={cn(
              'rounded-xl bg-neutral-900/60 border border-white/[0.06] p-16',
              'flex flex-col items-center gap-3 text-center',
            )}
          >
            <p className="text-neutral-300 text-[15px] font-medium">No wrong answers yet</p>
            <p className="text-neutral-600 text-[13px]">
              {hasFilters
                ? 'No entries match the current filters.'
                : 'Keep practicing — your missed questions will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={cn(
                  'group w-full text-left rounded-xl px-4 py-3.5',
                  'bg-neutral-900/70 border border-white/[0.06]',
                  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
                  'hover:bg-neutral-900 hover:border-white/[0.10]',
                  'transition-all duration-150',
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: identity + badges */}
                  <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <span className="text-[13px] font-mono font-medium text-white shrink-0">
                      PT{entry.pt}–S{entry.section}–Q{entry.qnum}
                    </span>
                    <QTypeBadge label={entry.qtype} />
                    <span className="text-[11px] text-neutral-500 tabular-nums shrink-0">
                      Lvl {entry.level}
                    </span>
                    <StatusBadge
                      status={entry.last_status === 'right' ? 'right' : 'wrong'}
                    />
                    {entry.revisit_count > 0 && (
                      <span className="text-[11px] text-neutral-600 shrink-0">
                        {entry.revisit_count + 1} attempts
                      </span>
                    )}
                  </div>

                  {/* Right: reattempt button */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReattempt(entry);
                    }}
                    className="shrink-0 h-7 px-3 text-[11px] gap-1.5 bg-white/[0.07] hover:bg-white/[0.12] text-neutral-200 border-0"
                  >
                    <Play className="w-3 h-3" />
                    Reattempt
                  </Button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Sheet ─────────────────────────────────────────────────────── */}
      <Sheet open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-neutral-950 border-l border-white/[0.06]">
          {selectedEntry && (
            <>
              <SheetHeader className="pb-4 border-b border-white/[0.06]">
                <SheetTitle className="text-white font-mono text-[15px]">
                  PT{selectedEntry.pt}–S{selectedEntry.section}–Q{selectedEntry.qnum}
                </SheetTitle>
                <div className="flex items-center gap-2 pt-1">
                  <QTypeBadge label={selectedEntry.qtype} />
                  <span className="text-[11px] text-neutral-500">Level {selectedEntry.level}</span>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                {/* Attempt history */}
                {safeHistory(selectedEntry.history_json).length === 0 ? (
                  <p className="text-neutral-500 text-sm py-8 text-center">
                    No attempt history available.
                  </p>
                ) : (
                  safeHistory(selectedEntry.history_json).map((item, idx) => {
                    const histItem = item as WAJHistoryItem;
                    const isCorrect = histItem.result === 1;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'rounded-xl border p-4 space-y-3',
                          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
                          isCorrect
                            ? 'bg-emerald-500/[0.06] border-emerald-500/20'
                            : 'bg-neutral-900/80 border-white/[0.07]',
                        )}
                      >
                        {/* Row: date + result badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-neutral-500 tabular-nums">
                            {histItem.attempt_at_iso
                              ? new Date(histItem.attempt_at_iso).toLocaleString()
                              : '—'}
                          </span>
                          <StatusBadge status={isCorrect ? 'right' : 'wrong'} />
                        </div>

                        {/* Answer + Time + Confidence grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <div>
                            <IL>Chosen</IL>
                            <div className="text-[13px] text-neutral-200 mt-1 font-mono">
                              ({histItem.chosen_answer ?? '—'})
                            </div>
                          </div>
                          <div>
                            <IL>Correct</IL>
                            <div className="text-[13px] text-neutral-200 mt-1 font-mono">
                              ({histItem.correct_answer ?? '—'})
                            </div>
                          </div>
                          <div>
                            <IL>Time</IL>
                            <div className="text-[13px] text-neutral-200 mt-1 tabular-nums">
                              {formatTime(histItem.time_ms)}
                            </div>
                          </div>
                          {histItem.confidence_1_5 != null && (
                            <div>
                              <IL>Confidence</IL>
                              <div className="text-[13px] text-neutral-200 mt-1 tabular-nums">
                                {histItem.confidence_1_5} / 5
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Review notes */}
                        {histItem.review && (
                          <div className="pt-3 border-t border-white/[0.06] space-y-3">
                            {histItem.review.q1 && (
                              <div>
                                <IL>Why I chose the wrong answer</IL>
                                <p className="text-[13px] text-neutral-300 mt-1 leading-relaxed">
                                  {histItem.review.q1}
                                </p>
                              </div>
                            )}
                            {histItem.review.q2 && (
                              <div>
                                <IL>Why I eliminated the right answer</IL>
                                <p className="text-[13px] text-neutral-300 mt-1 leading-relaxed">
                                  {histItem.review.q2}
                                </p>
                              </div>
                            )}
                            {histItem.review.q3 && (
                              <div>
                                <IL>Plan to avoid next time</IL>
                                <p className="text-[13px] text-neutral-300 mt-1 leading-relaxed">
                                  {histItem.review.q3}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
