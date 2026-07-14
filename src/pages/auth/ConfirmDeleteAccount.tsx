import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { confirmAccountDeletion } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export const ConfirmDeleteAccount = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Use a ref to prevent double execution in strict mode
  const executedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage(t('confirmDeleteAccount.missingToken', 'Token konfirmasi tidak ditemukan.'));
      return;
    }

    if (executedRef.current) return;
    executedRef.current = true;

    const confirmDeletion = async () => {
      try {
        await confirmAccountDeletion(token);
        setStatus('success');
        
        // Clear local storage manually just in case
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login?accountDeleted=true', { replace: true });
        }, 1500);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(
          t('confirmDeleteAccount.defaultError', 'Gagal menghapus akun. Token mungkin sudah kedaluwarsa.')
        );
      }
    };

    confirmDeletion();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-800"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('confirmDeleteAccount.loadingTitle', 'Menghapus Akun...')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {t('confirmDeleteAccount.loadingMessage', 'Mohon tunggu, kami sedang memproses permintaan Anda.')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('confirmDeleteAccount.successTitle', 'Akun Berhasil Dihapus')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {t('confirmDeleteAccount.successMessage', 'Semua data Anda telah dihapus secara permanen. Anda akan dialihkan...')}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('confirmDeleteAccount.errorTitle', 'Gagal Menghapus Akun')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-2xl transition-all"
            >
              {t('confirmDeleteAccount.backToHome', 'Kembali ke Beranda')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
