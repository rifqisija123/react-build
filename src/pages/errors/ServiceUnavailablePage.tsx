import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';

export const ServiceUnavailablePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 dark:bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Animated 503 Icon & Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative inline-flex flex-col items-center justify-center mb-8"
        >
          <div className="mb-4">
            <div className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Wrench className="w-12 h-12 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <div className="relative inline-block">
            <div className="text-[100px] md:text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-violet-500 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 opacity-20 dark:opacity-30 absolute inset-0 blur-xl">
              503
            </div>
            <div className="text-[100px] md:text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-violet-500 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 relative">
              503
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
            Service Unavailable
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
            Sorry, the service is currently unavailable. We might be undergoing routine maintenance. Please try again later.
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
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto gap-2 py-4 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 shadow-violet-500/25 transition-all font-bold text-base text-white border-none"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
