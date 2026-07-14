import { User, Mail, Lock, Eye, EyeOff, Loader2, Check, X, Shield, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { GitHubIcon } from '../../components/GitHubIcon';
import { FloatingInput } from '../../components/FloatingInput';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import api from '../../lib/api';
import { AxiosError } from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AuthPage = () => {
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback state
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [lastFailedValues, setLastFailedValues] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();

  const shouldShowError = (field: string, currentValue: string) => {
    return !!errors[field] && currentValue === lastFailedValues[field];
  };

  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGitHub, isAuthenticated, isLoading: isAuthLoading, setAuthData } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  // Google OAuth Redirect Flow
  const GOOGLE_CLIENT_ID = '457828642125-qdb6jv3rs11nud2f9qap38hr0ihq16u8.apps.googleusercontent.com';
  const GOOGLE_REDIRECT_URI = 'http://localhost:5173/login';

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  // GitHub OAuth — redirect to backend which redirects to GitHub
  const handleGitHubLogin = () => {
    window.location.href = 'https://foliodev.smkn9kotabekasi.sch.id/api/auth/github';
  };

  // Handle OAuth callbacks from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleCode = urlParams.get('code');
    const githubAuth = urlParams.get('github_auth');
    const githubError = urlParams.get('github_error');

    // Handle Google callback
    if (googleCode && !isGoogleLoading) {
      setIsGoogleLoading(true);
      window.history.replaceState({}, '', '/login');

      (async () => {
        const result = await loginWithGoogle(googleCode);
        if (result.success) {
          toast('Success', 'Login successful! Welcome.', 'success');
          navigate('/overview', { replace: true });
        } else if (result.twoFactorRequired) {
          navigate('/login/2fa', { 
            state: { 
              twoFactorToken: result.twoFactorToken, 
              rememberMe: false 
            } 
          });
          setIsGoogleLoading(false);
        } else {
          toast('Error', result.errors?.general?.[0] || 'Google login failed.', 'error');
          setIsGoogleLoading(false);
        }
      })();
    }

    // Handle GitHub callback (token is in HttpOnly cookie)
    if (githubAuth === 'success' && !isGitHubLoading) {
      setIsGitHubLoading(true);
      window.history.replaceState({}, '', '/login');

      (async () => {
        const result = await loginWithGitHub();
        if (result.success) {
          toast('Success', 'Login successful! Welcome.', 'success');
          navigate('/overview', { replace: true });
        } else {
          toast('Error', result.errors?.general?.[0] || 'GitHub login failed.', 'error');
          setIsGitHubLoading(false);
        }
      })();
    }

    // Handle GitHub 2FA callback
    if (githubAuth === '2fa_required') {
      const twoFactorTokenParam = urlParams.get('two_factor_token');
      window.history.replaceState({}, '', '/login');
      if (twoFactorTokenParam) {
        navigate('/login/2fa', { 
          state: { 
            twoFactorToken: twoFactorTokenParam, 
            rememberMe: false 
          } 
        });
      }
    }

    // Handle GitHub error
    if (githubError) {
      window.history.replaceState({}, '', '/login');
      const errorMessages: Record<string, string> = {
        missing_code: 'GitHub authorization was cancelled.',
        token_exchange_failed: 'Failed to authenticate with GitHub.',
        user_fetch_failed: 'Failed to get GitHub user data.',
        no_email: 'No email found on your GitHub account. Please add a public email.',
      };
      toast('Error', errorMessages[githubError] || 'GitHub login failed.', 'error');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle verified redirect from email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');

    if (verified === 'true') {
      window.history.replaceState({}, '', '/login');
      toast('Success', 'Your account has been successfully verified! Please login.', 'success');
    } else if (verified === 'expired') {
      navigate('/expired-verification', { replace: true, state: { fromExpiredLink: true } });
      toast('Error', 'The verification link has expired. Please register again.', 'error');
    } else if (verified === 'invalid') {
      navigate('/invalid-verification', { replace: true, state: { fromInvalidLink: true } });
      toast('Error', 'Invalid verification link.', 'error');
    } else if (verified === 'already') {
      window.history.replaceState({}, '', '/login');
      toast('Info', 'This email has already been verified. Please login.', 'success');
    }

    const accountDeleted = urlParams.get('accountDeleted');
    if (accountDeleted === 'true') {
      window.history.replaceState({}, '', '/login');
      toast('Success', 'Your account has been permanently deleted.', 'success');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/overview', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Don't render the form while redirecting authenticated user
  if (isAuthenticated) {
    return null;
  }

  // Show fullscreen loader only while processing OAuth login
  if (isGoogleLoading || isGitHubLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {isGitHubLoading ? 'Logging in with GitHub...' : 'Logging in with Google...'}
          </p>
        </div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      // Redirect to verification page
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { state: { fromRegister: true } });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
      if (axiosError.response?.status === 422) {
        setErrors(axiosError.response.data.errors || {});
        setLastFailedValues({
          name: name.trim(),
          email: email.trim(),
          password: password,
          password_confirmation: confirmPassword
        });
      } else {
        setErrors({ general: ['Something went wrong. Please try again later.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setIsLoading(true);

    const result = await login(email.trim(), password, rememberMe);

    if (result.success) {
      toast('Success', 'Login successful! Welcome.', 'success');
      setErrors({});
      setLastFailedValues({});
      setTimeout(() => {
        navigate('/overview', { replace: true });
      }, 800);
    } else if (result.twoFactorRequired) {
      navigate('/login/2fa', { 
        state: { 
          twoFactorToken: result.twoFactorToken, 
          rememberMe: result.rememberMe 
        } 
      });
    } else {
      setErrors(result.errors || { general: ['Login failed. Please try again.'] });
      setLastFailedValues({
        email: email.trim(),
        password: password
      });
    }

    setIsLoading(false);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 mb-4 cursor-pointer"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg transition-all">
                  <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={authType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black tracking-tight mb-1">
                  {authType === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {authType === 'login' 
                    ? 'Login to continue' 
                    : 'Join our community'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
            <button
              onClick={() => { setAuthType('login'); setErrors({}); setSuccessMessage(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative",
                authType === 'login' ? "text-indigo-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {authType === 'login' && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-xl shadow-sm"
                />
              )}
              <span className="relative z-10">Sign In</span>
            </button>
            <button
              onClick={() => { setAuthType('register'); setErrors({}); setSuccessMessage(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative",
                authType === 'register' ? "text-indigo-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {authType === 'register' && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-xl shadow-sm"
                />
              )}
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl"
              >
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 text-center">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Error */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
              >
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 text-center">{errors.general[0]}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            <motion.div
              key={authType}
              initial={{ opacity: 0, x: authType === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: authType === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <form className="space-y-5" onSubmit={authType === 'register' ? handleRegister : handleLoginSubmit}>
                <div className="flex flex-col gap-6">
                  {authType === 'register' && (
                    <div>
                      <FloatingInput 
                        id="name"
                        type="text" 
                        label="Full Name"
                        icon={User}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        error={shouldShowError('name', name.trim())}
                      />
                      {shouldShowError('name', name.trim()) && (
                        <p className="text-sm text-red-500 font-semibold mt-1.5 px-1">{errors.name[0]}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <FloatingInput 
                      id="email"
                      type="email" 
                      label="Email Address"
                      icon={Mail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      error={shouldShowError('email', email.trim())}
                    />
                    {shouldShowError('email', email.trim()) && (
                      <p className="text-sm text-red-500 font-semibold mt-1.5 px-1">{errors.email[0]}</p>
                    )}
                  </div>
                  <div className="space-y-5">
                    <div>
                      <FloatingInput 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        label="Password"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        error={shouldShowError('password', password)}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        }
                      />
                      {/* Password strength checklist for register */}
                      {authType === 'register' && password.length > 0 && (
                        <div className="mt-2 px-1 space-y-1">
                          {[
                            { label: 'At least 8 characters', valid: password.length >= 8 },
                            { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
                            { label: 'One number', valid: /[0-9]/.test(password) },
                            { label: 'One special character', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
                          ].map((rule) => (
                            <div key={rule.label} className="flex items-center gap-1.5">
                              {rule.valid ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400" />
                              )}
                              <span className={cn(
                                "text-xs font-medium transition-colors",
                                rule.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-400 dark:text-red-400"
                              )}>
                                {rule.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {shouldShowError('password', password) && (
                        <div className="mt-1.5 px-1 space-y-0.5">
                          {errors.password.map((msg, i) => (
                            <p key={i} className="text-sm text-red-500 font-semibold">{msg}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    {authType === 'register' && (
                      <div>
                        <FloatingInput 
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"} 
                          label="Confirm Password"
                          icon={Lock}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          error={shouldShowError('password_confirmation', confirmPassword)}
                          rightElement={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          }
                        />
                        {shouldShowError('password_confirmation', confirmPassword) && (
                          <p className="text-sm text-red-500 font-semibold mt-1.5 px-1">{errors.password_confirmation[0]}</p>
                        )}
                      </div>
                    )}
                    {authType === 'login' && (
                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-700 rounded-md peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all group-hover:border-indigo-400"></div>
                            <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors select-none">
                            Remember me
                          </span>
                        </label>
                        <button onClick={() => navigate('/forgot-password')} type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer">
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-3.5 text-base font-bold shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {authType === 'login' ? 'Signing in...' : 'Signing up...'}
                    </span>
                  ) : (
                    authType === 'login' ? 'Sign In' : 'Sign Up'
                  )}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800/50"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="gap-2 py-3.5 rounded-2xl border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all font-bold text-sm"
              onClick={handleGitHubLogin}
              disabled={isGitHubLoading}
            >
              {isGitHubLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitHubIcon className="w-4 h-4" />
              )}
              GitHub
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 py-3.5 rounded-2xl border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all font-bold text-sm"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              )}
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
