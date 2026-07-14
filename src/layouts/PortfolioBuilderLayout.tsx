import { 
  BarChart3, 
  ExternalLink, 
  Globe, 
  Layout, 
  LogOut,
  MessageSquare,
  Palette, 
  User,
  AlertCircle,
  Menu,
  X,
  Link2,
  Check,
  Loader2,
  Sun,
  Moon,
  Settings,
  Maximize,
  Minimize,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import api, { requestAccountDeletion } from '../lib/api';

const SlugModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    const currentSlug = user?.portfolio?.slug || '';
    setSlug(currentSlug);
    setOriginalSlug(currentSlug);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, user?.portfolio?.slug]);

  const validateSlug = (value: string): string => {
    if (!value) return t('dashboard.slugModal.validation.empty');
    if (value.length < 3) return t('dashboard.slugModal.validation.min3');
    if (value.length > 30) return t('dashboard.slugModal.validation.max30');
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length >= 2) {
      return t('dashboard.slugModal.validation.format');
    }
    if (value.length === 1 && /^[a-z0-9]$/.test(value)) return t('dashboard.slugModal.validation.min3');
    return '';
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(raw);
    setError(raw ? validateSlug(raw) : '');
  };

  const isValid = slug.length >= 3 && !validateSlug(slug);
  const hasChanged = slug !== originalSlug;
    const baseUrl = window.location.origin;

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    setError('');
    try {
      await api.put('/portfolio/slug', { slug });
      setOriginalSlug(slug);
      
      // Update the global user context so the new slug is reflected everywhere instantly
      if (user) {
        const updatedUser = { ...user };
        if (updatedUser.portfolio) {
          updatedUser.portfolio.slug = slug;
        } else {
          updatedUser.portfolio = { slug } as any; // Cast as any because we only need slug for the modal/URL
        }
        updateUser(updatedUser);
      }

      toast('Berhasil', 'URL portfolio berhasil diperbarui.', 'success');
      window.open(`${baseUrl}/portfolio/public/${slug}`, '_blank');
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response?.data?.errors?.slug) {
        setError(axiosError.response.data.errors.slug[0]);
      } else {
        setError('Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenExisting = () => {
    window.open(`${baseUrl}/portfolio/public/${originalSlug}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.slugModal.title')}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('dashboard.slugModal.message')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t('dashboard.slugModal.usernameUrl')}
            </label>
                <div className={cn(
                  "flex flex-col sm:flex-row sm:items-center rounded-2xl border-2 transition-all overflow-hidden bg-slate-50 dark:bg-slate-800/60 mt-2",
                  error 
                    ? "border-red-400 dark:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/20" 
                    : isValid
                      ? "border-emerald-400 dark:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400"
                )}>
                  <span className="px-3 py-2 sm:py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 select-none whitespace-nowrap shrink-0">
                    {window.location.host}/portfolio/public/
                  </span>
                  <div className="flex-1 flex items-center min-w-0">
                    <input
                      ref={inputRef}
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="my-portfolio"
                      maxLength={30}
                      className="flex-1 px-3 py-2.5 bg-transparent text-sm font-medium outline-none min-w-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    />
                    <div className="pr-3 shrink-0">
                      {isValid ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : slug.length > 0 ? (
                        <X className="w-4 h-4 text-red-400" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-medium text-red-500"
                    >
                      {error}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="help"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[11px] text-slate-400 dark:text-slate-500"
                    >
                      {t('dashboard.slugModal.helpText')}<span className="font-bold text-indigo-500">rifqi-dev</span>
                    </motion.p>
                  )}
                </AnimatePresence>

                {isValid && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 break-all whitespace-normal">
                      {baseUrl}/portfolio/public/{slug}
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-2xl py-3 border-2"
                >
                  {t('dashboard.slugModal.cancel')}
                </Button>

                {hasChanged ? (
                  <button
                    onClick={handleSave}
                    disabled={!isValid || isSaving}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm transition-all",
                      isValid && !isSaving
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    {isSaving ? t('dashboard.slugModal.checking') : t('dashboard.slugModal.save')}
                  </button>
                ) : originalSlug ? (
                  <button
                    onClick={handleOpenExisting}
                    className="flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('dashboard.header.viewLive')}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('dashboard.slugModal.save')}
                  </button>
                )}
              </div>
            </div>
        </motion.div>
      </div>
    );
  };

export const PortfolioBuilderLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || localStorage.getItem('dashboard_active_tab') || 'builder';
  });
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    // Initial fetch to get avatar
    api.get('/portfolio').then(res => {
      setProfileAvatar(res.data.profile_data?.avatarUrl || null);
    }).catch(() => {});

    // Listen for updates
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setProfileAvatar(customEvent.detail);
    };
    window.addEventListener('portfolioAvatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('portfolioAvatarUpdated', handleAvatarUpdate);
  }, []);

  useEffect(() => {
    if (location.pathname === '/overview') {
      setActiveTab('overview');
    } else if (location.pathname === '/themes') {
      setActiveTab('themes');
    } else if (location.pathname === '/feedback') {
      setActiveTab('feedback');
    } else if (location.pathname === '/portfolio-builder') {
      if (['overview', 'themes', 'feedback'].includes(activeTab)) {
        setActiveTab(location.state?.tab || 'builder');
      } else if (location.state?.tab) {
        setActiveTab(location.state.tab);
      }
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    if (location.pathname !== '/overview') {
      localStorage.setItem('dashboard_active_tab', activeTab);
    }
  }, [activeTab, location.pathname]);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccountRequest = async () => {
    try {
      setIsDeletingAccount(true);
      const res = await requestAccountDeletion();
      toast(t('settings.deleteAccount.successTitle', 'Sukses'), t('settings.deleteAccount.successMessage', 'Email konfirmasi penghapusan akun telah dikirim.'), 'success');
      setShowDeleteAccountConfirm(false);
    } catch (err: any) {
      toast(t('settings.deleteAccount.errorTitle', 'Gagal'), t('settings.deleteAccount.errorMessage', 'Gagal mengirim email konfirmasi.'), 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: t('dashboard.sidebar.overview'), icon: BarChart3 },
    { id: 'builder', label: t('dashboard.sidebar.portfolioBuilder'), icon: Layout },
    { id: 'themes', label: t('dashboard.sidebar.templates'), icon: Palette },
    { id: 'domain', label: t('dashboard.sidebar.customDomain'), icon: Globe },
    { id: 'feedback', label: t('dashboard.sidebar.feedback'), icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-[9999] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col md:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Layout className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">DevFolio</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-xl text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'overview') {
                        navigate('/overview');
                      } else if (item.id === 'themes') {
                        navigate('/themes');
                      } else if (item.id === 'feedback') {
                        navigate('/feedback');
                      } else {
                        if (['/overview', '/themes', '/feedback'].includes(location.pathname)) {
                          navigate('/portfolio-builder', { state: { tab: item.id } });
                        } else {
                          setActiveTab(item.id);
                        }
                      }
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      activeTab === item.id 
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/5" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">DevFolio</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                  navigate('/overview');
                } else if (item.id === 'themes') {
                  navigate('/themes');
                } else if (item.id === 'feedback') {
                  navigate('/feedback');
                } else {
                  if (['/overview', '/themes', '/feedback'].includes(location.pathname)) {
                    navigate('/portfolio-builder', { state: { tab: item.id } });
                  } else {
                    setActiveTab(item.id);
                  }
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/5" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-lg font-bold capitalize text-slate-800 dark:text-slate-100">
              {activeTab === 'builder' ? t('dashboard.header.builder', 'Builder') : (menuItems.find(item => item.id === activeTab)?.label || activeTab.replace('-', ' '))}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSlugModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('dashboard.header.livePortfolio', 'Live Portfolio')}</span>
              <span className="sm:hidden">{t('dashboard.header.live', 'Live')}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer items-center justify-center bg-white dark:bg-slate-900"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isFullscreen ? 'min' : 'max'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Maximize className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center justify-center bg-white dark:bg-slate-900"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: 5, opacity: 0, rotate: 45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -5, opacity: 0, rotate: -45 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:ring-2 hover:ring-indigo-500/20 active:scale-95 transition-all cursor-pointer overflow-hidden" 
                title={user?.name || 'User'}
              >
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email || ''}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer group"
                      >
                        <Settings className="w-4 h-4 text-slate-450 dark:text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-200 transition-colors" />
                        Settings
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800/80 my-1 mx-2" />

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        {t('dashboard.header.logout')}
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800/80 my-1 mx-2" />

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setShowDeleteAccountConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer group"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        {t('settings.deleteAccount.menuItem', 'Hapus Akun')}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet context={{ activeTab }} />
        </div>
      </main>

      <AnimatePresence>
        {isSlugModalOpen && (
          <SlugModal
            isOpen={isSlugModalOpen}
            onClose={() => setIsSlugModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('dashboard.logoutModal.title')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                  {t('dashboard.logoutModal.message')}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="rounded-2xl py-3 border-2"
                  >
                    {t('dashboard.logoutModal.cancel')}
                  </Button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  >
                    {t('dashboard.logoutModal.confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteAccountConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingAccount && setShowDeleteAccountConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('settings.deleteAccount.title', 'Hapus Akun Permanen')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                  {t('settings.deleteAccount.confirmationMessage', 'Apakah Anda yakin ingin menghapus akun Anda secara permanen?')}
                </p>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 mb-8 text-left w-full">
                  <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-1">
                    {t('settings.deleteAccount.warningMessage1', 'Anda akan menerima email untuk melakukan konfirmasi penghapusan akun.')}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    {t('settings.deleteAccount.warningMessage2', 'Jika dikonfirmasi, seluruh data (portfolio, proyek, statistik) akan terhapus secara permanen dan tidak bisa dipulihkan kembali.')}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteAccountConfirm(false)}
                    disabled={isDeletingAccount}
                    className="rounded-2xl py-3 border-2"
                  >
                    {t('settings.deleteAccount.cancel', 'Batal')}
                  </Button>
                  <button
                    onClick={handleDeleteAccountRequest}
                    disabled={isDeletingAccount}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeletingAccount && <Loader2 className="w-5 h-5 animate-spin" />}
                    {t('settings.deleteAccount.confirm', 'Konfirmasi')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
