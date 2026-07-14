import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  User, MapPin, Code2, Info, Briefcase, GraduationCap, FolderOpen, Award,
  ExternalLink, Users as UsersIcon, FileText, Loader2, AlertCircle, X,
  Mail, Link
} from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../utils/cn';

// Types (mirrored from PortfolioBuilder)

interface ProfileData {
  fullName: string;
  bio: string;
  location: string;
  gender: string;
  avatarUrl: string;
  cvFileName: string;
  cvFileUrl?: string;
}

type SectionType = 'about' | 'skills' | 'projects' | 'work-experience' | 'org-experience' | 'education' | 'certifications' | 'contact';

interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  content?: Record<string, unknown>;
}

interface AboutContent { description: string }
interface SkillsContent { items: string[] }
interface ProjectItem {
  id: string; name: string; description: string; url: string; imageUrl: string;
  imageUrls?: string[];
  startMonth: string; startYear: string; endMonth: string; endYear: string;
  skills: string[]; current?: boolean;
}
interface ProjectsContent { items: ProjectItem[] }
interface WorkExpItem {
  id: string; company: string; role: string; jobType: string; location: string;
  startMonth: string; startYear: string; endMonth: string; endYear: string;
  description: string; skills: string[]; current?: boolean;
}
interface WorkExpContent { items: WorkExpItem[] }
interface OrgExpItem {
  id: string; organization: string; role: string;
  startMonth?: string; startYear?: string; endMonth?: string; endYear?: string;
  current?: boolean; period?: string; description: string;
}
interface OrgExpContent { items: OrgExpItem[] }
interface EduItem {
  id: string; institution: string; degree: string; major?: string; gpa?: string;
  startMonth?: string; startYear?: string; endMonth?: string; endYear?: string;
  current?: boolean; period?: string; description: string;
}
interface EduContent { items: EduItem[] }
interface CertItem {
  id: string; name: string; issuer: string;
  issueDate?: string; expiryDate?: string;
  noExpiry?: boolean; year?: string; credentialUrl: string;
  skills?: string[];
  imageUrl?: string;
  description?: string;
}
interface CertContent { items: CertItem[] }

interface ContactItem {
  id: string; platform: string; value: string; url: string;
}
interface ContactContent { items: ContactItem[] }

const SECTION_META: Record<SectionType, { labelKey: string; icon: typeof Info; color: string; bgColor: string }> = {
  about:            { labelKey: 'builder.sections.aboutMe',                  icon: Info,           color: 'text-blue-500',    bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  skills:           { labelKey: 'builder.sections.skills',                   icon: Code2,          color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  projects:         { labelKey: 'builder.sections.projects',                 icon: FolderOpen,     color: 'text-purple-500',  bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  'work-experience':{ labelKey: 'builder.sections.workExperience',           icon: Briefcase,      color: 'text-amber-500',   bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  'org-experience': { labelKey: 'builder.sections.orgExperience', icon: UsersIcon,      color: 'text-orange-500',  bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  education:        { labelKey: 'builder.sections.education',                icon: GraduationCap,  color: 'text-rose-500',    bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
  certifications:   { labelKey: 'builder.sections.certifications', icon: Award,          color: 'text-indigo-500',  bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
  contact:          { labelKey: 'builder.sections.contact',        icon: Mail,           color: 'text-sky-500',     bgColor: 'bg-sky-50 dark:bg-sky-900/20' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatPeriod = (startMonth?: string, startYear?: string, endMonth?: string, endYear?: string, current?: boolean): string => {
  const startMonthName = startMonth ? (MONTHS[parseInt(startMonth, 10) - 1] || '') : '';
  const startStr = startMonthName ? `${startMonthName} ${startYear}` : (startYear || '');
  if (!startStr) return '';
  if (current) return `${startStr} - Sekarang`;
  const endMonthName = endMonth ? (MONTHS[parseInt(endMonth, 10) - 1] || '') : '';
  const endStr = endMonthName ? `${endMonthName} ${endYear}` : (endYear || '');
  if (!endStr) return startStr;
  return `${startStr} - ${endStr}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTHS[monthIdx] || '';
  return `${day} ${monthName} ${year}`;
};

// Generate or retrieve a unique session ID for this browser tab
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('portfolio_session_id');
  if (!sessionId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      // Fallback for non-secure contexts (like local IP without HTTPS)
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    sessionStorage.setItem('portfolio_session_id', sessionId);
  }
  return sessionId;
};

const API_BASE_URL = 'https://foliodev.smkn9kotabekasi.sch.id/api';

// Public Portfolio Page

export const PublicPortfolio = () => {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [theme, setTheme] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchPortfolio = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const response = await api.get(`/portfolio/public/${username}`);
        setProfile(response.data.profile_data || null);
        const visibleSections = (response.data.sections_data || []).filter((s: PortfolioSection) => s.visible);
        setSections(visibleSections);
        setTheme(response.data.theme_data || null);

        // Handle Search Engine Visibility
        if (response.data.hide_from_search) {
          let meta = document.querySelector('meta[name="robots"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'robots');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', 'noindex, nofollow');
        } else {
          // Remove if exists to allow indexing
          const meta = document.querySelector('meta[name="robots"]');
          if (meta) {
            meta.remove();
          }
        }

        // Track project views: collect all project IDs from visible sections
        const projectIds: string[] = [];
        for (const section of visibleSections) {
          if (section.type === 'projects') {
            const content = section.content as unknown as ProjectsContent | undefined;
            if (content?.items) {
              for (const item of content.items) {
                projectIds.push(item.id);
              }
            }
          }
        }
        if (projectIds.length > 0) {
          api.post('/p-events/project-view', { slug: username, project_ids: projectIds }).catch(() => {});
        }
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [username]);

  // Heartbeat & disconnect for active sessions tracking
  const sendDisconnect = useCallback(() => {
    const sessionId = sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) return;

    // Use sendBeacon for reliable delivery during page unload
    const payload = JSON.stringify({ session_id: sessionId });
    navigator.sendBeacon(
      `${API_BASE_URL}/p-events/disconnect`,
      new Blob([payload], { type: 'application/json' })
    );
  }, []);

  useEffect(() => {
    if (!username) return;

    const sessionId = getSessionId();

    // Send initial heartbeat immediately
    api.post('/p-events/heartbeat', { slug: username, session_id: sessionId }).catch(() => {});

    // Send heartbeat every 15 seconds
    heartbeatRef.current = setInterval(() => {
      api.post('/p-events/heartbeat', { slug: username, session_id: sessionId }).catch(() => {});
    }, 15000);

    // Disconnect immediately when user leaves
    const handleBeforeUnload = () => sendDisconnect();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDisconnect();
      } else if (document.visibilityState === 'visible') {
        // User came back, restart heartbeat
        api.post('/p-events/heartbeat', { slug: username, session_id: sessionId }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendDisconnect();
    };
  }, [username, sendDisconnect]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Memuat portfolio...</p>
        </motion.div>
      </div>
    );
  }

  // 404 state
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5 max-w-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            URL portfolio <span className="font-bold text-slate-700 dark:text-slate-300">/{username}</span> tidak ditemukan atau belum dipublikasikan.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Kembali ke Beranda
          </a>
        </motion.div>
      </div>
    );
  }

  // Theme mappings
  const themeClasses = {
    minimalist: 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100',
    'developer-dark': 'bg-[#0d1117] text-[#c9d1d9]',
    creative: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white',
    executive: 'bg-slate-100 dark:bg-[#0b1329] text-slate-900 dark:text-slate-100',
    'bento-grid': 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
    'neo-brutalism': 'bg-yellow-400 text-black',
    glassmorphism: 'bg-gradient-to-tr from-cyan-200 via-indigo-100 to-purple-200 dark:from-cyan-950 dark:via-indigo-950 dark:to-purple-950 text-slate-800 dark:text-slate-100',
    'link-in-bio': 'bg-rose-50 dark:bg-rose-950 text-slate-900 dark:text-slate-100'
  };

  const currentThemeClass = theme?.template ? (themeClasses[theme.template as keyof typeof themeClasses] || '') : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/10 text-slate-900 dark:text-slate-100';
  
  const PALETTES: Record<string, Record<string, string>> = {
    slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
    red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
    orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
    amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
    emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
    teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
    sky: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' },
    blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
    purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
    pink: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' },
    rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  };
  
  let fontFamily = 'Inter, system-ui, sans-serif';
  if (theme?.font === 'poppins') fontFamily = 'Poppins, system-ui, sans-serif';
  if (theme?.font === 'montserrat') fontFamily = 'Montserrat, system-ui, sans-serif';
  if (theme?.font === 'playfair') fontFamily = '"Playfair Display", Georgia, serif';
  if (theme?.font === 'merriweather') fontFamily = 'Merriweather, Georgia, serif';
  if (theme?.font === 'lora') fontFamily = 'Lora, Georgia, serif';
  if (theme?.font === 'fira-code') fontFamily = '"Fira Code", monospace';
  if (theme?.font === 'jetbrains') fontFamily = '"JetBrains Mono", monospace';

  const isForceDark = theme?.appearance === 'dark';
  const isForceLight = theme?.appearance === 'light';
  const templateId = theme?.template || 'minimalist';
  
  const cornerClass = theme?.corner === 'sharp' ? 'corner-sharp' : theme?.corner === 'pill' ? 'corner-pill' : 'corner-rounded';
  const colorId = theme?.color && theme.color !== 'indigo' ? theme.color : null;
  
  // Render portfolio
  return (
    <div className={cn(isForceDark && 'dark', isForceLight && 'light', cornerClass, colorId && 'theme-color-override', `template-${templateId}`)} style={{ fontFamily }}>
      {colorId && PALETTES[colorId] && (
        <style>
          {`
            .theme-color-override {
              --color-indigo-50: ${PALETTES[colorId][50]};
              --color-indigo-100: ${PALETTES[colorId][100]};
              --color-indigo-200: ${PALETTES[colorId][200]};
              --color-indigo-300: ${PALETTES[colorId][300]};
              --color-indigo-400: ${PALETTES[colorId][400]};
              --color-indigo-500: ${PALETTES[colorId][500]};
              --color-indigo-600: ${PALETTES[colorId][600]};
              --color-indigo-700: ${PALETTES[colorId][700]};
              --color-indigo-800: ${PALETTES[colorId][800]};
              --color-indigo-900: ${PALETTES[colorId][900]};
              --color-indigo-950: ${PALETTES[colorId][950]};
            }
          `}
        </style>
      )}
      <style>
        {`
          /* Corners */
          .corner-sharp .rounded-xl, .corner-sharp .rounded-2xl, .corner-sharp .rounded-3xl, .corner-sharp .rounded-full, .corner-sharp .rounded-lg {
            border-radius: 0 !important;
          }
          .corner-pill .rounded-xl, .corner-pill .rounded-2xl, .corner-pill .rounded-3xl {
            border-radius: 9999px !important;
          }

          /* Developer Dark (IDE Theme) */
          .template-developer-dark {
            background-color: #0d1117 !important;
          }
          .template-developer-dark .portfolio-card {
            border: 1px solid #30363d !important;
            background-color: #161b22 !important;
            padding-top: 2.5rem !important;
            position: relative;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
          }
          .template-developer-dark .portfolio-card::before {
            content: "•••";
            position: absolute;
            top: 10px;
            left: 16px;
            color: #484f58;
            font-size: 24px;
            letter-spacing: 2px;
            line-height: 0.5;
          }
          .template-developer-dark h1,
          .template-developer-dark h2,
          .template-developer-dark h3,
          .template-developer-dark .text-slate-900,
          .template-developer-dark .text-slate-800 {
            color: #f0f6fc !important;
          }
          .template-developer-dark p,
          .template-developer-dark .text-slate-500,
          .template-developer-dark .text-slate-600 {
            color: #8b949e !important;
          }
          .template-developer-dark .bg-slate-100,
          .template-developer-dark .bg-slate-800,
          .template-developer-dark .dark\\:bg-slate-800,
          .template-developer-dark .bg-white,
          .template-developer-dark .dark\\:bg-slate-900 {
            background-color: #21262d !important;
            border-color: #30363d !important;
          }
          .template-developer-dark .border-slate-200,
          .template-developer-dark .dark\\:border-slate-800 {
            border-color: #30363d !important;
          }

          /* Creative */
          .template-creative .portfolio-card {
            border: none !important;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
            transition: transform 0.3s ease !important;
          }
          .template-creative .portfolio-card:hover {
            transform: translateY(-5px) !important;
          }

          /* Executive */
          .template-executive .portfolio-card {
            border: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .dark .template-executive .portfolio-card, .template-executive.dark .portfolio-card {
            border-bottom-color: #1e293b !important;
          }

          /* Bento Grid */
          @media (min-width: 640px) {
            .template-bento-grid main.portfolio-main {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1.5rem;
              align-items: start;
            }
            .template-bento-grid main.portfolio-main > section {
              height: 100%;
              margin-top: 0 !important;
              background-color: white;
              padding: 1.5rem;
              border-radius: 1.5rem;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .dark .template-bento-grid main.portfolio-main > section, .template-bento-grid.dark main.portfolio-main > section {
              background-color: #0f172a;
              border-color: #1e293b;
            }
            .template-bento-grid main.portfolio-main > section:first-of-type {
              grid-column: span 2;
            }
            .template-bento-grid .portfolio-card {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              background: transparent !important;
            }
          }

          /* Neo-Brutalism */
          .template-neo-brutalism .portfolio-card {
            border: 3px solid black !important;
            box-shadow: 6px 6px 0px black !important;
            border-radius: 0 !important;
            background-color: white !important;
            color: black !important;
          }
          .dark .template-neo-brutalism .portfolio-card, .template-neo-brutalism.dark .portfolio-card {
            background-color: #1e1e1e !important;
            border-color: white !important;
            box-shadow: 6px 6px 0px white !important;
            color: white !important;
          }

          /* Glassmorphism */
          .template-glassmorphism main.portfolio-main > section {
            background: rgba(255, 255, 255, 0.4) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05) !important;
            padding: 1.5rem;
            border-radius: 1.5rem;
          }
          .dark .template-glassmorphism main.portfolio-main > section, .template-glassmorphism.dark main.portfolio-main > section {
            background: rgba(15, 23, 42, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .template-glassmorphism .portfolio-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
        `}
      </style>
      <div className={cn("min-h-screen transition-colors duration-300", currentThemeClass)}>
      {/* Profile Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-10 px-6"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          {/* Avatar */}
          <div className={`w-28 h-28 rounded-full mb-5 shadow-xl flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-white dark:ring-slate-900 ${
            profile.avatarUrl
              ? 'bg-transparent'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{profile.fullName || 'Portfolio'}</h1>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-3 max-w-lg leading-relaxed">{profile.bio}</p>
          )}

          {/* Location & Gender badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            {profile.gender && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {profile.gender}
              </span>
            )}
            {profile.cvFileName && profile.cvFileUrl && (
              <a
                href={profile.cvFileUrl}
                download={profile.cvFileName}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Download CV
              </a>
            )}
          </div>
        </div>
      </motion.header>

      {/* Sections */}
      <main className="portfolio-main max-w-2xl mx-auto px-6 pb-20 space-y-10">
        {sections.map((section, index) => {
          const meta = SECTION_META[section.type];
          if (!meta) return null;
          const Icon = meta.icon;

          return (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="space-y-4"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${meta.bgColor}`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <h2 className="text-lg font-bold">{t(meta.labelKey) || section.title}</h2>
              </div>

              {/* About */}
              {section.type === 'about' && (() => {
                const c = section.content as unknown as AboutContent | undefined;
                return c?.description ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{c.description}</p>
                ) : null;
              })()}

              {/* Skills */}
              {section.type === 'skills' && (() => {
                const c = section.content as unknown as SkillsContent | undefined;
                return c?.items?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {c.items.map((s) => (
                      <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{s}</span>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Projects */}
              {section.type === 'projects' && (() => {
                const c = section.content as unknown as ProjectsContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-4">
                    {c.items.map((p) => {
                      const period = formatPeriod(p.startMonth, p.startYear, p.endMonth, p.endYear, p.current);
                      return (
                        <div key={p.id} className="portfolio-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                <FolderOpen className="w-5 h-5 text-purple-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{p.name || 'Untitled'}</h3>
                                {period && <p className="text-xs text-slate-400 font-semibold mt-0.5">{period}</p>}
                              </div>
                            </div>
                            {p.url && (
                              <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1 transition-colors mt-1">
                                Lihat <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 whitespace-pre-line">{p.description}</p>
                          )}
                          
                          {(() => {
                            const images = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []);
                            if (images.length > 0) {
                              return (
                                <div className="flex overflow-x-auto gap-3 mt-3 pb-2 snap-x">
                                  {images.map((url, i) => (
                                    <img key={i} src={url} alt="" className="w-48 h-32 object-cover rounded-xl shrink-0 snap-start border border-slate-100 dark:border-slate-800" />
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {p.skills && p.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                              {p.skills.map((s) => (
                                <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })()}

              {/* Work Experience */}
              {section.type === 'work-experience' && (() => {
                const c = section.content as unknown as WorkExpContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-4">
                    {c.items.map((w) => {
                      const period = formatPeriod(w.startMonth, w.startYear, w.endMonth, w.endYear, w.current);
                      return (
                        <div key={w.id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 shrink-0 flex items-center justify-center mt-0.5">
                            <Briefcase className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold">{w.role || 'Posisi'}</p>
                            <p className="text-xs text-slate-400">{w.company}{w.jobType && ` · ${w.jobType}`}</p>
                            {(w.location || period) && (
                              <p className="text-xs text-slate-400/80 mt-0.5">{[w.location, period].filter(Boolean).join(' · ')}</p>
                            )}
                            {w.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line">{w.description}</p>
                            )}
                            {w.skills && w.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {w.skills.map((s) => (
                                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })()}

              {/* Org Experience */}
              {section.type === 'org-experience' && (() => {
                const c = section.content as unknown as OrgExpContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-4">
                    {c.items.map((o) => {
                      const period = o.startYear
                        ? formatPeriod(o.startMonth, o.startYear, o.endMonth, o.endYear, o.current)
                        : (o.period || '');
                      return (
                        <div key={o.id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 shrink-0 flex items-center justify-center mt-0.5">
                            <UsersIcon className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold">{o.role || 'Posisi'}</p>
                            <p className="text-xs text-slate-400">{o.organization}{period && ` · ${period}`}</p>
                            {o.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line">{o.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })()}

              {/* Education */}
              {section.type === 'education' && (() => {
                const c = section.content as unknown as EduContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-4">
                    {c.items.map((e) => {
                      const period = e.startYear
                        ? formatPeriod(e.startMonth, e.startYear, e.endMonth, e.endYear, e.current)
                        : (e.period || '');
                      return (
                        <div key={e.id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 shrink-0 flex items-center justify-center mt-0.5">
                            <GraduationCap className="w-5 h-5 text-rose-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold">
                              {e.degree || 'Gelar'}
                              {e.major ? ` - ${e.major}` : ''}
                            </p>
                            <p className="text-xs text-slate-400">{e.institution}{period && ` · ${period}`}</p>
                            {e.gpa && (
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">IPK/Nilai: {e.gpa}</p>
                            )}
                            {e.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line">{e.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })()}

              {/* Certifications */}
              {section.type === 'certifications' && (() => {
                const c = section.content as unknown as CertContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-4">
                    {c.items.map((cert) => (
                      <div key={cert.id} className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        {cert.imageUrl ? (
                          <div 
                            onClick={() => setSelectedImage(cert.imageUrl!)}
                            className="relative group cursor-pointer w-full sm:w-40 h-48 sm:h-28 shrink-0 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800"
                          >
                            <img src={cert.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <span className="text-white text-[10px] font-medium px-2.5 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm border border-white/10 text-center leading-tight">Lihat Detail<br/>Gambar</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 shrink-0 flex items-center justify-center mt-0.5">
                            <Award className="w-6 h-6 text-indigo-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-bold">{cert.name || 'Sertifikasi'}</p>
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1 transition-colors">
                                Lihat <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {cert.issuer}
                            {(cert.issueDate || cert.year) && ' · '}
                            {(() => {
                              if (cert.issueDate) {
                                const startStr = formatDate(cert.issueDate);
                                if (cert.noExpiry) return `${startStr} - Tanpa Kedaluwarsa`;
                                if (cert.expiryDate) return `${startStr} - ${formatDate(cert.expiryDate)}`;
                                return startStr;
                              }
                              return cert.year || '';
                            })()}
                          </p>
                          {cert.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line">{cert.description}</p>
                          )}
                          {cert.skills && cert.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {cert.skills.map((s) => (
                                <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {section.type === 'contact' && (() => {
                const c = section.content as ContactContent | undefined;
                if (!c?.items?.length) return null;
                return (
                  <div className="flex flex-wrap gap-3">
                    {c.items.map((contact) => (
                      <a 
                        key={contact.id} 
                        href={contact.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-sm text-slate-600 dark:text-slate-300 shadow-sm hover:shadow"
                      >
                        {(() => {
                          switch (contact.platform.toLowerCase()) {
                            case 'email': return <Mail className="w-4 h-4 text-red-500" />;
                            case 'linkedin': return <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
                            case 'instagram': return <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
                            case 'whatsapp': return <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
                            case 'facebook': return <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
                            case 'github': return <svg className="w-4 h-4 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
                            case 'tiktok': return <svg className="w-4 h-4 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
                            case 'x': return <svg className="w-4 h-4 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>;
                            default: return <Link className="w-4 h-4 text-indigo-500" />;
                          }
                        })()}
                        <span className="font-semibold">{contact.value}</span>
                      </a>
                    ))}
                  </div>
                );
              })()}

            </motion.section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-900 py-8 text-center">
        <p className="text-xs text-slate-400">
          Built with <span className="font-bold text-indigo-500">DevFolio</span>
        </p>
      </footer>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt="Detail"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};
