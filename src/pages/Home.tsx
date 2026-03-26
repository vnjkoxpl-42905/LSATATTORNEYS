import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuestionBank } from '@/contexts/QuestionBankContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { QuickStart } from '@/components/dashboard/QuickStart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SparklineChart } from '@/components/dashboard/SparklineChart';
import { CircularProgress } from '@/components/dashboard/CircularProgress';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { CapsuleCard } from '@/components/dashboard/CapsuleCard';
import { ActionNav } from '@/components/dashboard/ActionNav';
import { RecentPerformanceWidget } from '@/components/dashboard/RecentPerformanceWidget';
import { SectionSelector } from '@/components/drill/SectionSelector';
import { QuestionPicker } from '@/components/drill/QuestionPicker';
import { NaturalDrillCreator } from '@/components/drill/NaturalDrillCreator';
import { SplineScene } from '@/components/ui/splite';
import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { BookOpen, Target, Clock, Flag, XCircle, TrendingUp, Brain, Layers, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DrillMode, FullSectionConfig, TypeDrillConfig } from '@/types/drill';

export default function Home() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { manifest, isLoading, error } = useQuestionBank();
  const [selectedAction, setSelectedAction] = React.useState<DrillMode | null>(null);
  const [stats, setStats] = React.useState({
    totalAttempted: 0,
    avgAccuracy: 0,
    recentStreak: 0,
  });
  const [sparklineData, setSparklineData] = React.useState<Array<{ date: string; count: number }>>([]);
  const [trends] = React.useState<Array<{ label: string; value: string }>>([
    { label: 'Logical Reasoning', value: '72%' },
    { label: 'Inference Questions', value: '68%' },
    { label: 'Argument Structure', value: '65%' },
  ]);

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load user stats
  React.useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attempts } = await supabase
        .from('attempts')
        .select('correct, timestamp_iso')
        .eq('class_id', user.id)
        .gte('timestamp_iso', thirtyDaysAgo.toISOString());

      if (attempts && attempts.length > 0) {
        const correct = attempts.filter((a) => a.correct).length;
        const accuracy = Math.round((correct / attempts.length) * 100);

        setStats({
          totalAttempted: attempts.length,
          avgAccuracy: accuracy,
          recentStreak: 0,
        });

        // Generate sparkline data (group by day)
        const dailyCounts = new Map<string, number>();
        attempts.forEach((attempt) => {
          const date = new Date(attempt.timestamp_iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
        });

        // Create array of last 18 days
        const sparkline: Array<{ date: string; count: number }> = [];
        for (let i = 17; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          sparkline.push({ date: dateStr, count: dailyCounts.get(dateStr) || 0 });
        }
        setSparklineData(sparkline);
      }
    };

    loadStats();
  }, [user]);

  const getFirstName = () => {
    if (!user) return 'there';
    const displayName = user.user_metadata?.display_name || 
                       user.user_metadata?.username || 
                       user.email?.split('@')[0] || 
                       'there';
    const firstName = displayName.split(/[\s._-]/)[0].replace(/[^a-zA-Z]/g, '');
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() || 'there';
  };

  const handleStartAdaptive = () => {
    navigate('/drill', { state: { mode: 'adaptive' } });
  };

  const handleStartSection = (config: FullSectionConfig) => {
    navigate('/drill', { state: { mode: 'full-section', config } });
  };

  const handleStartTypeDrill = (config: TypeDrillConfig) => {
    navigate('/drill', { state: { mode: 'type-drill', config } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Preparing your workspace</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-400">{error}</p>
      </div>
    );
  }

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <div className="min-h-screen flex bg-neutral-950">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/[0.06] bg-neutral-950 flex flex-col">
          <div className="p-6 border-b border-white/[0.06]">
            <h1 className="text-xl font-semibold text-white tracking-tight">LR Smart Drill</h1>
            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-[0.15em] font-medium">Command Center</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <ActionNav 
              onSelectAction={setSelectedAction} 
              selectedAction={selectedAction} 
            />
          </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-950">
          {/* Header */}
          <header className="border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="px-8 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">
                  Welcome back, {getFirstName()}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  onClick={() => navigate('/profile')}
                >
                  <Avatar className="h-7 w-7 border border-white/[0.08]">
                    <AvatarFallback className="text-xs bg-neutral-800 text-neutral-300">{userInitials}</AvatarFallback>
                  </Avatar>
                  Profile
                </Button>
              </div>
            </div>
          </header>

          <div className="p-8 space-y-10 max-w-7xl mx-auto animate-fade-in">
            {!selectedAction && (
              <>
                {/* 3D Hero Banner */}
                <Card className="w-full h-[280px] bg-black/[0.96] relative overflow-hidden rounded-xl">
                  <BackgroundPaths />
                  <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="white"
                  />
                  <div className="flex h-full">
                    <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                      <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        LR Smart Drill
                      </h1>
                      <p className="mt-3 text-sm text-neutral-400 max-w-md leading-relaxed">
                        Adaptive practice powered by real LSAT logic. Sharpen your reasoning, track your growth, and drill with precision.
                      </p>
                      <div className="mt-5">
                        <Button
                          onClick={handleStartAdaptive}
                          size="sm"
                          className="bg-white text-black hover:bg-neutral-200 font-medium"
                        >
                          Start Drilling
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 relative hidden md:block">
                      <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </Card>

                {/* Hero Quick Start */}
                <QuickStart onStart={handleStartAdaptive} />

                {/* At a Glance - New Visualization Grid */}
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">
                    At a Glance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Questions Practiced - Sparkline */}
                    <MetricCard className="md:col-span-1">
                      <div className="flex flex-col h-full min-h-[140px]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-4">
                          Questions Practiced
                        </p>
                        <SparklineChart data={sparklineData} total={stats.totalAttempted} />
                      </div>
                    </MetricCard>

                    {/* Accuracy - Circular Progress */}
                    <MetricCard className="flex items-center justify-center min-h-[140px]">
                      <CircularProgress value={stats.totalAttempted > 0 ? stats.avgAccuracy : 0} />
                    </MetricCard>

                    {/* Opportunities - Trend Chart */}
                    <MetricCard className="md:col-span-1">
                      <div className="flex flex-col h-full min-h-[140px]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-4">
                          Opportunities
                        </p>
                        <TrendChart trends={trends} onViewDetails={() => navigate('/analytics')} />
                      </div>
                    </MetricCard>
                  </div>
                </div>

                {/* Recent Performance Widget */}
                <RecentPerformanceWidget />

                {/* Quick Access - Bento Grid */}
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">
                    Quick Access
                  </h3>
                  <BentoGrid className="lg:grid-rows-3 auto-rows-[11rem]">
                    <BentoCard
                      name="Wrong Answer Journal"
                      className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
                      Icon={XCircle}
                      description="Review mistakes and track your growth patterns over time."
                      href="/waj"
                      cta="Open Journal"
                      background={
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.07] via-transparent to-transparent" />
                      }
                    />
                    <BentoCard
                      name="Flagged Questions"
                      className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
                      Icon={Flag}
                      description="Questions you marked for deeper review."
                      href="/flagged"
                      cta="View Flagged"
                      background={
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-transparent" />
                      }
                    />
                    <BentoCard
                      name="Adaptive Drill"
                      className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4"
                      Icon={Brain}
                      description="AI-powered practice that adapts to your skill level in real time."
                      href="/drill"
                      cta="Start Drilling"
                      background={
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-transparent" />
                      }
                    />
                    <BentoCard
                      name="Analytics"
                      className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
                      Icon={BarChart3}
                      description="Detailed performance insights and trends."
                      href="/analytics"
                      cta="View Analytics"
                      background={
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent" />
                      }
                    />
                    <BentoCard
                      name="Full Section Practice"
                      className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4"
                      Icon={Layers}
                      description="Timed, full-length LR sections under real test conditions."
                      href="/"
                      cta="Choose Section"
                      background={
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent" />
                      }
                    />
                  </BentoGrid>
                </div>
              </>
            )}

            {/* Action-specific content */}
            {selectedAction === 'adaptive' && (
              <div className="max-w-2xl mx-auto text-center space-y-6 animate-slide-up">
                <h2 className="text-2xl font-semibold">Start Adaptive Drill</h2>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleStartAdaptive} size="lg">
                    Begin Practice
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedAction(null)}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {selectedAction === 'full-section' && manifest && (
              <div className="animate-slide-up">
                <SectionSelector
                  manifest={manifest}
                  onStartSection={handleStartSection}
                  onCancel={() => setSelectedAction(null)}
                />
              </div>
            )}

            {selectedAction === 'type-drill' && manifest && (
              <div className="animate-slide-up">
                <QuestionPicker
                  manifest={manifest}
                  onStartDrill={handleStartTypeDrill}
                  onCancel={() => setSelectedAction(null)}
                />
              </div>
            )}

            {selectedAction === 'natural-drill' && (
              <div className="animate-slide-up">
                <NaturalDrillCreator
                  onStartDrill={handleStartTypeDrill}
                  onCancel={() => setSelectedAction(null)}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
