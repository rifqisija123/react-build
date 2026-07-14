import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../../components/Button';
import { useToast } from '../../contexts/ToastContext';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;

    if (location.state?.showToast || searchParams.get('showToast') === 'true') {
      toastShown.current = true;
      toast('Access Denied', 'This page cannot be accessed. You must log in first.', 'error');
      
      if (searchParams.get('showToast') === 'true') {
        searchParams.delete('showToast');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [location.state, searchParams, toast, setSearchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Animated 401 Icon & Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative inline-flex flex-col items-center justify-center mb-8"
        >
          <div className="relative inline-block">
            <div className="text-[100px] md:text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 opacity-20 dark:opacity-30 absolute inset-0 blur-xl">
              401
            </div>
            <div className="text-[100px] md:text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 relative">
              401
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Access Denied
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
            Sorry, you don't have permission to access this page. Please log in to continue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full sm:w-auto gap-2 py-4 px-8 rounded-2xl border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all font-bold text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto gap-2 py-4 px-8 rounded-2xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 shadow-red-500/25 transition-all font-bold text-base text-white border-none"
            >
              <LogIn className="w-5 h-5" />
              Login Sekarang
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
