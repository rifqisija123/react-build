import { Code2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DevFolio</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#stats" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Stats</a>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-400">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <a href="#features" className="block text-base font-medium text-slate-600 dark:text-slate-400">Features</a>
          <a href="#how-it-works" className="block text-base font-medium text-slate-600 dark:text-slate-400">How it Works</a>
          <a href="#stats" className="block text-base font-medium text-slate-600 dark:text-slate-400">Stats</a>
          <hr className="border-slate-100 dark:border-slate-800" />
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Log In</Button>
          <Button className="w-full" onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      )}
    </nav>
  );
};
