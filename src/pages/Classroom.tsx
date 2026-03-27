import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ClipboardList, RotateCcw, Flag, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_ASSIGNMENTS,
  MOCK_MATERIALS,
  STATUS_LABEL,
  TYPE_LABEL,
  type AssignmentStatus,
  type ClassroomAssignment,
} from '@/lib/classroomData';

// ─────────────────────────────────────────────────────────────────────────────
// Small utility components
// ─────────────────────────────────────────────────────────────────────────────

function IL({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium select-none">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const styles: Record<AssignmentStatus, string> = {
    assigned:        'bg-neutral-800 text-neutral-300 ring-neutral-700/60',
    in_progress:     'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    submitted:       'bg-sky-500/10 text-sky-400 ring-sky-500/20',
    returned:        'bg-indigo-500/10 text-indigo-300 ring-indigo-500/20',
    revision_needed: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
    completed:       'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1',
      styles[status],
    )}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: ClassroomAssignment['type'] }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-800 text-neutral-400 ring-1 ring-white/[0.06]">
      {TYPE_LABEL[type]}
    </span>
  );
}

function formatDue(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isPastDue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

// ─────────────────────────────────────────────────────────────────────────────
// Assignment card
// ─────────────────────────────────────────────────────────────────────────────

function AssignmentCard({ a, onLaunch }: { a: ClassroomAssignment; onLaunch: (a: ClassroomAssignment) => void }) {
  const overdue = isPastDue(a.dueDate) && a.status !== 'submitted' && a.status !== 'completed' && a.status !== 'returned';
  const hasFeedback = !!a.feedback && (a.status === 'returned' || a.status === 'revision_needed' || a.status === 'completed');
  const unreadFeedback = hasFeedback && !a.feedback!.opened;

  return (
    <div className={cn(
      'rounded-xl bg-neutral-900/80 border border-white/[0.06]',
      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
      'p-5 flex flex-col gap-3',
      unreadFeedback && 'ring-1 ring-indigo-500/30',
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <TypeBadge type={a.type} />
            {unreadFeedback && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25">
                Feedback returned
              </span>
            )}
          </div>
          <h3 className="text-[14px] font-medium text-neutral-100 leading-snug">{a.title}</h3>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* Description */}
      <p className="text-[13px] text-neutral-400 leading-relaxed">{a.description}</p>

      {/* Feedback preview */}
      {hasFeedback && a.feedback && (
        <div className={cn(
          'rounded-lg px-4 py-3 border text-[12px] leading-relaxed',
          a.status === 'revision_needed'
            ? 'bg-orange-500/[0.06] border-orange-500/20 text-orange-300/80'
            : 'bg-indigo-500/[0.06] border-indigo-500/20 text-indigo-300/80',
        )}>
          <IL>{a.status === 'revision_needed' ? 'Revision note' : 'Instructor feedback'}</IL>
          <p className="mt-1">{a.feedback.comments}</p>
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {a.dueDate && (
            <span className={cn(
              'text-[12px]',
              overdue ? 'text-rose-400' : 'text-neutral-500',
            )}>
              {overdue ? 'Overdue — ' : 'Due '}{formatDue(a.dueDate)}
            </span>
          )}
          {a.feedback?.score !== undefined && (
            <span className="text-[12px] text-emerald-400">{a.feedback.score}%</span>
          )}
        </div>
        {a.linkedRoute && (a.status === 'assigned' || a.status === 'in_progress') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onLaunch(a)}
            className="h-7 px-3 text-[12px] text-neutral-300 hover:text-white hover:bg-white/[0.06] gap-1.5"
          >
            {a.status === 'in_progress' ? 'Resume' : 'Start'}
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
        {(a.status === 'revision_needed') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onLaunch(a)}
            className="h-7 px-3 text-[12px] text-orange-400 hover:text-orange-300 hover:bg-orange-500/[0.08] gap-1.5"
          >
            Revise & Resubmit
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const navigate = useNavigate();

  const counts = React.useMemo(() => ({
    assigned:        MOCK_ASSIGNMENTS.filter(a => a.status === 'assigned').length,
    in_progress:     MOCK_ASSIGNMENTS.filter(a => a.status === 'in_progress').length,
    submitted:       MOCK_ASSIGNMENTS.filter(a => a.status === 'submitted').length,
    returned:        MOCK_ASSIGNMENTS.filter(a => a.status === 'returned' || a.status === 'revision_needed').length,
    completed:       MOCK_ASSIGNMENTS.filter(a => a.status === 'completed').length,
  }), []);

  const priority = MOCK_ASSIGNMENTS
    .filter(a => a.status === 'assigned' || a.status === 'in_progress' || a.status === 'revision_needed')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })[0];

  const unreadFeedback = MOCK_ASSIGNMENTS.filter(
    a => a.feedback && !a.feedback.opened && (a.status === 'returned' || a.status === 'revision_needed'),
  );

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Assigned', value: counts.assigned, color: 'text-neutral-300' },
          { label: 'In Progress', value: counts.in_progress, color: 'text-amber-400' },
          { label: 'Submitted', value: counts.submitted, color: 'text-sky-400' },
          { label: 'Needs Attention', value: counts.returned, color: 'text-indigo-300' },
          { label: 'Completed', value: counts.completed, color: 'text-emerald-400' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-4 py-4 flex flex-col gap-1"
          >
            <span className={cn('text-[22px] font-light tabular-nums', stat.color)}>{stat.value}</span>
            <IL>{stat.label}</IL>
          </div>
        ))}
      </div>

      {/* Unread feedback alert */}
      {unreadFeedback.length > 0 && (
        <button
          onClick={() => onTabChange('feedback')}
          className="w-full rounded-xl bg-indigo-500/[0.07] border border-indigo-500/25 px-5 py-4 flex items-center justify-between text-left hover:bg-indigo-500/[0.11] transition-colors duration-150"
        >
          <div>
            <p className="text-[13px] font-medium text-indigo-200">
              {unreadFeedback.length === 1
                ? '1 item has unread feedback'
                : `${unreadFeedback.length} items have unread feedback`}
            </p>
            <p className="text-[12px] text-indigo-400/70 mt-0.5">Open Feedback to review returned work.</p>
          </div>
          <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0" />
        </button>
      )}

      {/* Priority work */}
      {priority && (
        <div className="space-y-2">
          <IL>Priority</IL>
          <div className="rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={priority.status} />
                {priority.dueDate && (
                  <span className={cn(
                    'text-[12px]',
                    isPastDue(priority.dueDate) ? 'text-rose-400' : 'text-neutral-500',
                  )}>
                    {isPastDue(priority.dueDate) ? 'Overdue — ' : 'Due '}{formatDue(priority.dueDate)}
                  </span>
                )}
              </div>
              <p className="text-[14px] font-medium text-neutral-100 truncate">{priority.title}</p>
            </div>
            <Button
              size="sm"
              onClick={() => onTabChange('assignments')}
              className="shrink-0 h-8 px-4 text-[12px] bg-white/[0.07] hover:bg-white/[0.12] text-neutral-200 border border-white/[0.08] rounded-lg"
            >
              View
            </Button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="space-y-2">
        <IL>Quick Access</IL>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: ClipboardList,
              label: 'Assignments',
              sub: 'All assigned work',
              action: () => onTabChange('assignments'),
            },
            {
              icon: BookOpen,
              label: 'Materials',
              sub: 'Lesson notes & reading',
              action: () => onTabChange('materials'),
            },
            {
              icon: RotateCcw,
              label: 'Review Tools',
              sub: 'WAJ & flagged questions',
              action: () => onTabChange('review'),
            },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-4 py-4 flex flex-col gap-2.5 text-left hover:bg-neutral-800/80 hover:border-white/[0.1] transition-colors duration-150 group"
            >
              <item.icon className="h-4 w-4 text-neutral-500 group-hover:text-neutral-300 transition-colors duration-150" />
              <div>
                <p className="text-[13px] font-medium text-neutral-200">{item.label}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assignments tab
// ─────────────────────────────────────────────────────────────────────────────

type StatusFilter = AssignmentStatus | 'all';

function AssignmentsTab() {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState<StatusFilter>('all');

  const filtered = MOCK_ASSIGNMENTS.filter(a =>
    filter === 'all' ? true : a.status === filter,
  ).sort((a, b) => {
    const order: Record<AssignmentStatus, number> = {
      revision_needed: 0,
      in_progress: 1,
      assigned: 2,
      returned: 3,
      submitted: 4,
      completed: 5,
    };
    return order[a.status] - order[b.status];
  });

  const handleLaunch = (a: ClassroomAssignment) => {
    if (a.linkedRoute) navigate(a.linkedRoute);
  };

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'returned', label: 'Returned' },
    { value: 'revision_needed', label: 'Revision Needed' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors duration-150',
              filter === opt.value
                ? 'bg-white/[0.09] text-white border border-white/[0.12]'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] border border-transparent',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(a => (
          <AssignmentCard key={a.id} a={a} onLaunch={handleLaunch} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl bg-neutral-900/80 border border-white/[0.06] px-6 py-10 text-center">
            <p className="text-[13px] text-neutral-500">No assignments in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Materials tab
// ─────────────────────────────────────────────────────────────────────────────

function MaterialsTab() {
  return (
    <div className="space-y-3">
      {MOCK_MATERIALS.map(m => (
        <div
          key={m.id}
          className="rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-5 py-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-800 text-neutral-400 ring-1 ring-white/[0.06]">
                  {m.topic}
                </span>
              </div>
              <h3 className="text-[14px] font-medium text-neutral-100">{m.title}</h3>
            </div>
            <span className="text-[11px] text-neutral-600 shrink-0">
              {new Date(m.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="text-[13px] text-neutral-400 leading-relaxed">{m.summary}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback tab
// ─────────────────────────────────────────────────────────────────────────────

function FeedbackTab() {
  const withFeedback = MOCK_ASSIGNMENTS.filter(a => !!a.feedback);

  return (
    <div className="space-y-3">
      {withFeedback.length === 0 && (
        <div className="rounded-xl bg-neutral-900/80 border border-white/[0.06] px-6 py-10 text-center">
          <p className="text-[13px] text-neutral-500">No feedback returned yet.</p>
        </div>
      )}
      {withFeedback.map(a => (
        <div
          key={a.id}
          className={cn(
            'rounded-xl bg-neutral-900/80 border border-white/[0.06]',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-5 py-4 space-y-3',
            !a.feedback!.opened && 'ring-1 ring-indigo-500/30',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={a.status} />
                {!a.feedback!.opened && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25">
                    Unread
                  </span>
                )}
              </div>
              <h3 className="text-[14px] font-medium text-neutral-100">{a.title}</h3>
            </div>
            {a.feedback!.score !== undefined && (
              <span className="text-[20px] font-light text-emerald-400 tabular-nums shrink-0">
                {a.feedback!.score}%
              </span>
            )}
          </div>
          <div className="rounded-lg px-4 py-3 bg-neutral-800/60 border border-white/[0.04]">
            <IL>Instructor comment</IL>
            <p className="mt-1.5 text-[13px] text-neutral-300 leading-relaxed">{a.feedback!.comments}</p>
          </div>
          <div className="text-[11px] text-neutral-600">
            Returned {new Date(a.feedback!.returnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Submissions tab — stub for Phase 1
// ─────────────────────────────────────────────────────────────────────────────

function SubmissionsTab() {
  const submitted = MOCK_ASSIGNMENTS.filter(
    a => a.status === 'submitted' || a.status === 'returned' || a.status === 'completed',
  );

  return (
    <div className="space-y-3">
      {submitted.map(a => (
        <div
          key={a.id}
          className="rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-5 py-4 flex items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TypeBadge type={a.type} />
            </div>
            <h3 className="text-[14px] font-medium text-neutral-100">{a.title}</h3>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
      {submitted.length === 0 && (
        <div className="rounded-xl bg-neutral-900/80 border border-white/[0.06] px-6 py-10 text-center">
          <p className="text-[13px] text-neutral-500">No submissions yet.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Review tab — WAJ + Flagged Questions
// ─────────────────────────────────────────────────────────────────────────────

function ReviewTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <button
        onClick={() => navigate('/waj')}
        className="w-full rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-5 py-5 flex items-center justify-between gap-4 text-left hover:bg-neutral-800/80 hover:border-white/[0.1] transition-colors duration-150 group"
      >
        <div className="flex items-start gap-4">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <RotateCcw className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-neutral-100">Wrong Answer Journal</p>
            <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">
              Review every missed question, track reattempt history, and build your correction record.
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 shrink-0 transition-colors duration-150" />
      </button>

      <button
        onClick={() => navigate('/flagged')}
        className="w-full rounded-xl bg-neutral-900/80 border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-5 py-5 flex items-center justify-between gap-4 text-left hover:bg-neutral-800/80 hover:border-white/[0.1] transition-colors duration-150 group"
      >
        <div className="flex items-start gap-4">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flag className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-neutral-100">Flagged Questions</p>
            <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">
              Questions you marked for later review. Return to them, reattempt, or clear the flag.
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 shrink-0 transition-colors duration-150" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definition
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'assignments' | 'materials' | 'submissions' | 'feedback' | 'review';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'assignments',  label: 'Assignments' },
  { id: 'materials',    label: 'Materials' },
  { id: 'submissions',  label: 'Submissions' },
  { id: 'feedback',     label: 'Feedback' },
  { id: 'review',       label: 'Review Tools' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Classroom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');

  React.useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  const unreadFeedbackCount = MOCK_ASSIGNMENTS.filter(
    a => a.feedback && !a.feedback.opened && (a.status === 'returned' || a.status === 'revision_needed'),
  ).length;

  return (
    <div className="min-h-screen bg-neutral-950">

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-xl">
        <div className="px-8 py-4 flex items-center justify-between max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] -ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Workspace
          </Button>
          <IL>Classroom</IL>
          <div className="w-[130px]" /> {/* balance spacer */}
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────────── */}
        <div className="px-8 max-w-5xl mx-auto flex items-end gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors duration-150 shrink-0',
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              {tab.label}
              {tab.id === 'feedback' && unreadFeedbackCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/40 text-[9px] font-medium text-indigo-200">
                  {unreadFeedbackCount}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-4 right-4 h-px bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-8 py-8">
        {activeTab === 'overview'    && <OverviewTab onTabChange={(t) => setActiveTab(t as TabId)} />}
        {activeTab === 'assignments' && <AssignmentsTab />}
        {activeTab === 'materials'   && <MaterialsTab />}
        {activeTab === 'submissions' && <SubmissionsTab />}
        {activeTab === 'feedback'    && <FeedbackTab />}
        {activeTab === 'review'      && <ReviewTab />}
      </main>
    </div>
  );
}
