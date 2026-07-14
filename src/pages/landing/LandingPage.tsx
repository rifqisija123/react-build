import { ArrowRight, BarChart3, Layout, Palette, Sparkles, Zap, Users, Globe, Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              <span>DevFolio v1.0 Is Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent leading-[1.1]">
              Build Your Dream <br />
              Portfolio in <span className="text-indigo-600">Minutes</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-12">
              Create a stunning, professional portfolio that showcases your best work. No coding required. Start building your personal brand today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto gap-2" onClick={() => navigate('/register')}>
                Start Building <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Templates
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-2">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3" 
                alt="Dashboard Preview" 
                className="rounded-xl w-full shadow-inner"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 md:-right-12 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Fast Deployment</p>
                  <p className="text-xs text-slate-500">Live Status</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create a professional portfolio that stands out.
            </p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={item} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Beautiful Templates</h3>
              <p className="text-slate-600 dark:text-slate-400">Choose from our collection of professionally designed templates to get started quickly.</p>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customization</h3>
              <p className="text-slate-600 dark:text-slate-400">Make it yours with custom colors, fonts, and layouts. Express your unique style.</p>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">Track your portfolio's performance with built-in analytics and visitor insights.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-indigo-600 dark:bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[80px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-[80px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-black">10K+</div>
              <div className="text-indigo-200 text-sm font-medium">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black">50K+</div>
              <div className="text-indigo-200 text-sm font-medium">Portfolios Created</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black">99.9%</div>
              <div className="text-indigo-200 text-sm font-medium">Uptime Guarantee</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1 text-4xl font-black">
                4.9 <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-indigo-200 text-sm font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get your portfolio up and running in three simple steps. No technical skills required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-indigo-100 via-indigo-500 to-indigo-100 dark:from-indigo-900/30 dark:via-indigo-500/50 dark:to-indigo-900/30 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-50 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <span className="text-2xl font-black">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Create Account</h3>
              <p className="text-slate-600 dark:text-slate-400">Sign up for free and choose a starting template that fits your style.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-50 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <span className="text-2xl font-black">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Add Content</h3>
              <p className="text-slate-600 dark:text-slate-400">Fill in your details, add your best projects, and customize the design.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-50 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <span className="text-2xl font-black">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Publish</h3>
              <p className="text-slate-600 dark:text-slate-400">Claim your custom URL and share your new portfolio with the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 dark:bg-black z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-40">
          <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-indigo-600 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[20%] w-[50%] h-[50%] bg-purple-600 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ready to stand out from the crowd?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have already built their dream portfolio with DevFolio.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl px-8 py-4 h-auto text-lg gap-2" onClick={() => navigate('/register')}>
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-slate-300 text-sm font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free custom subdomain</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cancel anytime</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
