import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Check, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';
import { verify2FALogin, send2FAEmailBackup } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AxiosError } from 'axios';

export const TwoFactorChallengePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth();
  const { toast } = useToast();

  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [emailBackupLoading, setEmailBackupLoading] = useState(false);
  const [emailBackupSent, setEmailBackupSent] = useState(false);

  // Extract state passed from AuthPage
  const state = location.state as { twoFactorToken?: string; rememberMe?: boolean } | null;
  const twoFactorToken = state?.twoFactorToken;
  const rememberMe = state?.rememberMe || false;

  // Redirect back to login if no token is found (accessed directly)
  useEffect(() => {
    if (!twoFactorToken) {
      toast('Error', 'Invalid session. Please login again.', 'error');
      navigate('/login', { replace: true });
    }
  }, [twoFactorToken, navigate, toast]);

  if (!twoFactorToken) {
    return null; // Will redirect shortly
  }

  const handle2FAVerify = async () => {
    if (twoFactorCode.length !== 6) {
      setTwoFactorError('Code must be 6 digits.');
      return;
    }

    setTwoFactorLoading(true);
    setTwoFactorError('');

    try {
      const response = await verify2FALogin(twoFactorToken, twoFactorCode, rememberMe);
      const { user, token } = response.data;
      
      setAuthData(user, token);
      toast('Success', 'Login successful! Welcome.', 'success');
      navigate('/overview', { replace: true });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setTwoFactorError(axiosError.response?.data?.message || 'Invalid verification code.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handle2FAEmailBackup = async () => {
    setEmailBackupLoading(true);
    try {
      await send2FAEmailBackup(twoFactorToken);
      setEmailBackupSent(true);
      toast('Success', 'Backup code sent to your email.', 'success');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast('Error', axiosError.response?.data?.message || 'Failed to send backup code.', 'error');
    } finally {
      setEmailBackupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-5 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="absolute inset-0 bg-indigo-500/10 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30 rounded-full flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800/50 shadow-lg shadow-indigo-500/10">
              <Shield className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
            </div>
          </motion.div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center tracking-[0.5em] font-mono text-3xl px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all placeholder:tracking-[0.5em] placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && twoFactorCode.length === 6) {
                  handle2FAVerify();
                }
              }}
            />
            {twoFactorError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-3 text-center font-semibold"
              >
                {twoFactorError}
              </motion.p>
            )}
          </div>

          {/* Verification status indicator */}
          {twoFactorCode.length === 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400"
            >
              <Check className="w-4 h-4" />
              <span className="text-xs font-bold">Code ready to verify</span>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => navigate('/login', { replace: true })}
              className="rounded-2xl py-3 border-2 text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handle2FAVerify}
              disabled={twoFactorLoading || twoFactorCode.length !== 6}
              className="rounded-2xl py-3 text-sm font-bold"
            >
              {twoFactorLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Shield className="w-4 h-4 mr-1" />
              )}
              Verify
            </Button>
          </div>

          {/* Email Backup */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3 font-medium">
              Lost access to your authenticator app?
            </p>
            <button
              onClick={handle2FAEmailBackup}
              disabled={emailBackupLoading || emailBackupSent}
              className={cn(
                "w-full py-2.5 rounded-xl text-xs font-bold transition-all",
                emailBackupSent
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
              )}
            >
              {emailBackupLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </span>
              ) : emailBackupSent ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Backup code sent to your email
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Send backup code via email
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
