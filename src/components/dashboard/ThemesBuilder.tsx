import { useState, useEffect } from 'react';
import { Palette, Check, LayoutTemplate, Type, PaintBucket, Sun, Moon, Monitor, Square, Circle, Loader2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';
import api from '../../lib/api';

import { useTranslation } from 'react-i18next';

const COLOR_PALETTES = [
  { id: 'slate', name: 'Slate', colorClass: 'bg-slate-800 dark:bg-slate-600', hoverClass: 'hover:bg-slate-900 dark:hover:bg-slate-500' },
  { id: 'red', name: 'Red', colorClass: 'bg-red-600', hoverClass: 'hover:bg-red-700' },
  { id: 'orange', name: 'Orange', colorClass: 'bg-orange-500', hoverClass: 'hover:bg-orange-600' },
  { id: 'amber', name: 'Amber', colorClass: 'bg-amber-500', hoverClass: 'hover:bg-amber-600' },
  { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-600', hoverClass: 'hover:bg-emerald-700' },
  { id: 'teal', name: 'Teal', colorClass: 'bg-teal-600', hoverClass: 'hover:bg-teal-700' },
  { id: 'sky', name: 'Sky Blue', colorClass: 'bg-sky-500', hoverClass: 'hover:bg-sky-600' },
  { id: 'blue', name: 'Blue', colorClass: 'bg-blue-600', hoverClass: 'hover:bg-blue-700' },
  { id: 'indigo', name: 'Indigo', colorClass: 'bg-indigo-600', hoverClass: 'hover:bg-indigo-700' },
  { id: 'purple', name: 'Purple', colorClass: 'bg-purple-600', hoverClass: 'hover:bg-purple-700' },
  { id: 'pink', name: 'Pink', colorClass: 'bg-pink-500', hoverClass: 'hover:bg-pink-600' },
  { id: 'rose', name: 'Rose', colorClass: 'bg-rose-600', hoverClass: 'hover:bg-rose-700' },
];

const FONTS = [
  { id: 'inter', name: 'Inter (Modern Sans)', class: 'font-sans', family: 'Inter, system-ui, sans-serif' },
  { id: 'poppins', name: 'Poppins (Geometric)', class: 'font-sans', family: 'Poppins, system-ui, sans-serif' },
  { id: 'montserrat', name: 'Montserrat (Clean)', class: 'font-sans', family: 'Montserrat, system-ui, sans-serif' },
  { id: 'playfair', name: 'Playfair Display (Elegant)', class: 'font-serif', family: '"Playfair Display", Georgia, serif' },
  { id: 'merriweather', name: 'Merriweather (Classic)', class: 'font-serif', family: 'Merriweather, Georgia, serif' },
  { id: 'lora', name: 'Lora (Balanced)', class: 'font-serif', family: 'Lora, Georgia, serif' },
  { id: 'fira-code', name: 'Fira Code (Tech Mono)', class: 'font-mono', family: '"Fira Code", monospace' },
  { id: 'jetbrains', name: 'JetBrains Mono (Dev)', class: 'font-mono', family: '"JetBrains Mono", monospace' },
];
export const ThemesBuilder = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const TEMPLATES = [
    { id: 'minimalist', name: t('dashboard.themes.templates.minimalist.name', 'Minimalist'), description: t('dashboard.themes.templates.minimalist.desc', 'Clean and simple design focusing on content.'), previewColor: 'bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800' },
    { id: 'developer-dark', name: t('dashboard.themes.templates.developerDark.name', 'Developer Dark'), description: t('dashboard.themes.templates.developerDark.desc', 'Dark theme perfect for showcasing code and tech stacks.'), previewColor: 'bg-[#0d1117] border-t-[12px] border-[#161b22]' },
    { id: 'creative', name: t('dashboard.themes.templates.creative.name', 'Creative'), description: t('dashboard.themes.templates.creative.desc', 'Vibrant and colorful layout for designers and creatives.'), previewColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500' },
    { id: 'executive', name: t('dashboard.themes.templates.executive.name', 'Executive'), description: t('dashboard.themes.templates.executive.desc', 'Professional and formal layout for business professionals.'), previewColor: 'bg-slate-100 dark:bg-[#0b1329]' },
    { id: 'bento-grid', name: t('dashboard.themes.templates.bentoGrid.name', 'Bento Grid'), description: t('dashboard.themes.templates.bentoGrid.desc', 'Modern Apple-style grid layout that highlights different skills efficiently.'), previewColor: 'bg-slate-200 dark:bg-slate-800' },
    { id: 'neo-brutalism', name: t('dashboard.themes.templates.neoBrutalism.name', 'Neo-Brutalism'), description: t('dashboard.themes.templates.neoBrutalism.desc', 'Bold borders and high contrast colors for a trendy, unapologetic look.'), previewColor: 'bg-yellow-400' },
    { id: 'glassmorphism', name: t('dashboard.themes.templates.glassmorphism.name', 'Glassmorphism'), description: t('dashboard.themes.templates.glassmorphism.desc', 'Frosted glass effects over colorful gradients for a sleek modern UI.'), previewColor: 'bg-gradient-to-tr from-cyan-200 via-indigo-100 to-purple-200 dark:from-cyan-950 dark:via-indigo-950 dark:to-purple-950' },
    { id: 'link-in-bio', name: t('dashboard.themes.templates.linkInBio.name', 'Link in Bio'), description: t('dashboard.themes.templates.linkInBio.desc', 'Compact vertical layout optimized for mobile screens and social media.'), previewColor: 'bg-rose-50 dark:bg-rose-950' },
  ];

  const APPEARANCES = [
    { id: 'light', name: t('dashboard.themes.appearances.light', 'Light'), icon: Sun },
    { id: 'dark', name: t('dashboard.themes.appearances.dark', 'Dark'), icon: Moon },
    { id: 'system', name: t('dashboard.themes.appearances.system', 'System'), icon: Monitor },
  ];

  const CORNERS = [
    { id: 'sharp', name: t('dashboard.themes.cornersOptions.sharp', 'Sharp'), icon: Square, class: 'rounded-none' },
    { id: 'rounded', name: t('dashboard.themes.cornersOptions.rounded', 'Rounded'), icon: Square, class: 'rounded-xl' },
    { id: 'pill', name: t('dashboard.themes.cornersOptions.pill', 'Pill'), icon: Circle, class: 'rounded-full' },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [selectedFont, setSelectedFont] = useState('inter');
  const [selectedAppearance, setSelectedAppearance] = useState('system');
  const [selectedCorner, setSelectedCorner] = useState('rounded');
  const [isSaving, setIsSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await api.get('/portfolio');
        const themeData = response.data.theme_data;
        if (themeData) {
          if (themeData.template) setSelectedTemplate(themeData.template);
          if (themeData.color) setSelectedColor(themeData.color);
          if (themeData.font) setSelectedFont(themeData.font);
          if (themeData.appearance) setSelectedAppearance(themeData.appearance);
          if (themeData.corner) setSelectedCorner(themeData.corner);
        }
      } catch (error) {
        console.error('Failed to load theme data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const handleReset = () => {
    setSelectedTemplate('minimalist');
    setSelectedColor('indigo');
    setSelectedFont('inter');
    setSelectedAppearance('system');
    setSelectedCorner('rounded');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const themeData = {
        template: selectedTemplate,
        color: selectedColor,
        font: selectedFont,
        appearance: selectedAppearance,
        corner: selectedCorner
      };
      
      const current = await api.get('/portfolio');
      await api.put('/portfolio', {
        profile_data: current.data.profile_data,
        sections_data: current.data.sections_data,
        theme_data: themeData
      });
      
      toast(t('dashboard.themes.successTitle', 'Success'), t('dashboard.themes.successMessage', 'Theme preferences updated successfully'), 'success');
    } catch (error) {
      toast(t('dashboard.themes.errorTitle', 'Error'), t('dashboard.themes.errorMessage', 'Failed to save theme preferences'), 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            {t('dashboard.themes.title', 'Templates & Themes')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('dashboard.themes.subtitle', 'Customize the look and feel of your public portfolio.')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={isSaving} 
            className="w-full sm:w-auto flex items-center gap-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            {t('dashboard.themes.reset', 'Reset Default')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? t('dashboard.themes.saving', 'Saving...') : t('dashboard.themes.save', 'Save Changes')}
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        {/* Templates Selection */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.themes.chooseTemplate', 'Choose a Template')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "relative flex flex-col text-left rounded-xl border-2 transition-all overflow-hidden focus:outline-none",
                  selectedTemplate === template.id
                    ? "border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-600/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className={cn("h-24 w-full", template.previewColor)} />
                <div className="p-4 bg-white dark:bg-slate-900 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{template.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Color Palette */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <PaintBucket className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.themes.primaryColor', 'Primary Color')}</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {COLOR_PALETTES.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={cn(
                  "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all focus:outline-none",
                  color.colorClass,
                  color.hoverClass,
                  selectedColor === color.id ? "ring-4 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110 shadow-lg z-10" : "scale-100 opacity-90"
                )}
                title={color.name}
              >
                {selectedColor === color.id && <Check className="w-6 h-6 text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Type className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.themes.typography', 'Typography')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setSelectedFont(font.id)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all focus:outline-none flex items-center justify-between",
                  selectedFont === font.id
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <span 
                  className={cn("text-lg font-medium text-slate-900 dark:text-white", font.class)}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </span>
                {selectedFont === font.id && (
                  <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Appearance Mode */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Sun className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.themes.appearance', 'Appearance')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {APPEARANCES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedAppearance(mode.id)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all focus:outline-none flex items-center justify-between",
                  selectedAppearance === mode.id
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <mode.icon className={cn("w-5 h-5", selectedAppearance === mode.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400")} />
                  <span className="font-medium text-slate-900 dark:text-white">{mode.name}</span>
                </div>
                {selectedAppearance === mode.id && (
                  <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Corner Style */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Square className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.themes.corners', 'Corners & Borders')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CORNERS.map((corner) => (
              <button
                key={corner.id}
                onClick={() => setSelectedCorner(corner.id)}
                className={cn(
                  "p-4 border-2 text-left transition-all focus:outline-none flex items-center justify-between",
                  corner.class,
                  selectedCorner === corner.id
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <span className="font-medium text-slate-900 dark:text-white">{corner.name}</span>
                {selectedCorner === corner.id && (
                  <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
