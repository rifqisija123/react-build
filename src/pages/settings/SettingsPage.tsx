import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  Globe, 
  Layout, 
  LogOut, 
  MessageSquare, 
  Palette, 
  User,
  AlertCircle,
  Menu,
  X,
  Sun,
  Moon,
  Settings,
  Shield,
  Sliders,
  Languages,
  Type,
  LayoutTemplate,
  Lock,
  Mail,
  CheckCircle,
  Check,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  Maximize,
  Minimize,
  Info,
  Trash2,
  Copy
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/Button';
import api, { requestAccountDeletion } from '../../lib/api';
import { APP_LANGUAGES } from '../../data/languages';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize, layoutStyle, setLayoutStyle } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'about' | 'privacy'>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Security toggles state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessionsEnabled, setActiveSessionsEnabled] = useState(false);
  const [hideFromSearch, setHideFromSearch] = useState(user?.portfolio?.hide_from_search || false);
  const [isTogglingSecurity, setIsTogglingSecurity] = useState(false);

  // 2FA Setup state
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [show2FADisableModal, setShow2FADisableModal] = useState(false);
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [twoFactorSetupKey, setTwoFactorSetupKey] = useState('');
  const [twoFactorSetupCode, setTwoFactorSetupCode] = useState('');
  const [twoFactorSetupLoading, setTwoFactorSetupLoading] = useState(false);
  const [twoFactorSetupError, setTwoFactorSetupError] = useState('');
  const [showSetupKey, setShowSetupKey] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  // Fetch 2FA status on mount
  useEffect(() => {
    import('../../lib/api').then(({ get2FAStatus }) => {
      get2FAStatus().then(res => {
        setTwoFactorEnabled(res.data.two_factor_enabled);
      }).catch(() => {});
    });
  }, []);

  const handleToggleTwoFactor = async () => {
    if (isTogglingSecurity) return;

    if (!twoFactorEnabled) {
      // Toggle setup flow
      if (isSettingUp2FA) {
        setIsSettingUp2FA(false);
        return;
      }
      
      setTwoFactorSetupLoading(true);
      setTwoFactorSetupError('');
      setTwoFactorSetupCode('');
      setShowSetupKey(false);
      setIsSettingUp2FA(true);
      try {
        const { setup2FA } = await import('../../lib/api');
        const response = await setup2FA();
        setTwoFactorQrCode(response.data.qr_code);
        setTwoFactorSetupKey(response.data.setup_key);
      } catch (error) {
        console.error('Error fetching 2FA setup:', error);
        toast(
          t('settings.toasts.toastError', 'Error'),
          t('settings.toasts.toastSetup2FAFailed', 'Failed to setup 2FA. Please try again.'),
          'error'
        );
      } finally {
        setTwoFactorSetupLoading(false);
      }
    } else {
      setDisablePassword('');
      setDisableError('');
      setShow2FADisableModal(true);
    }
  };

  const handleEnable2FA = async () => {
    if (twoFactorSetupCode.length !== 6) {
      setTwoFactorSetupError(t('settings.security.setup2fa.invalidLength', 'Please enter a 6-digit code.'));
      return;
    }
    setTwoFactorSetupLoading(true);
    setTwoFactorSetupError('');
    try {
      const { enable2FA } = await import('../../lib/api');
      await enable2FA(twoFactorSetupCode);
      setTwoFactorEnabled(true);
      setIsSettingUp2FA(false);
      toast(
        t('settings.toasts.toastSuccess', 'Success'),
        t('settings.toasts.toast2FAEnabled', 'Two-factor authentication has been enabled.'),
        'success'
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      let errMsg = axiosError.response?.data?.message || 'Invalid verification code.';
      if (errMsg === 'Invalid verification code. Please try again.' || errMsg === 'Invalid verification code.') {
        errMsg = t('settings.security.setup2fa.invalidCode', 'Invalid verification code. Please try again.');
      }
      setTwoFactorSetupError(errMsg);
    } finally {
      setTwoFactorSetupLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setDisableLoading(true);
    setDisableError('');
    try {
      const { disable2FA } = await import('../../lib/api');
      await disable2FA(disablePassword);
      setTwoFactorEnabled(false);
      setShow2FADisableModal(false);
      setDisablePassword('');
      toast(
        t('settings.toasts.toastSuccess', 'Success'),
        t('settings.toasts.toast2FADisabled', 'Two-factor authentication has been disabled.'),
        'success'
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      let errorMsg = axiosError.response?.data?.message || 'Failed to disable 2FA.';
      if (errorMsg === 'Incorrect password.') {
        errorMsg = t('settings.security.disable2fa.incorrectPassword', 'Incorrect password.');
      }
      setDisableError(errorMsg);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleToggleActiveSessions = () => {
    if (isTogglingSecurity) return;
    setIsTogglingSecurity(true);
    setTimeout(() => {
      setActiveSessionsEnabled(prev => !prev);
      setIsTogglingSecurity(false);
      toast(
        t('settings.toasts.toastSuccess', 'Success'),
        !activeSessionsEnabled 
          ? t('settings.toasts.toastSessionEnabled', 'Active session monitoring has been enabled.')
          : t('settings.toasts.toastSessionDisabled', 'Active session monitoring has been disabled.'),
        'success'
      );
    }, 500);
  };

  const isOAuth = !!(user?.google_id || user?.github_id);
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  // Language & Layout dropdown state
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [pendingLanguage, setPendingLanguage] = useState(language);
  const [pendingFontSize, setPendingFontSize] = useState(fontSize);
  const [pendingLayoutStyle, setPendingLayoutStyle] = useState(layoutStyle);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    } else if (otpTimer === 0) {
      setShowOtpModal(false);
      setOtpError('Waktu OTP telah habis. Silakan ulangi pembaruan profil.');
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  const formatOtpTimer = () => {
    const m = Math.floor(otpTimer / 60);
    const s = otpTimer % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle profile update (Request OTP)
  const handleProfileUpdate = async () => {
    setProfileLoading(true);
    setProfileErrors({});
    setProfileSuccess('');

    try {
      const response = await api.post('/settings/profile/update-request', {
        name: profileName,
        email: profileEmail,
      });
      setOtpTargetEmail(response.data.target_email);
      setOtpTimer(300);
      setOtpCode('');
      setOtpError('');
      setShowOtpModal(true);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
        setProfileErrors(axiosError.response.data.errors);
      } else if (axiosError.response?.status === 422 && axiosError.response.data?.message) {
        setProfileErrors({ general: [axiosError.response.data.message] });
      } else {
        setProfileErrors({ general: [t('settings.generalError')] });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError('Kode OTP harus 6 digit.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await api.post('/settings/profile/update-verify', { otp: otpCode });
      updateUser(response.data.user);
      setShowOtpModal(false);
      setProfileSuccess(response.data.message);
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors?.otp) {
        setOtpError(axiosError.response.data.errors.otp[0]);
      } else if (axiosError.response?.status === 422 && axiosError.response.data?.message) {
        setOtpError(axiosError.response.data.message);
      } else {
        setOtpError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess('');

    try {
      const response = await api.put('/settings/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
        setPasswordErrors(axiosError.response.data.errors);
      } else {
        setPasswordErrors({ general: [t('settings.generalError')] });
      }
    } finally {
      setPasswordLoading(false);
    }
  };
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

  const handleSidebarNavigation = (tabId: string) => {
    if (tabId === 'overview') {
      navigate('/overview');
    } else if (tabId === 'themes') {
      navigate('/themes');
    } else if (tabId === 'feedback') {
      navigate('/feedback');
    } else {
      navigate('/portfolio-builder', { state: { tab: tabId } });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Mobile Sidebar (Slide-over drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            {/* Sidebar Drawer */}
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
                    onClick={() => handleSidebarNavigation(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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

      {/* Desktop Sidebar */}
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
              onClick={() => handleSidebarNavigation(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Identical to Dashboard navbar) */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-lg font-bold capitalize text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              {t('settings.header', 'Pengaturan Aplikasi')}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center justify-center bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            {/* Dark/Light Mode Toggle */}
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
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-default opacity-60"
                      >
                        <Settings className="w-4 h-4 text-slate-450 dark:text-slate-400" />
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
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
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

        {/* Content Area containing the premium settings tabular panel */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="w-full grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            {/* Inner Tabs Navigation Sidebar */}
            <div className="w-full lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-none shadow-sm h-fit">
              <div className="hidden lg:block px-4 py-1 mb-1">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Akun</span>
              </div>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap lg:w-full cursor-pointer",
                  activeTab === 'profile'
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>{t('settings.tabs.profile')}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap lg:w-full cursor-pointer",
                  activeTab === 'security'
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>{t('settings.tabs.security')}</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap lg:w-full cursor-pointer",
                  activeTab === 'preferences'
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>{t('settings.tabs.personalization')}</span>
              </button>

            <div className="hidden lg:block w-full h-[1px] bg-slate-100 dark:bg-slate-800/80 my-2" />
              <div className="hidden lg:block px-4 py-1">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Info</span>
              </div>
              
              <button
                onClick={() => setActiveTab('about')}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap lg:w-full cursor-pointer",
                  activeTab === 'about'
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>{t('settings.about.title', 'Tentang Aplikasi')}</span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap lg:w-full cursor-pointer",
                  activeTab === 'privacy'
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>{t('settings.privacy.title', 'Kebijakan Privasi')}</span>
              </button>
            </div>

            {/* Inner Content Card Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden min-h-[500px]">
              <div className="flex-1 overflow-auto p-6 space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      {/* Informasi Dasar Card */}
                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">{t('settings.profile.infoTitle')}</h4>

                        {isOAuth ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.profile.fullName')}</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.profile.email')}</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700/50 pt-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('settings.profile.accountCreated', 'Akun Dibuat')}</p>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(user?.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('settings.profile.lastLogin', 'Terakhir Login')}</p>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(user?.updated_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
                              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                {t('settings.profile.oauthNotice', 'Profil ini terhubung dengan akun {{provider}} Anda. Perubahan profil harus dilakukan melalui penyedia layanan tersebut.', { provider: user?.google_id ? 'Google' : 'GitHub' })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Profile Success Message */}
                            <AnimatePresence>
                              {profileSuccess && (
                                <motion.div
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                                >
                                  <CheckCircle className="w-4 h-4 shrink-0" />
                                  <span className="text-xs font-bold">{profileSuccess}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Profile General Error */}
                            {profileErrors.general && (
                              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-bold">{profileErrors.general[0]}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.profile.fullName')}</label>
                                <div className={cn(
                                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 transition-colors mt-1",
                                  profileErrors.name
                                    ? "border-red-400 dark:border-red-600"
                                    : "border-slate-200 dark:border-slate-700"
                                )}>
                                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                                  <input
                                    type="text"
                                    value={profileName}
                                    onChange={(e) => { setProfileName(e.target.value); setProfileErrors((prev) => { const n = { ...prev }; delete n.name; return n; }); }}
                                    className="bg-transparent border-none text-xs font-bold outline-none flex-1 min-w-0 w-full text-slate-800 dark:text-slate-200"
                                  />
                                </div>
                                {profileErrors.name && (
                                  <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5">{profileErrors.name[0]}</p>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.profile.email')}</label>
                                <div className={cn(
                                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 transition-colors mt-1",
                                  profileErrors.email
                                    ? "border-red-400 dark:border-red-600"
                                    : "border-slate-200 dark:border-slate-700"
                                )}>
                                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                  <input
                                    type="email"
                                    value={profileEmail}
                                    onChange={(e) => { setProfileEmail(e.target.value); setProfileErrors((prev) => { const n = { ...prev }; delete n.email; return n; }); }}
                                    className="bg-transparent border-none text-xs font-bold outline-none flex-1 min-w-0 w-full text-slate-800 dark:text-slate-200"
                                  />
                                </div>
                                {profileErrors.email && (
                                  <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5">{profileErrors.email[0]}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={handleProfileUpdate}
                                disabled={profileLoading}
                                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                              >
                                {profileLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {t('settings.profile.save', 'Simpan Profil')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Kata Sandi Card */}
                      {!isOAuth && (
                        <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-455 dark:text-slate-500">{t('settings.security.passwordTitle')}</h4>

                          {/* Password Success Message */}
                          <AnimatePresence>
                            {passwordSuccess && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                              >
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-bold">{passwordSuccess}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Password General Error */}
                          {passwordErrors.general && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span className="text-xs font-bold">{passwordErrors.general[0]}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.security.currentPassword')}</label>
                              <div className={cn(
                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 transition-colors mt-1",
                                passwordErrors.current_password
                                  ? "border-red-400 dark:border-red-600"
                                  : "border-slate-200 dark:border-slate-700"
                              )}>
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={currentPassword}
                                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors((prev) => { const n = { ...prev }; delete n.current_password; return n; }); }}
                                  placeholder="••••••••"
                                  className="bg-transparent border-none text-xs font-bold outline-none flex-1 min-w-0 w-full text-slate-800 dark:text-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none cursor-pointer shrink-0"
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {passwordErrors.current_password && (
                                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5">{passwordErrors.current_password[0]}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.security.newPassword')}</label>
                              <div className={cn(
                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 transition-colors mt-1",
                                passwordErrors.password
                                  ? "border-red-400 dark:border-red-600"
                                  : "border-slate-200 dark:border-slate-700"
                              )}>
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors((prev) => { const n = { ...prev }; delete n.password; return n; }); }}
                                  placeholder="••••••••"
                                  className="bg-transparent border-none text-xs font-bold outline-none flex-1 min-w-0 w-full text-slate-800 dark:text-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none cursor-pointer shrink-0"
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {newPassword.length > 0 && (
                                <div className="mt-2 px-1 space-y-1">
                                  {[
                                    { label: t('auth.passwordRules.length'), valid: newPassword.length >= 8 },
                                    { label: t('auth.passwordRules.uppercase'), valid: /[A-Z]/.test(newPassword) },
                                    { label: t('auth.passwordRules.number'), valid: /[0-9]/.test(newPassword) },
                                    { label: t('auth.passwordRules.symbol'), valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword) },
                                  ].map((rule) => (
                                    <div key={rule.label} className="flex items-center gap-1.5">
                                      {rule.valid ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      ) : (
                                        <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                      )}
                                      <span className={cn(
                                        "text-[10px] font-bold transition-colors",
                                        rule.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-400 dark:text-red-400"
                                      )}>
                                        {rule.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {passwordErrors.password && (
                                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5">{passwordErrors.password[0]}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">{t('settings.security.confirmPassword')}</label>
                              <div className={cn(
                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 transition-colors mt-1",
                                passwordErrors.password_confirmation
                                  ? "border-red-400 dark:border-red-600"
                                  : "border-slate-200 dark:border-slate-700"
                              )}>
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={confirmPassword}
                                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors((prev) => { const n = { ...prev }; delete n.password_confirmation; return n; }); }}
                                  placeholder="••••••••"
                                  className="bg-transparent border-none text-xs font-bold outline-none flex-1 min-w-0 w-full text-slate-800 dark:text-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none cursor-pointer shrink-0"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {passwordErrors.password_confirmation && (
                                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5">{passwordErrors.password_confirmation[0]}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handlePasswordUpdate}
                              disabled={passwordLoading}
                              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                            >
                              {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              {t('settings.security.updatePassword', 'Perbarui Kata Sandi')}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">{t('settings.security.additionalSecurity')}</h4>
                        
                        <div className="flex flex-col border-b border-slate-200/50 dark:border-slate-800/50">
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('settings.security.twoFactor')}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.security.twoFactorDesc')}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={twoFactorEnabled || isSettingUp2FA}
                                onChange={handleToggleTwoFactor}
                                disabled={isTogglingSecurity}
                              />
                              <div className={cn(
                                "w-9 h-5 bg-slate-250 peer-focus:outline-none rounded-full peer dark:bg-slate-750 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600",
                                isTogglingSecurity && "opacity-50"
                              )}></div>
                            </label>
                          </div>
                          
                          <AnimatePresence>
                            {isSettingUp2FA && !twoFactorEnabled && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2 pb-4 space-y-4">
                                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <Shield className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('settings.security.setup2fa.step1Title', '1. Scan QR Code')}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          {t('settings.security.setup2fa.step1Desc', 'Open your authenticator app and scan the following QR code:')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex justify-center mb-4">
                                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                                        {twoFactorQrCode ? (
                                          <img src={twoFactorQrCode} alt="2FA QR Code" className="w-32 h-32" />
                                        ) : (
                                          <div className="w-32 h-32 flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-center">
                                      <button
                                        onClick={() => setShowSetupKey(!showSetupKey)}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                      >
                                        {t('settings.security.setup2fa.unableToScan', 'Unable to scan? Use setup key')}
                                      </button>
                                      
                                      <AnimatePresence>
                                        {showSetupKey && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-3"
                                          >
                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 pl-4">
                                              <code className="text-[10px] sm:text-xs font-mono font-bold tracking-wider sm:tracking-widest text-slate-700 dark:text-slate-300 flex-1 text-left break-all">
                                                {twoFactorSetupKey}
                                              </code>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(twoFactorSetupKey || '');
                                                  toast(
                                                    t('settings.toasts.toastSuccess', 'Success'),
                                                    t('settings.toasts.toastSetupKeyCopied', 'Setup key copied to clipboard.'),
                                                    'success'
                                                  );
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm shrink-0"
                                                title="Copy key"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <Check className="w-4 h-4" />
                                      </div>
                                      <div className="w-full">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('settings.security.setup2fa.step2Title', '2. Verify Code')}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                                          {t('settings.security.setup2fa.step2Desc', 'Enter the 6-digit code generated by your app:')}
                                        </p>
                                        <input
                                          type="text"
                                          value={twoFactorSetupCode}
                                          onChange={(e) => setTwoFactorSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                          placeholder="000000"
                                          className="w-full text-center tracking-[0.2em] sm:tracking-[0.4em] font-mono text-2xl px-2 sm:px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                          maxLength={6}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && twoFactorSetupCode.length === 6) {
                                              handleEnable2FA();
                                            }
                                          }}
                                        />
                                        {twoFactorSetupError && (
                                          <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-[10px] mt-2 text-center font-bold"
                                          >
                                            {twoFactorSetupError}
                                          </motion.p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsSettingUp2FA(false)}
                                      disabled={twoFactorSetupLoading}
                                      className="py-2.5 px-6 rounded-xl text-xs font-bold"
                                    >
                                      {t('settings.security.setup2fa.cancelButton', 'Cancel')}
                                    </Button>
                                    <Button
                                      onClick={handleEnable2FA}
                                      disabled={twoFactorSetupLoading || twoFactorSetupCode.length !== 6}
                                      isLoading={twoFactorSetupLoading}
                                      className="py-2.5 px-6 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                      {t('settings.security.setup2fa.enableButton', 'Enable 2FA')}
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('settings.security.activeSessions')}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.security.activeSessionsDesc')}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={activeSessionsEnabled}
                              onChange={handleToggleActiveSessions}
                              disabled={isTogglingSecurity}
                            />
                            <div className={cn(
                              "w-9 h-5 bg-slate-250 peer-focus:outline-none rounded-full peer dark:bg-slate-750 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600",
                              isTogglingSecurity && "opacity-50"
                            )}></div>
                          </label>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">{t('settings.security.publicVisibility')}</h4>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('settings.security.hideFromSearch')}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.security.hideFromSearchDesc')}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={hideFromSearch}
                              onChange={async () => {
                                if (isTogglingSecurity) return;
                                setIsTogglingSecurity(true);
                                const newValue = !hideFromSearch;
                                setHideFromSearch(newValue);
                                try {
                                  const { updatePortfolioVisibility } = await import('../../lib/api');
                                  await updatePortfolioVisibility(newValue);
                                  toast(
                                    t('settings.toasts.toastSuccess', 'Success'),
                                    t('settings.toasts.toastSuccessDesc', 'Visibilitas portfolio diperbarui.'),
                                    'success'
                                  );
                                } catch (error) {
                                  // Revert on error
                                  setHideFromSearch(!newValue);
                                  toast(
                                    t('settings.toasts.toastError', 'Error'),
                                    t('settings.toasts.toastErrorDesc', 'Gagal memperbarui visibilitas.'),
                                    'error'
                                  );
                                } finally {
                                  setIsTogglingSecurity(false);
                                }
                              }}
                              disabled={isTogglingSecurity}
                            />
                            <div className={cn(
                              "w-9 h-5 bg-slate-250 peer-focus:outline-none rounded-full peer dark:bg-slate-750 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600",
                              isTogglingSecurity && "opacity-50"
                            )}></div>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'preferences' && (
                    <motion.div
                      key="preferences"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-455 dark:text-slate-500">{t('settings.personalization.languageTitle')}</h4>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                            <Languages className="w-3.5 h-3.5 text-indigo-500" />
                            {t('settings.personalization.appLanguage')}
                          </label>
                          <div className="relative" ref={langDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none text-slate-750 dark:text-slate-250 flex items-center justify-between hover:border-indigo-400 transition-colors"
                            >
                              <span>
                                {APP_LANGUAGES.find(l => l.code === pendingLanguage)?.name || 'Select Language'} 
                                ({pendingLanguage.toUpperCase()})
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isLangDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                              {isLangDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -5, scale: 0.98 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                >
                                  <div className="border-b border-slate-100 dark:border-slate-700/50">
                                    <input
                                      type="text"
                                        placeholder={t('settings.personalization.searchLanguage')}
                                      value={langSearch}
                                      onChange={(e) => setLangSearch(e.target.value)}
                                      className="w-full px-4 py-3 bg-transparent text-xs font-medium outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400/80"
                                    />
                                  </div>
                                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                    {APP_LANGUAGES.filter(lang => 
                                      lang.name.toLowerCase().includes(langSearch.toLowerCase()) || 
                                      lang.code.toLowerCase().includes(langSearch.toLowerCase())
                                    ).map((lang) => (
                                      <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => {
                                          setPendingLanguage(lang.code);
                                          setIsLangDropdownOpen(false);
                                          setLangSearch('');
                                        }}
                                        className={cn(
                                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between",
                                          pendingLanguage === lang.code 
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                        )}
                                      >
                                        <span>{lang.name} <span className="text-[10px] font-normal text-slate-400 opacity-80">({lang.code.toUpperCase()})</span></span>
                                        {pendingLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                                      </button>
                                    ))}
                                    {APP_LANGUAGES.filter(lang => 
                                      lang.name.toLowerCase().includes(langSearch.toLowerCase()) || 
                                      lang.code.toLowerCase().includes(langSearch.toLowerCase())
                                    ).length === 0 && (
                                      <div className="px-3 py-4 text-center text-xs text-slate-500">
                                        {t('settings.personalization.languageNotFound')}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-455 dark:text-slate-500">{t('settings.personalization.layoutTitle')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
                              {t('settings.personalization.layoutStyle', 'Gaya Tata Letak')}
                            </label>
                            <select 
                              value={pendingLayoutStyle} 
                              onChange={(e) => setPendingLayoutStyle(e.target.value as any)} 
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none text-slate-750 dark:text-slate-250"
                            >
                              <option value="modern">{t('settings.personalization.layoutModern', 'Gaya Modern (Default)')}</option>
                              <option value="classic">{t('settings.personalization.layoutClassic', 'Gaya Klasik')}</option>
                              <option value="minimalist">{t('settings.personalization.layoutMinimalist', 'Gaya Minimalis')}</option>
                              <option value="elegant">{t('settings.personalization.layoutElegant', 'Gaya Elegan')}</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                              <Type className="w-3.5 h-3.5 text-indigo-500" />
                              {t('settings.personalization.fontSize', 'Ukuran Font Aplikasi')}
                            </label>
                            <select 
                              value={pendingFontSize} 
                              onChange={(e) => setPendingFontSize(e.target.value as any)} 
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none text-slate-750 dark:text-slate-250"
                            >
                              <option value="small">{t('settings.personalization.fontSmall')}</option>
                              <option value="normal">{t('settings.personalization.fontNormal')}</option>
                              <option value="large">{t('settings.personalization.fontLarge')}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">{t('settings.about.title', 'Tentang Aplikasi')}</h4>
                        
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl flex items-center justify-center">
                            <Layout className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">DevFolio</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('settings.about.subtitle', 'Portfolio Builder Platform')}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500">{t('settings.about.version', 'Versi')}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">1.0.0 (Beta)</span>
                          </div>
                        </div>

                        <div className="h-[1px] bg-slate-200 dark:bg-slate-700/50 w-full my-6"></div>
                        
                        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                          <p>{t('settings.about.description', 'DevFolio adalah platform pembuat portofolio modern yang dirancang untuk developer, desainer, dan kreator profesional. Dengan DevFolio, Anda dapat membangun dan mempublikasikan portofolio Anda secara cepat dan mudah.')}</p>
                          <div className="space-y-2">
                            <h5 className="font-bold text-slate-800 dark:text-slate-200">{t('settings.about.license', 'Lisensi & Hak Cipta')}</h5>
                            <p>{t('settings.about.copyright', '© 2026 DevFolio Inc. Seluruh hak cipta dilindungi undang-undang.')}</p>
                          </div>
                          <div className="space-y-2 pt-2">
                            <h5 className="font-bold text-slate-800 dark:text-slate-200">{t('settings.about.developer', 'Developer')}</h5>
                            <p>{t('settings.about.developedBy', 'Dikembangkan oleh DevFolio Team')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'privacy' && (
                    <motion.div
                      key="privacy"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">{t('settings.privacy.title', 'Kebijakan Privasi')}</h4>
                        
                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                          <p className="font-medium">{t('settings.privacy.updateDate', 'Terakhir Diperbarui: 15 Juli 2026')}</p>
                          <p>
                            {t('settings.privacy.intro', 'Kebijakan Privasi ini menjelaskan bagaimana DevFolio mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.')}
                          </p>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{t('settings.privacy.section1Title', '1. Informasi yang Kami Kumpulkan')}</h5>
                          <p>
                            {t('settings.privacy.section1Content', 'Kami mengumpulkan informasi yang Anda berikan secara langsung saat membuat akun, membangun portofolio, dan menghubungi dukungan kami. Ini termasuk nama, email, dan data profesional Anda.')}
                          </p>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{t('settings.privacy.section2Title', '2. Penggunaan Informasi')}</h5>
                          <p>
                            {t('settings.privacy.section2Content', 'Informasi Anda digunakan untuk mengoperasikan, memelihara, dan menyediakan fitur-fitur dari layanan kami, serta untuk berkomunikasi dengan Anda terkait akun atau layanan.')}
                          </p>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{t('settings.privacy.section3Title', '3. Keamanan Data')}</h5>
                          <p>
                            {t('settings.privacy.section3Content', 'Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses, pengungkapan, atau penghancuran yang tidak sah.')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Footer Button Bar */}
              {activeTab !== 'profile' && activeTab !== 'about' && activeTab !== 'privacy' && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                  <Button variant="outline" onClick={() => navigate('/portfolio-builder')} className="rounded-2xl py-2 px-6 border-2 text-xs font-bold">
                    {t('settings.cancel', 'Batal')}
                  </Button>
                  <button 
                    onClick={() => {
                      if (activeTab === 'preferences') {
                        changeLanguage(pendingLanguage);
                        setFontSize(pendingFontSize);
                        setLayoutStyle(pendingLayoutStyle);
                        toast(t('settings.success'), t('settings.preferencesSaved'), 'success');
                      }
                      // You can add logic for other tabs if they have their own saves
                    }} 
                    className="px-6 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    {t('settings.saveChanges', 'Simpan Perubahan')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {/* Logout Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('settings.logout.title', 'Konfirmasi Logout')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                  {t('settings.logout.message', 'Apakah anda yakin ingin logout dari sistem?')}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="rounded-2xl py-3 border-2"
                  >
                    {t('settings.cancel', 'Batal')}
                  </Button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  >
                    {t('settings.logout.confirm', 'Ya, Logout')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Account Modal */}
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

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifikasi OTP</h3>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Kode OTP 6 digit telah dikirim ke <span className="font-bold">{otpTargetEmail}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Masukkan 6 digit kode"
                    className="w-full text-center tracking-[0.2em] sm:tracking-[0.6em] font-mono text-2xl sm:text-3xl px-2 sm:px-6 py-4 sm:py-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
                    maxLength={6}
                  />
                  {otpError && <p className="text-red-500 text-sm mt-3 text-center font-medium">{otpError}</p>}
                </div>

                <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Waktu tersisa: <span className="text-blue-600 dark:text-blue-400 font-mono">{formatOtpTimer()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => { setShowOtpModal(false); setOtpError(''); }}
                    className="rounded-2xl py-3 border-2"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleVerifyOtp}
                    isLoading={otpLoading}
                    className="rounded-2xl py-3"
                  >
                    Verifikasi
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2FA Disable Modal */}
      <AnimatePresence>
        {show2FADisableModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !disableLoading && setShow2FADisableModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('settings.security.disable2fa.title', 'Disable 2FA')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('settings.security.disable2fa.description', 'Are you sure you want to turn off two-factor authentication?')}
                  </p>
                </div>
              </div>

              {!isOAuth && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t('settings.security.disable2fa.confirmPasswordLabel', 'Enter your password to confirm')}
                  </label>
                  <div className="relative">
                    <input
                      type={showDisablePassword ? 'text' : 'password'}
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder={t('settings.security.disable2fa.currentPasswordPlaceholder', 'Current password')}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 outline-none text-slate-900 dark:text-white pr-12 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && disablePassword) {
                          handleDisable2FA();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDisablePassword(!showDisablePassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {disableError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-2 font-medium"
                    >
                      {disableError}
                    </motion.p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShow2FADisableModal(false)}
                  disabled={disableLoading}
                  className="flex-1 py-3 rounded-xl border-slate-200 dark:border-slate-700"
                >
                  {t('settings.security.disable2fa.cancelButton', 'Cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDisable2FA}
                  disabled={disableLoading || (!isOAuth && !disablePassword)}
                  isLoading={disableLoading}
                  className="flex-1 py-3 rounded-xl"
                >
                  {t('settings.security.disable2fa.confirmButton', 'Disable 2FA')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
