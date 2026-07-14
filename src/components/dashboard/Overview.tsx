import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Layout,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Eye,
  ExternalLink,
  Loader2,
  Radio
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';

interface PortfolioData {
  slug: string | null;
  profile_data: {
    fullName?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    cvFileName?: string;
    cvFileUrl?: string;
    gender?: string;
  } | null;
  sections_data: {
    id: string;
    type: string;
    title: string;
    visible: boolean;
    content?: Record<string, unknown>;
  }[] | null;
  views: number;
}

interface AnalyticsStats {
  total_project_views: number;
  active_sessions: number;
}

interface TopProject {
  id: string;
  name: string;
  category: string;
  views: number;
  url: string | null;
}

export const Overview = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats>({ total_project_views: 0, active_sessions: 0 });
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.overview.greetings.morning'));
    else if (hour < 15) setGreeting(t('dashboard.overview.greetings.afternoon'));
    else if (hour < 18) setGreeting(t('dashboard.overview.greetings.evening'));
    else setGreeting(t('dashboard.overview.greetings.night'));
  }, [t]);

  // Fetch portfolio data once
  useEffect(() => {
    api.get('/portfolio')
      .then(res => setPortfolioData(res.data))
      .catch(() => setPortfolioData(null))
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch analytics stats & poll every 15s for real-time active sessions
  useEffect(() => {
    const fetchStats = () => {
      api.get('/analytics/stats')
        .then(res => setAnalyticsStats(res.data))
        .catch(() => {});
      
      // Also fetch top projects
      api.get('/analytics/top-projects')
        .then(res => setTopProjects(res.data))
        .catch(() => {});
    };

    fetchStats(); // initial fetch

    pollRef.current = setInterval(fetchStats, 15000); // poll every 15s

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const totalViews = portfolioData?.views ?? 0;

  // Dynamic setup tasks based on actual portfolio data
  const setupTasks = useMemo(() => {
    const profile = portfolioData?.profile_data;
    const sections = portfolioData?.sections_data;
    const slug = portfolioData?.slug;

    // 1. Lengkapi Profil — name + bio + avatar harus ada
    const hasProfile = !!(
      profile?.fullName?.trim() &&
      profile?.bio?.trim() &&
      profile?.avatarUrl?.trim()
    );

    // 2. Tambah Section — minimal 1 section yang visible
    const hasSection = !!(
      sections &&
      sections.length > 0 &&
      sections.some(s => s.visible)
    );

    // 3. Tambah Projek — minimal 1 project di section projects
    const projectSection = sections?.find(s => s.type === 'projects');
    const projectItems = (projectSection?.content as { items?: unknown[] })?.items;
    const hasProject = !!(projectItems && projectItems.length > 0);

    // 4. Publish Portfolio — slug harus sudah diatur
    const hasSlug = !!(slug && slug.trim());

    return [
      { title: t('dashboard.overview.setup.profile.title'), desc: t('dashboard.overview.setup.profile.desc'), done: hasProfile },
      { title: t('dashboard.overview.setup.section.title'), desc: t('dashboard.overview.setup.section.desc'), done: hasSection },
      { title: t('dashboard.overview.setup.project.title'), desc: t('dashboard.overview.setup.project.desc'), done: hasProject },
      { title: t('dashboard.overview.setup.publish.title'), desc: t('dashboard.overview.setup.publish.desc'), done: hasSlug },
    ];
  }, [portfolioData, t]);

  const completedCount = setupTasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / setupTasks.length) * 100);

  const stats = [
    { label: t('dashboard.overview.stats.totalVisitors'), value: totalViews.toLocaleString('id-ID'), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: t('dashboard.overview.stats.projectViews'), value: analyticsStats.total_project_views.toLocaleString('id-ID'), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { label: t('dashboard.overview.stats.activeSessions'), value: analyticsStats.active_sessions.toLocaleString('id-ID'), icon: Radio, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', isLive: true },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <p className="text-indigo-200 font-medium tracking-wide text-sm uppercase">{greeting}</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
              {t('dashboard.overview.welcome.hi')} {user?.name?.split(' ')[0] || t('dashboard.overview.welcome.creator')}! 👋
            </h1>
            <p className="text-indigo-100 max-w-xl text-base sm:text-lg leading-relaxed">
              {t('dashboard.overview.welcome.desc1')} <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{isLoading ? '...' : totalViews.toLocaleString('id-ID')}</span> {t('dashboard.overview.welcome.desc2')}
            </p>
          </div>
          <button 
            onClick={() => navigate('/portfolio-builder')}
            className="shrink-0 flex items-center justify-center gap-2 bg-white text-indigo-900 px-6 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            <Layout className="w-5 h-5" />
            {t('dashboard.overview.welcome.editPortfolio')}
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-transparent to-slate-100 dark:to-slate-800/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              {'isLive' in stat && stat.isLive ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  LIVE
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl">
                  {t('dashboard.overview.stats.totalLabel')}
                </div>
              )}
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">{stat.label}</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h4>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Progress */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {progressPercent === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              )}
              {t('dashboard.overview.setup.title')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {progressPercent === 100 
                ? t('dashboard.overview.setup.completed')
                : t('dashboard.overview.setup.inProgress')}
            </p>
            
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {isLoading ? (
                  <div className="h-full bg-slate-300 dark:bg-slate-700 w-0 rounded-full" />
                ) : (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className={cn(
                      "h-full rounded-full",
                      progressPercent === 100 ? "bg-emerald-500" : "bg-indigo-500"
                    )}
                  />
                )}
              </div>
              <span className={cn(
                "text-sm font-bold",
                progressPercent === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
              )}>
                {isLoading ? '...' : `${progressPercent}%`}
              </span>
            </div>
          </div>
          
          <div className="flex-1 p-2 bg-slate-50/50 dark:bg-slate-900/50">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : (
              setupTasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-default group">
                  <div className="mt-0.5 shrink-0">
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold mb-0.5", task.done ? "text-slate-900 dark:text-white line-through decoration-emerald-500/30" : "text-slate-600 dark:text-slate-400")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                      {task.desc}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Projects */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                {t('dashboard.overview.topProjects.title')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.overview.topProjects.desc')}</p>
            </div>
            <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-colors">
              {t('dashboard.overview.topProjects.viewAll')}
            </button>
          </div>
          
          <div className="p-6 flex-1">
            <div className="space-y-4">
              {topProjects.length > 0 ? (
                topProjects.map((project, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center shrink-0 border border-white/50 dark:border-white/5">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">#{idx + 1}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{project.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                          {project.views.toLocaleString()} <Eye className="w-4 h-4 text-slate-400" />
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (project.url) window.open(project.url, '_blank');
                          else window.open(`/portfolio-builder`, '_self');
                        }}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{t('dashboard.overview.topProjects.empty')}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
