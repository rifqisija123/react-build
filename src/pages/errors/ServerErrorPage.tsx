import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';

export const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-500/10 dark:bg-zinc-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/10 dark:bg-slate-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Animated 500 Icon & Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative inline-flex flex-col items-center justify-center mb-8"
        >
          <div className="mb-4">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900/50 rounded-full flex items-center justify-center shadow-lg shadow-zinc-500/10 border border-zinc-200 dark:border-zinc-800">
              <ServerCrash className="w-12 h-12 text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>
          <div className="relative inline-block">
            <div className="text-[100px] md:text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-zinc-600 to-slate-800 dark:from-zinc-400 dark:to-slate-600 opacity-20 dark:opacity-30 absolute inset-0 blur-xl">
              500
            </div>
            <div className="text-[100px] md:text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-zinc-600 to-slate-800 dark:from-zinc-400 dark:to-slate-600 relative">
              500
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
            Internal Server Error
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
            Oops! A critical error or bug occurred on our server. Our development team has been notified and is working to fix it as quickly as possible.
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
              className="w-full sm:w-auto gap-2 py-4 px-8 rounded-2xl bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-xl shadow-zinc-500/10 transition-all font-bold text-base text-white border-none"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
