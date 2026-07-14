import { Layout } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">DevFolio</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              The modern portfolio builder for developers, designers, and creators. Build your brand today.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaTiktok className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Features</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Templates</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Pricing</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Showcase</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Documentation</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Blog</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Community</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Help Center</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">About Us</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Careers</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Privacy Policy</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Terms of Service</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Developers</h4>
            <ul className="space-y-3">
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">API Documentation</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">GitHub Repository</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Webhooks</button></li>
              <li><button className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Status</button></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} DevFolio Inc. All rights reserved | Terms of Use | Privacy | Legal
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm text-slate-500">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
