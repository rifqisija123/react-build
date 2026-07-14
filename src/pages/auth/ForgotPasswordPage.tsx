import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Check, X, ShieldCheck, KeyRound } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/Button';
import { FloatingInput } from '../../components/FloatingInput';
import { useToast } from '../../contexts/ToastContext';
import api from '../../lib/api';
import { AxiosError } from 'axios';

type Step = 'email' | 'otp' | 'reset';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step state
  const [step, setStep] = useState<Step>('email');

  // Step 1: Email
  const [email, setEmail] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Step 2: OTP
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Reset Password
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  const allPasswordChecksPass = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 'otp' || canResend) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, canResend]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} minutes ${s.toString().padStart(2, '0')} seconds`;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsEmailLoading(true);
    try {
      await api.post('/forgot-password/send-otp', { email: email.trim() });
      toast('Success', 'OTP has been sent to your email.', 'success');
      setStep('otp');
      setCountdown(180);
      setCanResend(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string; provider?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      if (status === 404) {
        toast('Error', message || 'Email not found.', 'error');
      } else if (status === 403) {
        toast('Error', message || 'Cannot reset password for third-party provider accounts.', 'error');
      } else {
        toast('Error', 'Something went wrong. Please try again later.', 'error');
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Step 2: OTP Input Handling
  const handleOtpChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    setOtpValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
        setOtpValues((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      } else {
        setOtpValues((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newValues = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || '';
    }
    setOtpValues(newValues);
    
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  }, [otpValues]);

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length !== 6) return;

    setIsOtpLoading(true);
    try {
      const response = await api.post('/forgot-password/verify-otp', {
        email: email.trim(),
        otp,
      });
      setResetToken(response.data.reset_token);
      toast('Success', 'OTP verified successfully.', 'success');
      setStep('reset');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string; expired?: boolean }>;
      const data = axiosError.response?.data;

      if (data?.expired) {
        toast('Error', 'OTP has expired.', 'error');
      } else {
        toast('Error', data?.message || 'Invalid OTP.', 'error');
      }
      // Clear OTP fields
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await api.post('/forgot-password/send-otp', { email: email.trim() });
      toast('Success', 'OTP has been resent.', 'success');
      setCountdown(180);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch {
      toast('Error', 'Failed to resend OTP.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPasswordChecksPass || !passwordsMatch) return;

    setIsResetLoading(true);
    try {
      await api.post('/forgot-password/reset', {
        email: email.trim(),
        reset_token: resetToken,
        password,
        password_confirmation: confirmPassword,
      });
      toast('Success', 'Password reset successfully.', 'success');
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast('Error', axiosError.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setIsResetLoading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (step === 'email') navigate('/login');
            else if (step === 'otp') setStep('email');
            else if (step === 'reset') setStep('otp');
          }}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {step === 'email' ? 'Back to Login' : 'Back'}
        </motion.button>

        <AnimatePresence mode="wait">
          {/* ════════════ STEP 1: EMAIL ════════════ */}
          {step === 'email' && (
            <motion.div
              key="email-step"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
                    <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <h1 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
                  Forgot Password
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed">
                  Enter your registered email address. We will send an OTP code to reset your password.
                </p>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <FloatingInput
                    id="forgot-email"
                    type="email"
                    label="Email Address"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />

                  <Button
                    type="submit"
                    className="w-full py-3.5 text-base font-bold shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isEmailLoading || !email.trim()}
                  >
                    {isEmailLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send OTP Code'
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 2: OTP VERIFICATION ════════════ */}
          {step === 'otp' && (
            <motion.div
              key="otp-step"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
                    <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <h1 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
                  Verify OTP Code
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed">
                  Enter the 6-digit code sent to your email to verify your identity.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpValues.map((value, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={cn(
                          "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
                          "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white",
                          value
                            ? "border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10"
                            : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                        )}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3.5 text-base font-bold shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isOtpLoading || otpValues.join('').length !== 6}
                  >
                    {isOtpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                </form>

                {/* Resend / Timer */}
                <div className="mt-6 text-center">
                  {canResend ? (
                    <button
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isResending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Resending...
                        </span>
                      ) : (
                        'Resend OTP Code'
                      )}
                    </button>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      Resend code in{' '}
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {formatCountdown(countdown)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 3: RESET PASSWORD ════════════ */}
          {step === 'reset' && (
            <motion.div
              key="reset-step"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                    <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <h1 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
                  Create New Password
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed">
                  Create a strong new password to secure your account.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* New Password */}
                  <FloatingInput
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightElement={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    required
                    autoFocus
                  />

                  {/* Password Strength Checklist */}
                  <AnimatePresence>
                    {password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1.5 border border-slate-100 dark:border-slate-800">
                          {[
                            { key: 'length', label: 'At least 8 characters' },
                            { key: 'uppercase', label: '1 uppercase letter (A-Z)' },
                            { key: 'number', label: '1 number (0-9)' },
                            { key: 'symbol', label: '1 symbol (!@#$%^&*)' },
                          ].map((rule) => (
                            <div key={rule.key} className="flex items-center gap-2">
                              {passwordChecks[rule.key as keyof typeof passwordChecks] ? (
                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                                  <X className="w-2.5 h-2.5 text-white stroke-[3]" />
                                </div>
                              )}
                              <span
                                className={cn(
                                  "text-xs font-medium transition-colors",
                                  passwordChecks[rule.key as keyof typeof passwordChecks]
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-500 dark:text-red-400"
                                )}
                              >
                                {rule.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm Password */}
                  <FloatingInput
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword.length > 0 && !passwordsMatch}
                    rightElement={
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    required
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-medium text-red-500 -mt-3"
                    >
                      Passwords do not match.
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-3.5 text-base font-bold shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isResetLoading || !allPasswordChecksPass || !passwordsMatch}
                  >
                    {isResetLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resetting Password...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
