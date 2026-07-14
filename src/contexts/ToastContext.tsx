import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-4 pr-12 flex items-start gap-4 min-w-[320px] max-w-[400px] relative group">
                {/* Icon Circle */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  t.type === 'success' && "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500",
                  t.type === 'error' && "bg-red-50 dark:bg-red-900/30 text-red-500",
                  t.type === 'info' && "bg-blue-50 dark:bg-blue-900/30 text-blue-500",
                  t.type === 'warning' && "bg-amber-50 dark:bg-amber-900/30 text-amber-500",
                )}>
                  {t.type === 'success' && <Check className="w-6 h-6 stroke-[3]" />}
                  {t.type === 'error' && <AlertCircle className="w-6 h-6" />}
                  {t.type === 'info' && <Info className="w-6 h-6" />}
                  {t.type === 'warning' && <AlertCircle className="w-6 h-6" />}
                </div>

                <div className="flex flex-col gap-0.5">
                  <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                    {t.title}
                  </h4>
                  <p className="text-[13.5px] font-medium text-slate-500 dark:text-slate-400">
                    {t.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(t.id)}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
