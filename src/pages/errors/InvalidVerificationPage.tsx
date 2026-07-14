import { motion } from 'framer-motion';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Unlink, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/Button';

export const InvalidVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.fromInvalidLink) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/10 to-transparent dark:from-red-500/5 opacity-50 pointer-events-none" />

          {/* Animated Icon */}
          <motion.div
            className="relative w-24 h-24 mx-auto mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 bg-red-500/10 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Inner circle */}
            <div className="relative w-full h-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-800/50 shadow-lg shadow-red-500/10">
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Unlink className="w-10 h-10 text-red-600 dark:text-red-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Invalid Link
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The verification link you used is invalid or unrecognized. Please use a valid verification link from your most recent email.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              onClick={() => navigate('/login')}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] border-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
