import { Mail, ArrowLeft, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import api from '../../lib/api';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const fromRegister = location.state?.fromRegister;
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  // Check if pending registration still exists
  useEffect(() => {
    if (!fromRegister) {
      navigate('/forbidden', { replace: true });
      return;
    }

    if (!email) {
      navigate('/forbidden', { replace: true });
      return;
    }

    const checkPending = async () => {
      try {
        const res = await api.post('/check-pending', { email });
        if (!res.data.pending) {
          // Already verified or no pending registration
          navigate('/login?verified=true', { replace: true });
          return;
        }
      } catch {
        // If API fails, still show the page
      } finally {
        setIsChecking(false);
      }
    };

    checkPending();
  }, [email, navigate]);

  const handleResend = async () => {
    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      await api.post('/resend-verification', { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      setResendError('Failed to resend verification email. Please try again.');
      setTimeout(() => setResendError(''), 5000);
    } finally {
      setIsResending(false);
    }
  };

  // Mask the email for privacy display
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (user.length <= 3) return `${user[0]}***@${domain}`;
    return `${user.slice(0, 3)}${'•'.repeat(Math.min(user.length - 3, 6))}@${domain}`;
  };

  // Show loading while checking pending status
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Checking verification status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
        >
          {/* Animated Email Icon */}
          <motion.div
            className="relative w-24 h-24 mx-auto mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 bg-indigo-500/10 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Inner circle */}
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30 rounded-full flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800/50 shadow-lg shadow-indigo-500/10">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Mail className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
            </div>
            {/* Notification dot */}
            <motion.div
              className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
            >
              <span className="text-white text-xs font-bold">1</span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Check Your Email
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2 max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We have sent a verification email to your email address. Please open it and click the <strong className="text-slate-700 dark:text-slate-300">"Confirm Account"</strong> button to activate your account.
          </motion.p>

          {/* Email Display */}
          {email && (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Mail className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                {maskEmail(email)}
              </span>
            </motion.div>
          )}

          {/* Steps */}
          <motion.div
            className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800/60 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Steps
            </p>
            <div className="space-y-3">
              {[
                'Open your email app (Gmail, Yahoo, etc)',
                'Find the email from DevFolio with the subject "Activate Account"',
                'Click the "Confirm Account" button inside the email',
                'You will be redirected to the login page to sign in',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resend Success */}
          {resendSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 px-4 py-3 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Verification email has been resent!
              </span>
            </motion.div>
          )}

          {/* Resend Error */}
          {resendError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl"
            >
              <span className="text-xs font-bold text-red-700 dark:text-red-400">{resendError}</span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={isResending || resendSuccess}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {isResending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isResending ? 'Resending...' : 'Resend Verification Email'}
            </button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-2xl border-2 text-sm font-bold gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-8 leading-relaxed">
            Didn't receive the email? Check your <strong>Spam</strong> or <strong>Junk</strong> folder. The verification link is valid for <strong>24 hours</strong>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
