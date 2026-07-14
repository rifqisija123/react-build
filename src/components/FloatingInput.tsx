import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  error?: boolean;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, icon: Icon, rightElement, error, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "peer w-full bg-transparent rounded-2xl border-2 text-slate-900 dark:text-white placeholder-transparent focus:outline-none transition-all py-4",
              error 
                ? "border-red-500/50 dark:border-red-500/50 focus:border-red-500 hover:border-red-500" 
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 hover:border-indigo-400/50 dark:hover:border-indigo-500/30",
              Icon ? "pl-12" : "pl-4",
              (rightElement || error) ? "pr-12" : "pr-4",
              className
            )}
            placeholder={label}
            {...props}
          />
          <div className="absolute right-4 flex items-center gap-2 pointer-events-none">
            {error && (
              <AlertCircle className="w-5 h-5 text-red-500 animate-in zoom-in-50 duration-200" />
            )}
            {rightElement && (
              <div className={cn(
                "transition-colors cursor-pointer pointer-events-auto",
                error ? "text-red-400" : "text-slate-400 hover:text-indigo-500"
              )}>
                {rightElement}
              </div>
            )}
          </div>
          <label
            htmlFor={id}
            className={cn(
              "absolute px-1.5 bg-white dark:bg-slate-900 text-sm font-semibold transition-all pointer-events-none",
              error ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400",
              // Floating position (always left-4 when on top)
              "-top-2.5 left-4",
              // Inside position (when empty and not focused)
              "peer-placeholder-shown:text-base peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent",
              error ? "peer-placeholder-shown:text-red-400/80" : "peer-placeholder-shown:text-slate-500/60",
              Icon ? "peer-placeholder-shown:left-12" : "peer-placeholder-shown:left-4",
              // Focus state (stays at top left-4)
              "peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-sm peer-focus:font-semibold peer-focus:bg-white dark:peer-focus:bg-slate-900",
              error ? "peer-focus:text-red-500" : "peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
            )}
          >
            {label}
          </label>
        </div>
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
