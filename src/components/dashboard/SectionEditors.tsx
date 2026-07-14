import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Trash2, Upload, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useToast } from '../../contexts/ToastContext';
import type {
  PortfolioSection, SectionContent,
  AboutContent, SkillsContent, ProjectsContent, ProjectItem,
  WorkExpContent, WorkExpItem, OrgExpContent, OrgExpItem,
  EduContent, EduItem, CertContent, CertItem,
  ContactContent, ContactItem,
} from './PortfolioBuilder';

// Shared Helpers
export const useMonths = () => {
  const { t } = useTranslation();
  return [
    { value: '', label: t('builder.editor.sectionsForm.common.month', 'Bulan') },
    { value: '01', label: t('builder.editor.sectionsForm.common.months.1', 'Januari') },
    { value: '02', label: t('builder.editor.sectionsForm.common.months.2', 'Februari') },
    { value: '03', label: t('builder.editor.sectionsForm.common.months.3', 'Maret') },
    { value: '04', label: t('builder.editor.sectionsForm.common.months.4', 'April') },
    { value: '05', label: t('builder.editor.sectionsForm.common.months.5', 'Mei') },
    { value: '06', label: t('builder.editor.sectionsForm.common.months.6', 'Juni') },
    { value: '07', label: t('builder.editor.sectionsForm.common.months.7', 'Juli') },
    { value: '08', label: t('builder.editor.sectionsForm.common.months.8', 'Agustus') },
    { value: '09', label: t('builder.editor.sectionsForm.common.months.9', 'September') },
    { value: '10', label: t('builder.editor.sectionsForm.common.months.10', 'Oktober') },
    { value: '11', label: t('builder.editor.sectionsForm.common.months.11', 'November') },
    { value: '12', label: t('builder.editor.sectionsForm.common.months.12', 'Desember') },
  ];
};

export const useYears = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const years = [{ value: '', label: t('builder.editor.sectionsForm.common.year', 'Tahun') }];
  for (let y = currentYear; y >= 1925; y--) years.push({ value: String(y), label: String(y) });
  return years;
};

const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Custom DatePicker Component (Replaces native browser date pickers)
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
};

const CustomDatePicker = ({ value, onChange, disabled, placeholder, className, maxToday }: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxToday?: boolean;
}) => {
  const { t } = useTranslation();
  const monthList = useMonths().filter(m => m.value).map(m => m.label);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to today
  const parseDate = (val: string) => {
    if (!val) return new Date();
    const parts = val.split('-');
    if (parts.length !== 3) return new Date();
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const now = new Date();
  const realTimeYear = now.getFullYear();
  const realTimeMonth = now.getMonth(); // 0-11
  const realTimeDay = now.getDate();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  const months = monthList;

  // Year options: e.g. 1950 to currentYear + 15 (if maxToday is false) or currentYear (if true)
  const startYear = 1950;
  const endYear = maxToday ? realTimeYear : realTimeYear + 20;
  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }

  const getFilteredMonths = () => {
    if (maxToday && currentYear === realTimeYear) {
      return months.slice(0, realTimeMonth + 1);
    }
    return months;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (maxToday && currentYear === realTimeYear && currentMonth >= realTimeMonth) {
      return;
    }
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleMonthSelect = (mIdx: number) => {
    setViewDate(new Date(currentYear, mIdx, 1));
  };

  const handleYearSelect = (year: number) => {
    let month = currentMonth;
    if (maxToday && year === realTimeYear && currentMonth > realTimeMonth) {
      month = realTimeMonth;
    }
    setViewDate(new Date(year, month, 1));
  };

  const handleDaySelect = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formattedDate = `${currentYear}-${monthStr}-${dayStr}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Format date for the input field, e.g. "30 Mei 2026"
  const getFormattedInputVal = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const y = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const mName = monthList;
    return `${d} ${mName[mIdx] || ''} ${y}`;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        readOnly
        disabled={disabled}
        value={getFormattedInputVal()}
        placeholder={placeholder}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(className, "select-none cursor-pointer pr-10")}
      />
      <Calendar 
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" 
      />
      
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div className="fixed inset-0 z-[199999] bg-black/20 dark:bg-black/40 sm:hidden" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-[100%] sm:left-0 sm:translate-x-0 sm:translate-y-0 z-[200000] mt-0 sm:mt-1.5 p-3 w-[270px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl sm:shadow-xl select-none text-slate-800 dark:text-slate-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              <select
                value={currentMonth}
                onChange={(e) => handleMonthSelect(parseInt(e.target.value, 10))}
                className="bg-transparent border-0 font-semibold text-sm outline-none cursor-pointer text-slate-700 dark:text-slate-200"
              >
                {getFilteredMonths().map((m, idx) => (
                  <option key={m} value={idx} className="bg-white dark:bg-slate-900">{m}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => handleYearSelect(parseInt(e.target.value, 10))}
                className="bg-transparent border-0 font-semibold text-sm outline-none cursor-pointer text-slate-700 dark:text-slate-200"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900">{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty cells before the first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Active days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDate && 
                                selectedDate.getFullYear() === currentYear && 
                                selectedDate.getMonth() === currentMonth && 
                                selectedDate.getDate() === dayNum;
              
              const isFutureDay = maxToday && 
                                  currentYear === realTimeYear && 
                                  currentMonth === realTimeMonth && 
                                  dayNum > realTimeDay;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isFutureDay}
                  onClick={() => handleDaySelect(dayNum)}
                  className={cn(
                    "h-7 w-7 mx-auto rounded-full flex items-center justify-center font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit",
                    isSelected 
                      ? "bg-[#ea580c] text-white hover:bg-[#ea580c] dark:hover:bg-[#ea580c] hover:text-white dark:hover:text-white" 
                      : "text-slate-700 dark:text-white"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

const hasDateError = (startMonth: string, startYear: string, endMonth: string, endYear: string) => {
  if (!startYear || !endYear) return false;
  const startYr = parseInt(startYear, 10);
  const endYr = parseInt(endYear, 10);
  if (endYr < startYr) return true;
  if (endYr === startYr && startMonth && endMonth) {
    return parseInt(endMonth, 10) < parseInt(startMonth, 10);
  }
  return false;
};

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
const selectCls = "px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all flex-1 min-w-0";
const labelCls = "text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block";

// About Editor
const AboutEditor = ({ content, onChange }: { content: AboutContent; onChange: (c: AboutContent) => void }) => {
  const { t } = useTranslation();
  return (
    <div>
      <label className={labelCls}>{t('builder.editor.sectionsForm.about.label')}</label>
      <textarea
        value={content.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder={t('builder.editor.sectionsForm.about.placeholder')}
        rows={4}
        className={cn(inputCls, "resize-none")}
      />
    </div>
  );
};

// Skills Editor
const SkillsEditor = ({ content, onChange }: { content: SkillsContent; onChange: (c: SkillsContent) => void }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const addSkill = () => {
    const skill = input.trim();
    if (skill && !content.items.includes(skill)) {
      onChange({ items: [...content.items, skill] });
      setInput('');
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
          placeholder={t('builder.editor.sectionsForm.skills.addPlaceholder')}
          className={cn(inputCls, "flex-1")}
        />
        <button onClick={addSkill} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {content.items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {content.items.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {skill}
              <button onClick={() => onChange({ items: content.items.filter((s) => s !== skill) })} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Projects Editor
const ProjectsEditor = ({ content, onChange }: { content: ProjectsContent; onChange: (c: ProjectsContent) => void }) => {
  const { t } = useTranslation();
  const MONTHS = useMonths();
  const YEARS = useYears();
  const { toast } = useToast();

  const addItem = () => {
    const newItem: ProjectItem = { id: uid(), name: '', description: '', url: '', imageUrl: '', startMonth: '', startYear: '', endMonth: '', endYear: '', skills: [] };
    onChange({ items: [...content.items, newItem] });
  };
  const updateItem = (id: string, updates: Partial<ProjectItem>) => {
    onChange({ items: content.items.map((i) => i.id === id ? { ...i, ...updates } : i) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((i) => i.id !== id) });
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        toast(
          'Format File Tidak Sesuai',
          `File ${file.name} tidak sesuai dengan jenis file yang sudah ditentukan (JPG/PNG/WEBP)`,
          'error'
        );
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast(
          'Ukuran File Terlalu Besar',
          `Ukuran file ${file.name} tidak boleh melebihi 2MB`,
          'error'
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const currentItem = content.items.find(i => i.id === id);
    const existingImages = currentItem?.imageUrls || (currentItem?.imageUrl ? [currentItem.imageUrl] : []);

    const readAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
    };

    const newImages = await Promise.all(validFiles.map(readAsDataURL));
    updateItem(id, { imageUrls: [...existingImages, ...newImages] });
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <ProjectItemEditor key={item.id} item={item} idx={idx} onUpdate={updateItem} onRemove={removeItem} onImageUpload={handleImageUpload} months={MONTHS} years={YEARS} />
      ))}
      <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {t('builder.editor.sectionsForm.projects.addProject')}
      </button>
    </div>
  );
};

const ProjectItemEditor = ({ item: rawItem, idx, onUpdate, onRemove, onImageUpload, months, years }: {
  item: ProjectItem; idx: number;
  onUpdate: (id: string, u: Partial<ProjectItem>) => void;
  onRemove: (id: string) => void;
  onImageUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  months: { value: string; label: string }[];
  years: { value: string; label: string }[];
}) => {
  const { t } = useTranslation();
  // Defensive defaults for legacy or nullable database data
  const item: ProjectItem = {
    ...rawItem,
    name: rawItem.name ?? '',
    description: rawItem.description ?? '',
    url: rawItem.url ?? '',
    imageUrl: rawItem.imageUrl ?? '',
    imageUrls: rawItem.imageUrls ?? [],
    startMonth: rawItem.startMonth ?? '',
    startYear: rawItem.startYear ?? '',
    endMonth: rawItem.endMonth ?? '',
    endYear: rawItem.endYear ?? '',
    skills: rawItem.skills ?? [],
    current: !!rawItem.current,
  };

  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !item.skills.includes(skill)) {
      onUpdate(item.id, { skills: [...item.skills, skill] });
      setSkillInput('');
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const getFilteredMonths = (selectedYear: string) => {
    if (selectedYear && parseInt(selectedYear, 10) === currentYear) {
      return months.filter((m) => m.value === '' || parseInt(m.value, 10) <= currentMonth);
    }
    return months;
  };

  const startMonths = getFilteredMonths(item.startYear);
  const endMonths = getFilteredMonths(item.endYear);

  const handleStartYearChange = (val: string) => {
    let updatedMonth = item.startMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.startMonth && parseInt(item.startMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { startYear: val, startMonth: updatedMonth });
  };

  const handleEndYearChange = (val: string) => {
    let updatedMonth = item.endMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.endMonth && parseInt(item.endMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { endYear: val, endMonth: updatedMonth });
  };

  const endYears = item.startYear
    ? years.filter((y) => y.value === '' || parseInt(y.value, 10) >= parseInt(item.startYear, 10))
    : years;

  const isDateInvalid = !item.current && hasDateError(item.startMonth, item.startYear, item.endMonth, item.endYear);

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">{t('builder.editor.sectionsForm.projects.projectNum').replace('#', `#${idx + 1}`)}</span>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image */}
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.projects.uploadThumbnail')}</label>
        {(() => {
          const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : []);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden h-28 bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      const newImages = images.filter((_, idx) => idx !== i);
                      onUpdate(item.id, { imageUrls: newImages, ...(newImages.length === 0 ? { imageUrl: '' } : {}) });
                    }} 
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/60 text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs text-slate-400 font-medium text-center px-2">
                <Upload className="w-5 h-5 mb-1" /> 
                <span>{images.length > 0 ? "Tambah Gambar" : t('builder.editor.sectionsForm.projects.uploadThumbnail')}</span>
                <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={(e) => onImageUpload(item.id, e)} className="hidden" />
              </label>
            </div>
          );
        })()}
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.projects.title')}</label>
        <input value={item.name} onChange={(e) => onUpdate(item.id, { name: e.target.value })} placeholder={t('builder.editor.sectionsForm.projects.titlePlaceholder')} className={inputCls} />
      </div>
      {(() => {
        const wordCount = item.description ? item.description.trim().split(/\s+/).filter(Boolean).length : 0;
        const handleDescriptionChange = (text: string) => {
          const words = text.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 200) {
            onUpdate(item.id, { description: text });
          } else {
            const truncated = text.split(/\s+/).slice(0, 200).join(' ');
            onUpdate(item.id, { description: truncated });
          }
        };
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>{t('builder.editor.sectionsForm.projects.description')}</label>
              <span className={cn("text-[10px] font-semibold", wordCount >= 200 ? "text-amber-500" : "text-slate-400")}>
                {wordCount} / 200 {t('sectionEditors.common.words', 'words')}
              </span>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder={t('builder.editor.sectionsForm.projects.descriptionPlaceholder')}
              rows={5}
              className={cn(inputCls, "resize-none", wordCount >= 200 && "border-amber-400 focus:border-amber-400 focus:ring-amber-400")}
            />
          </div>
        );
      })()}
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.projects.url')}</label>
        <div className="relative">
          <input value={item.url} onChange={(e) => onUpdate(item.id, { url: e.target.value })} placeholder="https://..." className={cn(inputCls, "pr-9")} />
          {item.url && <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelCls}>{t('builder.editor.sectionsForm.work.startDate')}</label>
            <div className="flex gap-1.5">
              <select value={item.startMonth} onChange={(e) => onUpdate(item.id, { startMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {startMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={item.startYear} onChange={(e) => handleStartYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {years.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={cn(labelCls, item.current && "opacity-50")}>{t('builder.editor.sectionsForm.work.endDate')}</label>
            <div className="flex gap-1.5">
              <select disabled={item.current} value={item.endMonth} onChange={(e) => onUpdate(item.id, { endMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select disabled={item.current} value={item.endYear} onChange={(e) => handleEndYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endYears.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Checkbox Sedang Dikerjakan */}
        <div className="flex items-center gap-2 mt-1">
          <input
            id={`current-project-${item.id}`}
            type="checkbox"
            checked={item.current}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onUpdate(item.id, { 
                current: isChecked,
                ...(isChecked ? { endMonth: '', endYear: '' } : {})
              });
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
          />
          <label htmlFor={`current-project-${item.id}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            {t('builder.editor.sectionsForm.projects.currentProject')}
          </label>
        </div>

        {isDateInvalid && (
          <p className="text-[11px] font-medium text-red-500 mt-1">
            {t('builder.editor.sectionsForm.work.dateError')}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.work.skills')}</label>
        <div className="flex gap-2 mb-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder={t('builder.editor.sectionsForm.skills.addPlaceholder')} className={cn(inputCls, "flex-1")} />
          <button onClick={addSkill} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                {s}
                <button onClick={() => onUpdate(item.id, { skills: item.skills.filter((x) => x !== s) })} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Work Experience Editor
const JOB_TYPES = [
  { value: '', label: 'Pilih Jenis Pekerjaan' },
  { value: 'Penuh Waktu', label: 'Penuh Waktu' },
  { value: 'Paruh Waktu', label: 'Paruh Waktu' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Kontrak', label: 'Kontrak' },
  { value: 'Magang', label: 'Magang' },
  { value: 'Remote', label: 'Remote' },
];

const WorkExperienceEditor = ({ content, onChange }: { content: WorkExpContent; onChange: (c: WorkExpContent) => void }) => {
  const { t } = useTranslation();
  const MONTHS = useMonths();
  const YEARS = useYears();

  const addItem = () => {
    const newItem: WorkExpItem = { id: uid(), company: '', role: '', jobType: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', description: '', skills: [] };
    onChange({ items: [...content.items, newItem] });
  };
  const updateItem = (id: string, updates: Partial<WorkExpItem>) => {
    onChange({ items: content.items.map((i) => i.id === id ? { ...i, ...updates } : i) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((i) => i.id !== id) });
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <WorkExpItemEditor key={item.id} item={item} idx={idx} onUpdate={updateItem} onRemove={removeItem} months={MONTHS} years={YEARS} />
      ))}
      <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {t('builder.editor.sectionsForm.work.addExperience')}
      </button>
    </div>
  );
};

const WorkExpItemEditor = ({ item: rawItem, idx, onUpdate, onRemove, months, years }: {
  item: WorkExpItem; idx: number;
  onUpdate: (id: string, u: Partial<WorkExpItem>) => void;
  onRemove: (id: string) => void;
  months: { value: string; label: string }[];
  years: { value: string; label: string }[];
}) => {
  const { t } = useTranslation();
  // Defensive defaults for legacy data missing new fields
  const item: WorkExpItem = {
    ...rawItem,
    company: rawItem.company ?? '',
    role: rawItem.role ?? '',
    description: rawItem.description ?? '',
    jobType: rawItem.jobType ?? '',
    location: rawItem.location ?? '',
    startMonth: rawItem.startMonth ?? '',
    startYear: rawItem.startYear ?? '',
    endMonth: rawItem.endMonth ?? '',
    endYear: rawItem.endYear ?? '',
    skills: rawItem.skills ?? [],
    current: !!rawItem.current,
  };

  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !item.skills.includes(skill)) {
      onUpdate(item.id, { skills: [...item.skills, skill] });
      setSkillInput('');
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const getFilteredMonths = (selectedYear: string) => {
    if (selectedYear && parseInt(selectedYear, 10) === currentYear) {
      return months.filter((m) => m.value === '' || parseInt(m.value, 10) <= currentMonth);
    }
    return months;
  };

  const startMonths = getFilteredMonths(item.startYear);
  const endMonths = getFilteredMonths(item.endYear);

  const handleStartYearChange = (val: string) => {
    let updatedMonth = item.startMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.startMonth && parseInt(item.startMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { startYear: val, startMonth: updatedMonth });
  };

  const handleEndYearChange = (val: string) => {
    let updatedMonth = item.endMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.endMonth && parseInt(item.endMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { endYear: val, endMonth: updatedMonth });
  };

  const endYears = item.startYear
    ? years.filter((y) => y.value === '' || parseInt(y.value, 10) >= parseInt(item.startYear, 10))
    : years;

  const isDateInvalid = !item.current && hasDateError(item.startMonth, item.startYear, item.endMonth, item.endYear);

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">{t('builder.editor.sectionsForm.work.experienceNum').replace('#', '')}{idx + 1}</span>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.work.company')}</label>
        <input value={item.company} onChange={(e) => onUpdate(item.id, { company: e.target.value })} placeholder={t('builder.editor.sectionsForm.work.companyPlaceholder')} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.work.position')}</label>
        <input value={item.role} onChange={(e) => onUpdate(item.id, { role: e.target.value })} placeholder={t('builder.editor.sectionsForm.work.positionPlaceholder')} className={inputCls} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={labelCls}>{t('builder.editor.sectionsForm.work.employmentType')}</label>
          <select value={item.jobType} onChange={(e) => onUpdate(item.id, { jobType: e.target.value })} className={selectCls + " w-full"}>
            {JOB_TYPES.map((jt) => <option key={jt.value} value={jt.value}>{jt.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t('builder.editor.sectionsForm.work.location')}</label>
          <input value={item.location} onChange={(e) => onUpdate(item.id, { location: e.target.value })} placeholder={t('builder.editor.sectionsForm.work.locationPlaceholder')} className={inputCls} />
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelCls}>{t('builder.editor.sectionsForm.work.startDate')}</label>
            <div className="flex gap-1.5">
              <select value={item.startMonth} onChange={(e) => onUpdate(item.id, { startMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {startMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={item.startYear} onChange={(e) => handleStartYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {years.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={cn(labelCls, item.current && "opacity-50")}>{t('builder.editor.sectionsForm.work.endDate')}</label>
            <div className="flex gap-1.5">
              <select disabled={item.current} value={item.endMonth} onChange={(e) => onUpdate(item.id, { endMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select disabled={item.current} value={item.endYear} onChange={(e) => handleEndYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endYears.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Checkbox Saya Masih Bekerja */}
        <div className="flex items-center gap-2 mt-1">
          <input
            id={`current-work-${item.id}`}
            type="checkbox"
            checked={item.current}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onUpdate(item.id, { 
                current: isChecked,
                ...(isChecked ? { endMonth: '', endYear: '' } : {})
              });
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
          />
          <label htmlFor={`current-work-${item.id}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            {t('builder.editor.sectionsForm.work.currentWork')}
          </label>
        </div>

        {isDateInvalid && (
          <p className="text-[11px] font-medium text-red-500 mt-1">
            {t('builder.editor.sectionsForm.work.dateError')}
          </p>
        )}
      </div>

      {(() => {
        const wordCount = item.description ? item.description.trim().split(/\s+/).filter(Boolean).length : 0;
        const handleDescriptionChange = (text: string) => {
          const words = text.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 200) {
            onUpdate(item.id, { description: text });
          } else {
            const truncated = text.split(/\s+/).slice(0, 200).join(' ');
            onUpdate(item.id, { description: truncated });
          }
        };
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>{t('builder.editor.sectionsForm.work.description')}</label>
              <span className={cn("text-[10px] font-semibold", wordCount >= 200 ? "text-amber-500" : "text-slate-400")}>
                {wordCount} / 200 {t('sectionEditors.common.words', 'words')}
              </span>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder={t('builder.editor.sectionsForm.work.descriptionPlaceholder')}
              rows={5}
              className={cn(inputCls, "resize-none", wordCount >= 200 && "border-amber-400 focus:border-amber-400 focus:ring-amber-400")}
            />
          </div>
        );
      })()}

      {/* Skills */}
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.work.skills')}</label>
        <div className="flex gap-2 mb-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder={t('builder.editor.sectionsForm.skills.addPlaceholder')} className={cn(inputCls, "flex-1")} />
          <button onClick={addSkill} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                {s}
                <button onClick={() => onUpdate(item.id, { skills: item.skills.filter((x) => x !== s) })} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Repeating Item Editor (Org Exp, Education)
type RepeatItem = OrgExpItem | EduItem;
type RepeatContent = OrgExpContent | EduContent;

const RepeatingEditor = <T extends RepeatItem>({ content, onChange, fields, addLabel }: {
  content: { items: T[] };
  onChange: (c: { items: T[] }) => void;
  fields: { key: keyof T; label: string; placeholder: string; multiline?: boolean }[];
  addLabel: string;
  itemTitle?: string;
}) => {
  const addItem = () => {
    const blank: Record<string, string> = { id: uid() };
    fields.forEach((f) => { blank[f.key as string] = ''; });
    onChange({ items: [...content.items, blank as unknown as T] });
  };
  const updateItem = (id: string, key: keyof T, value: string) => {
    onChange({ items: content.items.map((i) => i.id === id ? { ...i, [key]: value } : i) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((i) => i.id !== id) });
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">{itemTitle ? `${itemTitle} #${idx + 1}` : `#${idx + 1}`}</span>
            <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {fields.map((f) => (
            <div key={f.key as string}>
              <label className={labelCls}>{f.label}</label>
              {f.multiline ? (
                <textarea value={(item[f.key] as string) || ''} onChange={(e) => updateItem(item.id, f.key, e.target.value)} placeholder={f.placeholder} rows={5} className={cn(inputCls, "resize-none")} />
              ) : (
                <input value={(item[f.key] as string) || ''} onChange={(e) => updateItem(item.id, f.key, e.target.value)} placeholder={f.placeholder} className={inputCls} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
};

// Certifications Editor
const CertItemEditor = ({
  item: rawItem,
  idx,
  onUpdate,
  onRemove,
}: {
  item: CertItem;
  idx: number;
  onUpdate: (id: string, u: Partial<CertItem>) => void;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const item: CertItem = {
    ...rawItem,
    name: rawItem.name ?? '',
    issuer: rawItem.issuer ?? '',
    issueDate: rawItem.issueDate ?? '',
    expiryDate: rawItem.expiryDate ?? '',
    noExpiry: !!rawItem.noExpiry,
    credentialUrl: rawItem.credentialUrl ?? '',
    skills: rawItem.skills ?? [],
    imageUrl: rawItem.imageUrl ?? '',
    description: rawItem.description ?? '',
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      toast(
        'Format File Tidak Sesuai',
        'File yang diupload tidak sesuai dengan jenis file yang sudah ditentukan yaitu JPG, PNG, atau WEBP',
        'error'
      );
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast(
        'Ukuran File Terlalu Besar',
        'Ukuran file gambar tidak boleh melebihi 2MB',
        'error'
      );
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate(item.id, { imageUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !item.skills.includes(skill)) {
      onUpdate(item.id, { skills: [...item.skills, skill] });
      setSkillInput('');
    }
  };

  const isDateInvalid = !item.noExpiry && item.issueDate && item.expiryDate && new Date(item.expiryDate) < new Date(item.issueDate);

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">{t('builder.editor.sectionsForm.cert.certNum').replace('#', '')}{idx + 1}</span>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.cert.name')}</label>
        <input value={item.name} onChange={(e) => onUpdate(item.id, { name: e.target.value })} placeholder={t('builder.editor.sectionsForm.cert.namePlaceholder')} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.cert.issuer')}</label>
        <input value={item.issuer} onChange={(e) => onUpdate(item.id, { issuer: e.target.value })} placeholder={t('builder.editor.sectionsForm.cert.issuerPlaceholder')} className={inputCls} />
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelCls}>{t('builder.editor.sectionsForm.cert.issueDate')}</label>
            <CustomDatePicker
              maxToday={true}
              value={item.issueDate}
              onChange={(val) => onUpdate(item.id, { issueDate: val })}
              placeholder={t('builder.editor.sectionsForm.cert.issueDatePlaceholder')}
              className={cn(inputCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}
            />
          </div>
          <div>
            <label className={cn(labelCls, item.noExpiry && "opacity-50")}>{t('builder.editor.sectionsForm.cert.expiryDate')}</label>
            <CustomDatePicker
              disabled={item.noExpiry}
              value={item.expiryDate}
              onChange={(val) => onUpdate(item.id, { expiryDate: val })}
              placeholder={t('builder.editor.sectionsForm.cert.expiryDatePlaceholder')}
              className={cn(
                inputCls,
                isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1",
                item.noExpiry && "opacity-50 cursor-not-allowed"
              )}
            />
          </div>
        </div>

        {/* Checkbox No Expiry */}
        <div className="flex items-center gap-2 mt-1">
          <input
            id={`no-expiry-${item.id}`}
            type="checkbox"
            checked={item.noExpiry}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onUpdate(item.id, { 
                noExpiry: isChecked,
                ...(isChecked ? { expiryDate: '' } : {})
              });
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
          />
          <label htmlFor={`no-expiry-${item.id}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            {t('builder.editor.sectionsForm.cert.noExpiry')}
          </label>
        </div>

        {/* Error Message */}
        {isDateInvalid && (
          <p className="text-[11px] font-medium text-red-500 mt-1">
            {t('builder.editor.sectionsForm.work.dateError')}
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.cert.url')}</label>
        <input value={item.credentialUrl} onChange={(e) => onUpdate(item.id, { credentialUrl: e.target.value })} placeholder="https://..." className={inputCls} />
      </div>

      {/* Gambar Sertifikat */}
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.cert.uploadThumbnail')}</label>
        {item.imageUrl ? (
          <div className="relative rounded-xl overflow-hidden h-32 bg-slate-200 dark:bg-slate-800">
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => onUpdate(item.id, { imageUrl: '' })} 
              className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/60 text-white hover:bg-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-colors text-xs text-slate-400 font-medium">
            <Upload className="w-4 h-4" /> {t('builder.editor.sectionsForm.cert.uploadThumbnailLimit')}
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Deskripsi */}
      {(() => {
        const wordCount = item.description ? item.description.trim().split(/\s+/).filter(Boolean).length : 0;
        const handleDescriptionChange = (text: string) => {
          const words = text.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 200) {
            onUpdate(item.id, { description: text });
          } else {
            const truncated = text.split(/\s+/).slice(0, 200).join(' ');
            onUpdate(item.id, { description: truncated });
          }
        };
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>{t('builder.editor.sectionsForm.work.description')}</label>
              <span className={cn("text-[10px] font-semibold", wordCount >= 200 ? "text-amber-500" : "text-slate-400")}>
                {wordCount} / 200 {t('sectionEditors.common.words', 'words')}
              </span>
            </div>
            <textarea
              value={item.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Deskripsi sertifikasi..."
              rows={5}
              className={cn(inputCls, "resize-none", wordCount >= 200 && "border-amber-400 focus:border-amber-400 focus:ring-amber-400")}
            />
          </div>
        );
      })()}

      {/* Skills */}
      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.work.skills')}</label>
        <div className="flex gap-2 mb-2">
          <input 
            value={skillInput} 
            onChange={(e) => setSkillInput(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} 
            placeholder={t('builder.editor.sectionsForm.skills.addPlaceholder')} 
            className={cn(inputCls, "flex-1")} 
          />
          <button 
            type="button"
            onClick={addSkill} 
            className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                {s}
                <button 
                  type="button"
                  onClick={() => onUpdate(item.id, { skills: item.skills.filter((x) => x !== s) })} 
                  className="hover:text-red-500 hover:bg-transparent"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CertificationsEditor = ({ content, onChange }: { content: CertContent; onChange: (c: CertContent) => void }) => {
  const { t } = useTranslation();
  const addItem = () => {
    onChange({ 
      items: [
        ...content.items, 
        { 
          id: uid(), 
          name: '', 
          issuer: '', 
          issueDate: '', 
          expiryDate: '', 
          noExpiry: false,
          credentialUrl: '',
          skills: [],
          description: ''
        }
      ] 
    });
  };
  const updateItem = (id: string, updates: Partial<CertItem>) => {
    onChange({ items: content.items.map((i) => i.id === id ? { ...i, ...updates } : i) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((i) => i.id !== id) });
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <CertItemEditor 
          key={item.id} 
          item={item} 
          idx={idx} 
          onUpdate={updateItem} 
          onRemove={removeItem} 
        />
      ))}
      <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {t('builder.editor.sectionsForm.cert.addCert')}
      </button>
    </div>
  );
};

// Education Editor
const EducationEditor = ({ content, onChange }: { content: EduContent; onChange: (c: EduContent) => void }) => {
  const { t } = useTranslation();
  const MONTHS = useMonths();
  const YEARS = useYears();

  const addItem = () => {
    const newItem: EduItem = { 
      id: uid(), 
      institution: '', 
      degree: '', 
      major: '', 
      startMonth: '', 
      startYear: '', 
      endMonth: '', 
      endYear: '', 
      description: '',
      current: false
    };
    onChange({ items: [...content.items, newItem] });
  };
  const updateItem = (id: string, updates: Partial<EduItem>) => {
    onChange({ items: content.items.map((i) => i.id === id ? { ...i, ...updates } : i) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((i) => i.id !== id) });
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <EduItemEditor key={item.id} item={item} idx={idx} onUpdate={updateItem} onRemove={removeItem} months={MONTHS} years={YEARS} />
      ))}
      <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {t('builder.editor.sectionsForm.edu.addEdu')}
      </button>
    </div>
  );
};

const EduItemEditor = ({ item: rawItem, idx, onUpdate, onRemove, months, years }: {
  item: EduItem; idx: number;
  onUpdate: (id: string, u: Partial<EduItem>) => void;
  onRemove: (id: string) => void;
  months: { value: string; label: string }[];
  years: { value: string; label: string }[];
}) => {
  const { t } = useTranslation();
  // Defensive defaults for legacy data missing new fields
  const item: EduItem = {
    ...rawItem,
    institution: rawItem.institution ?? '',
    degree: rawItem.degree ?? '',
    major: rawItem.major ?? '',
    gpa: rawItem.gpa ?? '',
    description: rawItem.description ?? '',
    startMonth: rawItem.startMonth ?? '',
    startYear: rawItem.startYear ?? '',
    endMonth: rawItem.endMonth ?? '',
    endYear: rawItem.endYear ?? '',
    current: !!rawItem.current,
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const getFilteredMonths = (selectedYear: string) => {
    if (selectedYear && parseInt(selectedYear, 10) === currentYear) {
      return months.filter((m) => m.value === '' || parseInt(m.value, 10) <= currentMonth);
    }
    return months;
  };

  const startMonths = getFilteredMonths(item.startYear || '');
  const endMonths = getFilteredMonths(item.endYear || '');

  const handleStartYearChange = (val: string) => {
    let updatedMonth = item.startMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.startMonth && parseInt(item.startMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { startYear: val, startMonth: updatedMonth });
  };

  const handleEndYearChange = (val: string) => {
    let updatedMonth = item.endMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.endMonth && parseInt(item.endMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { endYear: val, endMonth: updatedMonth });
  };

  const endYears = item.startYear
    ? years.filter((y) => y.value === '' || parseInt(y.value, 10) >= parseInt(item.startYear || '0', 10))
    : years;

  const isDateInvalid = !item.current && hasDateError(item.startMonth || '', item.startYear || '', item.endMonth || '', item.endYear || '');

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">{t('builder.editor.sectionsForm.edu.eduNum').replace('#', '')}{idx + 1}</span>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.edu.institution')}</label>
        <input value={item.institution} onChange={(e) => onUpdate(item.id, { institution: e.target.value })} placeholder="Nama sekolah/universitas..." className={inputCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={labelCls}>{t('builder.editor.sectionsForm.edu.degree')}</label>
          <input value={item.degree} onChange={(e) => onUpdate(item.id, { degree: e.target.value })} placeholder="Misal: S1, D3, SMA/SMK" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('builder.editor.sectionsForm.edu.major')}</label>
          <input value={item.major} onChange={(e) => onUpdate(item.id, { major: e.target.value })} placeholder="Misal: Teknik Informatika, IPS" className={inputCls} />
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelCls}>{t('builder.editor.sectionsForm.work.startDate')}</label>
            <div className="flex gap-1.5">
              <select value={item.startMonth} onChange={(e) => onUpdate(item.id, { startMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {startMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={item.startYear} onChange={(e) => handleStartYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {years.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={cn(labelCls, item.current && "opacity-50")}>{t('builder.editor.sectionsForm.work.endDate')}</label>
            <div className="flex gap-1.5">
              <select disabled={item.current} value={item.endMonth} onChange={(e) => onUpdate(item.id, { endMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select disabled={item.current} value={item.endYear} onChange={(e) => handleEndYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endYears.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Checkbox Saat Ini */}
        <div className="flex items-center gap-2 mt-1">
          <input
            id={`current-edu-${item.id}`}
            type="checkbox"
            checked={item.current}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onUpdate(item.id, { 
                current: isChecked,
                ...(isChecked ? { endMonth: '', endYear: '' } : {})
              });
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
          />
          <label htmlFor={`current-edu-${item.id}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            {t('builder.editor.sectionsForm.edu.currentStudy')}
          </label>
        </div>

        {/* Error Message */}
        {isDateInvalid && (
          <p className="text-[11px] font-medium text-red-500 mt-1">
            {t('builder.editor.sectionsForm.work.dateError')}
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.edu.gpa')}</label>
        <input 
          value={item.gpa} 
          onChange={(e) => {
            const val = e.target.value;
            // Only allow numbers and at most one dot
            const cleaned = val.replace(/[^0-9.]/g, '');
            const parts = cleaned.split('.');
            const finalVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
            onUpdate(item.id, { gpa: finalVal });
          }}
          placeholder="Misal: 3.85 atau 90.5" 
          className={inputCls} 
        />
      </div>

      {(() => {
        const wordCount = item.description ? item.description.trim().split(/\s+/).filter(Boolean).length : 0;
        const handleDescriptionChange = (text: string) => {
          const words = text.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 200) {
            onUpdate(item.id, { description: text });
          } else {
            const truncated = text.split(/\s+/).slice(0, 200).join(' ');
            onUpdate(item.id, { description: truncated });
          }
        };
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>{t('builder.editor.sectionsForm.work.description')}</label>
              <span className={cn("text-[10px] font-semibold", wordCount >= 200 ? "text-amber-500" : "text-slate-400")}>
                {wordCount} / 200 {t('sectionEditors.common.words', 'words')}
              </span>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Keterangan tambahan..."
              rows={5}
              className={cn(inputCls, "resize-none", wordCount >= 200 && "border-amber-400 focus:border-amber-400 focus:ring-amber-400")}
            />
          </div>
        );
      })()}
    </div>
  );
};

// Organizational Experience Editor
const OrgExperienceEditor = ({ content, onChange }: { content: OrgExpContent; onChange: (c: OrgExpContent) => void }) => {
  const { t } = useTranslation();
  const MONTHS = useMonths();
  const YEARS = useYears();

  const addItem = () => {
    const newItem: OrgExpItem = { 
      id: uid(), 
      organization: '', 
      role: '', 
      startMonth: '', 
      startYear: '', 
      endMonth: '', 
      endYear: '', 
      description: '',
      current: false
    };
    onChange({ items: [...content.items, newItem] });
  };
  const updateItem = (id: string, updates: Partial<OrgExpItem>) => {
    onChange({ items: content.items.map((i) => i.id === id ? { ...i, ...updates } : i) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((i) => i.id !== id) });
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <OrgExpItemEditor key={item.id} item={item} idx={idx} onUpdate={updateItem} onRemove={removeItem} months={MONTHS} years={YEARS} />
      ))}
      <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {t('builder.editor.sectionsForm.org.addOrg')}
      </button>
    </div>
  );
};

const OrgExpItemEditor = ({ item: rawItem, idx, onUpdate, onRemove, months, years }: {
  item: OrgExpItem; idx: number;
  onUpdate: (id: string, u: Partial<OrgExpItem>) => void;
  onRemove: (id: string) => void;
  months: { value: string; label: string }[];
  years: { value: string; label: string }[];
}) => {
  const { t } = useTranslation();
  // Defensive defaults for legacy data missing new fields
  const item: OrgExpItem = {
    ...rawItem,
    organization: rawItem.organization ?? '',
    role: rawItem.role ?? '',
    description: rawItem.description ?? '',
    startMonth: rawItem.startMonth ?? '',
    startYear: rawItem.startYear ?? '',
    endMonth: rawItem.endMonth ?? '',
    endYear: rawItem.endYear ?? '',
    current: !!rawItem.current,
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const getFilteredMonths = (selectedYear: string) => {
    if (selectedYear && parseInt(selectedYear, 10) === currentYear) {
      return months.filter((m) => m.value === '' || parseInt(m.value, 10) <= currentMonth);
    }
    return months;
  };

  const startMonths = getFilteredMonths(item.startYear || '');
  const endMonths = getFilteredMonths(item.endYear || '');

  const handleStartYearChange = (val: string) => {
    let updatedMonth = item.startMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.startMonth && parseInt(item.startMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { startYear: val, startMonth: updatedMonth });
  };

  const handleEndYearChange = (val: string) => {
    let updatedMonth = item.endMonth;
    if (val && parseInt(val, 10) === currentYear) {
      if (item.endMonth && parseInt(item.endMonth, 10) > currentMonth) {
        updatedMonth = '';
      }
    }
    onUpdate(item.id, { endYear: val, endMonth: updatedMonth });
  };

  const endYears = item.startYear
    ? years.filter((y) => y.value === '' || parseInt(y.value, 10) >= parseInt(item.startYear || '0', 10))
    : years;

  const isDateInvalid = !item.current && hasDateError(item.startMonth || '', item.startYear || '', item.endMonth || '', item.endYear || '');

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">{t('builder.editor.sectionsForm.org.orgNum').replace('#', '')}{idx + 1}</span>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.org.organization')}</label>
        <input value={item.organization} onChange={(e) => onUpdate(item.id, { organization: e.target.value })} placeholder="Nama organisasi..." className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.work.position')}</label>
        <input value={item.role} onChange={(e) => onUpdate(item.id, { role: e.target.value })} placeholder={t('builder.editor.sectionsForm.work.positionPlaceholder')} className={inputCls} />
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelCls}>{t('builder.editor.sectionsForm.work.startDate')}</label>
            <div className="flex gap-1.5">
              <select value={item.startMonth} onChange={(e) => onUpdate(item.id, { startMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {startMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={item.startYear} onChange={(e) => handleStartYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1")}>
                {years.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={cn(labelCls, item.current && "opacity-50")}>{t('builder.editor.sectionsForm.work.endDate')}</label>
            <div className="flex gap-1.5">
              <select disabled={item.current} value={item.endMonth} onChange={(e) => onUpdate(item.id, { endMonth: e.target.value })} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endMonths.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select disabled={item.current} value={item.endYear} onChange={(e) => handleEndYearChange(e.target.value)} className={cn(selectCls, isDateInvalid && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1", item.current && "opacity-50 cursor-not-allowed")}>
                {endYears.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Checkbox Saat Ini */}
        <div className="flex items-center gap-2 mt-1">
          <input
            id={`current-org-${item.id}`}
            type="checkbox"
            checked={item.current}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onUpdate(item.id, { 
                current: isChecked,
                ...(isChecked ? { endMonth: '', endYear: '' } : {})
              });
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
          />
          <label htmlFor={`current-org-${item.id}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            {t('sectionEditors.org.currentlyActive')}
          </label>
        </div>

        {/* Error Message */}
        {isDateInvalid && (
          <p className="text-[11px] font-medium text-red-500 mt-1">
            {t('builder.editor.sectionsForm.work.dateError')}
          </p>
        )}
      </div>

      {(() => {
        const wordCount = item.description ? item.description.trim().split(/\s+/).filter(Boolean).length : 0;
        const handleDescriptionChange = (text: string) => {
          const words = text.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 200) {
            onUpdate(item.id, { description: text });
          } else {
            const truncated = text.split(/\s+/).slice(0, 200).join(' ');
            onUpdate(item.id, { description: truncated });
          }
        };
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>{t('builder.editor.sectionsForm.work.description')}</label>
              <span className={cn("text-[10px] font-semibold", wordCount >= 200 ? "text-amber-500" : "text-slate-400")}>
                {wordCount} / 200 {t('sectionEditors.common.words', 'words')}
              </span>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Deskripsi kegiatan..."
              rows={5}
              className={cn(inputCls, "resize-none", wordCount >= 200 && "border-amber-400 focus:border-amber-400 focus:ring-amber-400")}
            />
          </div>
        );
      })()}
    </div>
  );
};

// Contact Editor
const CONTACT_PLATFORMS = [
  { value: 'Email', label: 'Email' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'GitHub', label: 'GitHub' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'Website', label: 'Website' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const formatContactUrl = (platform: string, value: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return trimmed;
  }

  switch (platform) {
    case 'Email':
      return `mailto:${trimmed}`;
    case 'Instagram':
      return `https://www.instagram.com/${trimmed.replace(/^@/, '')}`;
    case 'LinkedIn':
      return `https://www.linkedin.com/in/${trimmed}`;
    case 'WhatsApp':
      const num = trimmed.replace(/\D/g, '');
      return `https://wa.me/${num}`;
    case 'Facebook':
      return `https://www.facebook.com/${trimmed}`;
    case 'GitHub':
      return `https://github.com/${trimmed}`;
    case 'TikTok':
      return `https://www.tiktok.com/${trimmed.startsWith('@') ? trimmed : '@' + trimmed}`;
    case 'X':
      return `https://x.com/${trimmed.replace(/^@/, '')}`;
    case 'Website':
    case 'Lainnya':
    default:
      return `https://${trimmed}`;
  }
};

const ContactItemEditor = ({
  item: rawItem,
  idx,
  onUpdate,
  onRemove,
}: {
  item: ContactItem;
  idx: number;
  onUpdate: (id: string, updates: Partial<ContactItem>) => void;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const item: ContactItem = {
    ...rawItem,
    platform: rawItem.platform ?? 'Email',
    value: rawItem.value ?? '',
    url: rawItem.url ?? '',
  };

  const labelCls = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1";
  const inputCls = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium";
  const selectCls = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium";

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">{t('builder.editor.sectionsForm.contact.contactNum').replace('#', '')}{idx + 1}</span>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={labelCls}>{t('builder.editor.sectionsForm.contact.platform')}</label>
          <select value={item.platform} onChange={(e) => onUpdate(item.id, { platform: e.target.value })} className={selectCls}>
            {CONTACT_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t('builder.editor.sectionsForm.contact.displayText')}</label>
          <input value={item.value} onChange={(e) => onUpdate(item.id, { value: e.target.value })} placeholder={t('builder.editor.sectionsForm.contact.displayTextPlaceholder')} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>{t('builder.editor.sectionsForm.contact.url')}</label>
        <div className="relative">
          <input 
            value={item.url} 
            onChange={(e) => {
              let val = e.target.value;
              if (item.platform === 'WhatsApp') {
                val = val.replace(/^0+/, '');
              }
              onUpdate(item.id, { url: val });
            }} 
            onBlur={(e) => {
              const formatted = formatContactUrl(item.platform, e.target.value);
              if (formatted !== e.target.value) {
                onUpdate(item.id, { url: formatted });
              }
            }}
            placeholder={
              item.platform === 'WhatsApp' ? t('builder.editor.sectionsForm.contact.urlPlaceholderWhatsapp') :
              item.platform === 'Email' ? t('builder.editor.sectionsForm.contact.urlPlaceholderEmail') :
              ['Website', 'Lainnya'].includes(item.platform) ? t('builder.editor.sectionsForm.contact.urlPlaceholderWebsite') :
              t('builder.editor.sectionsForm.contact.urlPlaceholderDefault')
            }
            className={cn(inputCls, "pr-9")} 
          />
          {item.url && <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />}
        </div>
      </div>
    </div>
  );
};

const ContactEditor = ({ content, onChange }: { content: ContactContent; onChange: (c: ContactContent) => void }) => {
  const { t } = useTranslation();
  const updateItem = (id: string, updates: Partial<ContactItem>) => {
    onChange({ items: content.items.map((it) => (it.id === id ? { ...it, ...updates } : it)) });
  };
  const removeItem = (id: string) => {
    onChange({ items: content.items.filter((it) => it.id !== id) });
  };
  const addItem = () => {
    onChange({ items: [...content.items, { id: uid(), platform: 'Email', value: '', url: '' }] });
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <ContactItemEditor key={item.id} item={item} idx={idx} onUpdate={updateItem} onRemove={removeItem} />
      ))}
      <button onClick={addItem} className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all font-semibold text-sm">
        <Plus className="w-4 h-4" /> {t('builder.editor.sectionsForm.contact.addContact')}
      </button>
    </div>
  );
};

// Main Section Editor Switch
export const SectionEditor = ({
  section,
  onContentUpdate,
}: {
  section: PortfolioSection;
  onContentUpdate: (content: SectionContent) => void;
}) => {
  const content = section.content;
  if (!content) return null;

  switch (section.type) {
    case 'about':
      return <AboutEditor content={content as AboutContent} onChange={onContentUpdate} />;
    case 'skills':
      return <SkillsEditor content={content as SkillsContent} onChange={onContentUpdate} />;
    case 'projects':
      return <ProjectsEditor content={content as ProjectsContent} onChange={onContentUpdate} />;
    case 'work-experience':
      return <WorkExperienceEditor content={content as WorkExpContent} onChange={onContentUpdate} />;
    case 'org-experience':
      return <OrgExperienceEditor content={content as OrgExpContent} onChange={onContentUpdate} />;
    case 'education':
      return <EducationEditor content={content as EduContent} onChange={onContentUpdate} />;
    case 'certifications':
      return <CertificationsEditor content={content as CertContent} onChange={onContentUpdate} />;
    case 'contact':
      return <ContactEditor content={content as ContactContent} onChange={onContentUpdate} />;
    default:
      return null;
  }
};
