import { useState, useRef, useEffect, useCallback } from 'react';
import {
  User, MapPin, Code2, FileText, Upload, Plus, Trash2, Eye, EyeOff,
  GripVertical, X, Briefcase, GraduationCap, FolderOpen, Sparkles, Info,
  ChevronDown, Camera, Check, Loader2, Users as UsersIcon, Download, Award,
  RotateCcw, RotateCw, ExternalLink, Mail, Link
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import { SectionEditor } from './SectionEditors';
import { removeBackground } from '@imgly/background-removal';

// Types
interface ProfileData {
  fullName: string;
  bio: string;
  location: string;
  gender: string;
  avatarUrl: string;
  cvFileName: string;
  cvFileUrl?: string;
}

export type SectionType = 'about' | 'skills' | 'projects' | 'work-experience' | 'org-experience' | 'education' | 'certifications' | 'contact';

export interface AboutContent { description: string }
export interface SkillsContent { items: string[] }
export interface ProjectItem {
  id: string; name: string; description: string; url: string; imageUrl: string;
  imageUrls?: string[];
  startMonth: string; startYear: string; endMonth: string; endYear: string;
  skills: string[]; current?: boolean;
}
export interface ProjectsContent { items: ProjectItem[] }
export interface WorkExpItem {
  id: string; company: string; role: string; jobType: string; location: string;
  startMonth: string; startYear: string; endMonth: string; endYear: string;
  description: string; skills: string[]; current?: boolean;
}
export interface WorkExpContent { items: WorkExpItem[] }
export interface OrgExpItem {
  id: string; organization: string; role: string;
  startMonth?: string; startYear?: string; endMonth?: string; endYear?: string;
  current?: boolean; period?: string; description: string;
}
export interface OrgExpContent { items: OrgExpItem[] }
export interface EduItem {
  id: string; institution: string; degree: string; major?: string; gpa?: string;
  startMonth?: string; startYear?: string; endMonth?: string; endYear?: string;
  current?: boolean; period?: string; description: string;
}
export interface EduContent { items: EduItem[] }
export interface CertItem {
  id: string; name: string; issuer: string;
  issueDate?: string; expiryDate?: string;
  noExpiry?: boolean; year?: string; credentialUrl: string;
  skills?: string[];
  imageUrl?: string;
  description?: string;
}
export interface CertContent { items: CertItem[] }

export interface ContactItem {
  id: string; platform: string; value: string; url: string;
}
export interface ContactContent { items: ContactItem[] }

export type SectionContent = AboutContent | SkillsContent | ProjectsContent | WorkExpContent | OrgExpContent | EduContent | CertContent | ContactContent;

export const getDefaultContent = (type: SectionType): SectionContent => {
  switch (type) {
    case 'about': return { description: '' };
    case 'skills': return { items: [] };
    case 'projects': return { items: [] };
    case 'work-experience': return { items: [] };
    case 'org-experience': return { items: [] };
    case 'education': return { items: [] };
    case 'certifications': return { items: [] };
    case 'contact': return { items: [] };
  }
};

export interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  content?: SectionContent;
}

const SECTION_META: Record<SectionType | 'experience', { labelKey: string; icon: typeof Info; color: string }> = {
  about:            { labelKey: 'builder.sections.aboutMe',                 icon: Info,           color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  skills:           { labelKey: 'builder.sections.skills',                   icon: Code2,          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  projects:         { labelKey: 'builder.sections.projects',                 icon: FolderOpen,     color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  'work-experience':{ labelKey: 'builder.sections.workExperience',          icon: Briefcase,      color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  'org-experience': { labelKey: 'builder.sections.orgExperience',icon: UsersIcon,      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  education:        { labelKey: 'builder.sections.education',                icon: GraduationCap,  color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
  certifications:   { labelKey: 'builder.sections.certifications',icon: Award,          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  contact:          { labelKey: 'builder.sections.contact',                 icon: Mail,           color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' },
  experience:       { labelKey: 'builder.sections.workExperience',          icon: Briefcase,      color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
};

// Section Item (Draggable)
const SectionItem = ({
  section,
  onToggle,
  onRemove,
  isSelected,
  onSelect,
  isExpanded,
  onExpandToggle,
  onContentUpdate,
}: {
  section: PortfolioSection;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
  onContentUpdate: (content: SectionContent) => void;
}) => {
  const { t } = useTranslation();
  const controls = useDragControls();
  const meta = SECTION_META[section.type];
  const Icon = meta.icon;

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "rounded-xl border bg-white dark:bg-slate-900 group transition-all overflow-hidden",
        section.visible
          ? "border-slate-200 dark:border-slate-800"
          : "border-dashed border-slate-300 dark:border-slate-700 opacity-60"
      )}
      whileDrag={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 50 }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onPointerDown={(e) => controls.start(e)}
            className="p-1 rounded cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 touch-none"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelect(section.id)}
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 mr-1",
              isSelected
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800"
            )}
          >
            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </button>
          <button onClick={onExpandToggle} className="flex items-center gap-2 cursor-pointer">
            <div className={cn("p-2 rounded-lg", meta.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={cn("font-semibold text-sm text-left", !section.visible && "line-through text-slate-400")}>
              {t(meta.labelKey) || section.title}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggle(section.id)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              section.visible
                ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title={section.visible ? 'Hide section' : 'Show section'}
          >
            {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onRemove(section.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remove section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
              <SectionEditor section={section} onContentUpdate={onContentUpdate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};

// Add Section Dropdown
const AddSectionDropdown = ({
  existingSections,
  onAdd,
  onAddAll,
}: {
  existingSections: SectionType[];
  onAdd: (type: SectionType) => void;
  onAddAll: () => void;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const allTypes: SectionType[] = ['about', 'skills', 'projects', 'work-experience', 'org-experience', 'education', 'certifications', 'contact'];
  const availableTypes = allTypes.filter((t) => !existingSections.includes(t));

  if (availableTypes.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] sm:text-sm font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0"
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">{t('builder.editor.addSection')}</span>
        <span className="sm:hidden whitespace-nowrap">Tambah</span>
        <ChevronDown className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
          >
            {availableTypes.length > 1 && (
              <button
                onClick={() => { onAddAll(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50/30 hover:bg-indigo-50/50 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/20 transition-colors text-left text-indigo-600 dark:text-indigo-400 font-bold"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm">{t('builder.editor.addAllSections')}</span>
              </button>
            )}
            <div className="py-1">
              {availableTypes.map((type) => {
                const meta = SECTION_META[type];
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    onClick={() => { onAdd(type); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className={cn("p-1.5 rounded-lg shrink-0", meta.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">{t(meta.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom SVG Gender Icon (Interlocking male/female symbols)
const GenderIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Female circle */}
    <circle cx="9" cy="15" r="4" />
    {/* Female cross */}
    <line x1="9" y1="19" x2="9" y2="23" />
    <line x1="7" y1="21" x2="11" y2="21" />
    {/* Male circle */}
    <circle cx="15" cy="9" r="4" />
    {/* Male arrow */}
    <line x1="17.8" y1="6.2" x2="22" y2="2" />
    <polyline points="18 2 22 2 22 6" />
  </svg>
);

// Gender Input Dropdown
const GenderInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (gender: string) => void;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isMaleOrFemale = value === 'Male' || value === 'Female';
  const isCustom = value && !isMaleOrFemale;
  
  const getDisplayValue = () => {
    if (!value) return t('builder.editor.selectGender');
    if (value === 'Male') return t('builder.editor.male');
    if (value === 'Female') return t('builder.editor.female');
    if (value === 'Custom') return t('builder.editor.custom');
    return value;
  };
  const displayValue = getDisplayValue();

  const selectOption = (opt: string) => {
    if (opt === 'Custom') {
      onChange(customValue || 'Custom');
      // Jangan langsung menutup dropdown agar user bisa mengetik di input kustom
    } else {
      onChange(opt);
      setIsOpen(false);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val || 'Custom');
  };

  const isFilled = !!value && value !== 'Custom';

  return (
    <div className="relative">
      <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        <span>
          <GenderIcon className="w-4 h-4 inline mr-1.5 -mt-0.5 text-slate-700 dark:text-slate-300" />
          {t('builder.editor.gender')}
        </span>
        {isFilled && <Check className="w-3.5 h-3.5 text-emerald-500" />}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all text-sm bg-slate-50 dark:bg-slate-800",
            isFilled 
              ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5 focus:ring-emerald-500" 
              : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
          )}
        >
          <span className={cn(!value && "text-slate-400")}>
            {value === 'Custom' ? 'Custom' : displayValue}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-[100] p-1.5 space-y-1"
            >
              {['Male', 'Female', 'Custom'].map((opt) => {
                const isSelected = opt === 'Custom' ? isCustom : value === opt;
                return (
                  <div key={opt} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => selectOption(opt)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left font-medium",
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <span>{opt === 'Male' ? t('builder.editor.male') : opt === 'Female' ? t('builder.editor.female') : t('builder.editor.custom')}</span>
                      <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                        isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-600"
                      )}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                    
                    {opt === 'Custom' && isCustom && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-2 pb-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={value === 'Custom' ? '' : value}
                          onChange={handleCustomChange}
                          placeholder={t('builder.editor.customPlaceholder')}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl border outline-none transition-all text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          )}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Image Cropper Component
import { BACKGROUND_PRESETS, type BackgroundPreset } from './BackgroundPresets';

// Image Cropper Component
const ImageCropperModal = ({
  image,
  onCropComplete,
  onCancel,
}: {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Background Editor states
  const [transparentSubject, setTransparentSubject] = useState<string | null>(null);
  const [activeBgType, setActiveBgType] = useState<'original' | 'preset'>('original');
  const [selectedBg, setSelectedBg] = useState<BackgroundPreset | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [removeProgress, setRemoveProgress] = useState('');
  const customBgInputRef = useRef<HTMLInputElement>(null);

  // Handle custom background upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Format Tidak Didukung', 'Hanya file gambar yang diperbolehkan.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const customPreset: BackgroundPreset = {
        id: `custom-upload-${Date.now()}`,
        name: 'Custom Upload',
        type: 'image',
        value: dataUrl,
        thumbnailCss: `url(${dataUrl})`,
      };
      setSelectedBg(customPreset);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleCropComplete = (_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  };

  // Helper to extract the cropped headshot from the original image
  const getCroppedImageSrc = async (): Promise<string | null> => {
    if (!croppedAreaPixels || !image) return null;

    const img = new Image();
    img.src = image;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const rotRad = (rotation * Math.PI) / 180;

    // Calculate rotated bounding box size to contain the rotated image
    const cos = Math.abs(Math.cos(rotRad));
    const sin = Math.abs(Math.sin(rotRad));
    const bBoxWidth = img.width * cos + img.height * sin;
    const bBoxHeight = img.width * sin + img.height * cos;

    // Set intermediate canvas size to match the rotated bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate context to center of rotated bounding box, apply rotation, then draw image centered
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-img.width / 2, -img.height / 2);
    ctx.drawImage(img, 0, 0);

    // Extract the cropped rectangle from the intermediate canvas
    const { width, height, x, y } = croppedAreaPixels;
    const data = ctx.getImageData(x, y, width, height);

    // Resize canvas to the final crop size
    canvas.width = width;
    canvas.height = height;

    // Put the cropped image data back
    ctx.putImageData(data, 0, 0);

    return canvas.toDataURL('image/png');
  };

  // AI Background Removal Trigger
  const handleRemoveBackground = async () => {
    if (!croppedAreaPixels || !image) return;

    setIsRemovingBg(true);
    setRemoveProgress('Preparing photo...');

    try {
      // 1. First extract the cropped headshot image
      const croppedBase64 = await getCroppedImageSrc();
      if (!croppedBase64) throw new Error('Failed to crop photo');

      // 2. Downscale the cropped image to max 512px for much faster AI processing
      const MAX_SIZE = 512;
      const downscaled = await new Promise<string>((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/png'));
        };
        img.src = croppedBase64;
      });

      // 3. Perform AI background removal with fast quantized model + GPU acceleration
      const blob = await removeBackground(downscaled, {
        model: 'small', // Changed from 'isnet_quint8' to 'small' for MUCH faster download and processing
        device: 'gpu',
        output: {
          format: 'image/png',
          quality: 0.8,
        },
      });

      // 4. Read processed PNG as Base64 data url
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransparentSubject(reader.result as string);
        setSelectedBg(BACKGROUND_PRESETS[0]); // default to first background preset
        setActiveBgType('preset');
        setIsRemovingBg(false);
      };
      reader.readAsDataURL(blob);

    } catch (err) {
      console.error('Background removal error:', err);
      toast('Terjadi Kesalahan', 'Gagal menghapus background. Coba lagi atau gunakan foto lain.', 'error');
      setIsRemovingBg(false);
    }
  };

  // Compose subject PNG over selected background
  const getComposedImageSrc = async (): Promise<string | null> => {
    if (!transparentSubject || !selectedBg) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Load subject image to match dimensions
    const subjectImg = new Image();
    subjectImg.src = transparentSubject;
    await new Promise((resolve, reject) => {
      subjectImg.onload = resolve;
      subjectImg.onerror = reject;
    });

    const { width, height } = subjectImg;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw background preset
    if (selectedBg.type === 'transparent') {
      // Don't draw any background to keep transparency
    } else if (selectedBg.type === 'color') {
      ctx.fillStyle = selectedBg.value;
      ctx.fillRect(0, 0, width, height);
    } else if (selectedBg.type === 'gradient' && selectedBg.gradientStops) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      selectedBg.gradientStops.forEach(([stop, color]) => {
        grad.addColorStop(stop, color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (selectedBg.type === 'image') {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous'; // Prevent tainted canvas
      bgImg.src = selectedBg.value;

      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = () => {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(0, 0, width, height);
          resolve(null);
        };
      });

      // Cover scale background to fit canvas
      const scale = Math.max(width / bgImg.width, height / bgImg.height);
      const x = (width / 2) - (bgImg.width / 2) * scale;
      const y = (height / 2) - (bgImg.height / 2) * scale;
      ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
    }

    // 2. Draw transparent subject on top
    ctx.drawImage(subjectImg, 0, 0);

    if (selectedBg.type === 'transparent') {
      return canvas.toDataURL('image/png');
    }
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSavePhoto = async () => {
    if (activeBgType === 'original') {
      const cropped = await getCroppedImageSrc();
      if (cropped) onCropComplete(cropped);
    } else {
      const composed = await getComposedImageSrc();
      if (composed) onCropComplete(composed);
    }
  };

  const getPreviewBackgroundStyle = (): React.CSSProperties => {
    if (!selectedBg) return { backgroundColor: '#f1f5f9' };
    if (selectedBg.type === 'transparent') {
      return {
        backgroundImage: 'conic-gradient(#e2e8f0 0.25turn, #ffffff 0.25turn 0.5turn, #e2e8f0 0.5turn 0.75turn, #ffffff 0.75turn)',
        backgroundSize: '16px 16px',
      };
    }
    if (selectedBg.type === 'color') {
      return { backgroundColor: selectedBg.value };
    } else if (selectedBg.type === 'gradient') {
      return { backgroundImage: selectedBg.value };
    } else {
      return {
        backgroundImage: `url(${selectedBg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] border border-slate-100 dark:border-slate-800 flex flex-col"
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <h3 className="text-base sm:text-xl font-bold">
            {activeBgType === 'preset' ? t('builder.cropper.chooseBackground') : t('builder.cropper.cropPhoto')}
          </h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeBgType === 'preset' && transparentSubject ? (
          // Stage 2: Background preset editor
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin">
            <div 
              style={getPreviewBackgroundStyle()} 
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl mx-auto overflow-hidden relative shadow-inner border border-slate-200 dark:border-slate-800 transition-all duration-300"
            >
              <img src={transparentSubject} alt="Subject" className="w-full h-full object-cover relative z-10" />
            </div>

            {/* Revert Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setTransparentSubject(null);
                  setActiveBgType('original');
                }}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('builder.cropper.useOriginal')}
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">{t('builder.cropper.backgroundPresets')}</span>
              <div className="flex flex-wrap gap-2.5 pb-2 pt-1 px-1 select-none max-w-full">
                {BACKGROUND_PRESETS.map((preset) => {
                  const isSelected = selectedBg?.id === preset.id;
                  const thumbStyle: React.CSSProperties = {};
                  
                  if (preset.type === 'transparent') {
                    thumbStyle.backgroundImage = 'conic-gradient(#e2e8f0 0.25turn, #ffffff 0.25turn 0.5turn, #e2e8f0 0.5turn 0.75turn, #ffffff 0.75turn)';
                    thumbStyle.backgroundSize = '8px 8px';
                  } else if (preset.type === 'color') {
                    thumbStyle.backgroundColor = preset.value;
                  } else if (preset.type === 'gradient') {
                    thumbStyle.backgroundImage = preset.value;
                  } else if (preset.type === 'image' && preset.thumbnailCss) {
                    thumbStyle.backgroundImage = preset.thumbnailCss;
                    thumbStyle.backgroundSize = 'cover';
                    thumbStyle.backgroundPosition = 'center';
                  }

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedBg(preset)}
                      style={thumbStyle}
                      className={cn(
                        "w-12 h-12 rounded-xl shrink-0 cursor-pointer border-2 transition-all relative snap-start focus:outline-none flex items-center justify-center overflow-hidden",
                        isSelected 
                          ? "border-indigo-600 scale-105 shadow-lg shadow-indigo-500/20" 
                          : "border-slate-200 dark:border-slate-800 hover:scale-105 hover:border-slate-400"
                      )}
                      title={preset.name}
                    >
                      {preset.type === 'transparent' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 dark:bg-slate-100/5">
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-1 py-0.5 rounded shadow-sm scale-90">{t('builder.cropper.none')}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-lg z-20">
                          <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Background Upload */}
            <div className="pt-1">
              <input
                ref={customBgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomBgUpload}
              />
              <button
                type="button"
                onClick={() => customBgInputRef.current?.click()}
                className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 group"
              >
                <Upload className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{t('builder.cropper.uploadBackground')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={onCancel} className="rounded-2xl py-2.5 sm:py-3 border-2">
                {t('builder.cropper.cancel')}
              </Button>
              <Button onClick={handleSavePhoto} className="rounded-2xl py-2.5 sm:py-3 font-bold">
                {t('builder.cropper.savePhoto')}
              </Button>
            </div>
          </div>
        ) : (
          // Stage 1: Cropper & Adjustments
          <div className="overflow-y-auto flex-1 scrollbar-thin flex flex-col">
            <div className="relative h-48 sm:h-80 w-full bg-slate-950 shrink-0">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
              />
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>{t('builder.cropper.zoom')}</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Rotation & Tilt Controls */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('builder.cropper.rotationTilt')}</span>
                  <button 
                    type="button" 
                    onClick={() => setRotation(0)}
                    className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 hover:underline transition-all"
                  >
                    {t('builder.cropper.resetRotation')}
                  </button>
                </div>
                
                {/* Beautiful custom Tilt slider with dotted ticks */}
                <div className="flex flex-col items-center space-y-2.5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80">
                  <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {rotation > 0 ? `+${rotation}` : rotation}°
                  </div>

                  <div className="w-full relative px-2 py-1 flex items-center">
                    {/* Dotted ticks behind the slider */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none select-none z-0">
                      {Array.from({ length: 25 }).map((_, i) => {
                        const val = -180 + i * 15;
                        const isCenter = val === 0;
                        const isMajor = val % 45 === 0;
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1 h-1 rounded-full transition-all duration-300",
                              isCenter 
                                ? "w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 scale-125" 
                                : isMajor 
                                  ? "bg-slate-400 dark:bg-slate-500" 
                                  : "bg-slate-200 dark:bg-slate-800"
                            )}
                          />
                        );
                      })}
                    </div>

                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full h-6 bg-transparent appearance-none cursor-pointer relative z-10 accent-indigo-600 focus:outline-none focus:ring-0 [&::-webkit-slider-runnable-track]:bg-slate-200/40 dark:[&::-webkit-slider-runnable-track]:bg-slate-700/20 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-translate-y-1.5 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 active:[&::-webkit-slider-thumb]:scale-125"
                    />
                  </div>

                  <div className="flex justify-between w-full px-2 text-[10px] font-semibold text-slate-400 select-none">
                    <span>-180°</span>
                    <span className={cn("transition-colors duration-300", rotation === 0 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "")}>0° ({t('builder.cropper.center')})</span>
                    <span>180°</span>
                  </div>
                </div>

                {/* Quick 90-degree rotate actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90) % 360)}
                    className="py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-indigo-650 dark:text-indigo-400 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                    title="Rotate Left"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('builder.cropper.rotateLeft')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-indigo-650 dark:text-indigo-400 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                    title="Rotate Right"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t('builder.cropper.rotateRight')}</span>
                  </button>
                </div>
              </div>

              {/* Remove Background Action */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />
                  <span>{t('builder.cropper.removeBackground')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={onCancel} className="rounded-2xl py-2.5 sm:py-3 border-2">
                  {t('builder.cropper.cancel')}
                </Button>
                <Button onClick={handleSavePhoto} className="rounded-2xl py-2.5 sm:py-3 font-bold">
                  {t('builder.cropper.savePhoto')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Background Removal Processing Overlay */}
        <AnimatePresence>
          {isRemovingBg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/15 backdrop-blur-md z-[20000] flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 px-8 py-5 rounded-[20px] shadow-2xl border border-slate-50 dark:border-slate-800 transition-all duration-300">
                <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 text-center leading-relaxed tracking-wide">
                  {t('builder.cropper.processing')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// CV Preview Modal
const CvPreviewModal = ({
  fileName,
  fileUrl,
  onClose,
}: {
  fileName: string;
  fileUrl: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileUrl.startsWith('data:application/pdf');
  
  // Detect mobile device
  const isMobileDevice = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] sm:h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col z-[10001]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              <h3 className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                {fileName}
              </h3>
              <p className="text-[9px] sm:text-xs text-slate-400">{t('builder.cvPreview.title', 'CV Preview')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('builder.cvPreview.downloadCv', 'Download CV')}</span>
              <span className="sm:hidden">{t('builder.cvPreview.download', 'Download')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-950/5 dark:bg-slate-950/20 overflow-y-auto relative custom-scrollbar">
          {isPdf && !isMobileDevice ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 bg-white"
              title="CV Document PDF Preview"
            />
          ) : isPdf && isMobileDevice ? (
            <div className="w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-4 sm:space-y-5 bg-slate-50 dark:bg-slate-900/40">
              <div className="relative">
                <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 relative z-10 shadow-lg shadow-indigo-500/10">
                  <FileText className="w-16 h-16" />
                </div>
                <div className="absolute -inset-2 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-[2rem] blur-lg -z-0" />
              </div>
              
              <div className="space-y-2 max-w-sm px-4">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('builder.cvPreview.title', 'CV Preview')}</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('builder.cvPreview.mobileMessage', 'Please download the CV file to preview.')}
                </p>
              </div>

              <div className="flex flex-col gap-2.5 w-full max-w-xs pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  {t('builder.cvPreview.downloadCv', 'Download CV')}
                </button>
                <button
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-2xl transition-all"
                >
                  {t('builder.cvPreview.back', 'Back')}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-4 bg-slate-50 dark:bg-slate-900/40">
              <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-16 h-16 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('builder.cvPreview.wordPreviewTitle', 'Word Document Preview')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('builder.cvPreview.wordPreviewMessage', 'Word documents (.doc/.docx) cannot be previewed natively in the browser. Please download the file to view it.')}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
              >
                <Download className="w-5 h-5" />
                {t('builder.cvPreview.downloadFile', 'Download CV File')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Live Preview
const LivePreview = ({
  profile,
  sections,
}: {
  profile: ProfileData;
  sections: PortfolioSection[];
}) => {
  const { t } = useTranslation();
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div className="sticky top-0 h-full rounded-3xl border-8 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden aspect-[9/16] max-h-[800px] mx-auto">
      <div className="h-full overflow-auto p-5 space-y-6 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 custom-scrollbar">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pt-6">
          <div className={cn(
            "w-20 h-20 rounded-full mb-3 shadow-xl flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300",
            profile.avatarUrl 
              ? "bg-transparent border border-slate-100 dark:border-slate-800" 
              : "bg-gradient-to-br from-indigo-500 to-purple-600"
          )}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <h4 className="text-lg font-bold">{profile.fullName || 'Your Name'}</h4>
          {profile.location && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {profile.location}
            </p>
          )}
          {profile.bio && (
            <p className="text-xs text-slate-500 mt-2 max-w-[220px] leading-relaxed">{profile.bio}</p>
          )}
          {profile.gender && (
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-3 inline-block">
              Gender: {profile.gender === 'Male' ? t('builder.editor.male') : profile.gender === 'Female' ? t('builder.editor.female') : profile.gender}
            </span>
          )}
        </div>

        {/* Sections */}
        {visibleSections.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">Add sections to build your portfolio</p>
          </div>
        )}

        {visibleSections.map((section) => {
          const meta = SECTION_META[section.type];
          return (
            <div key={section.id} className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <meta.icon className="w-3 h-3" />
                {t(meta.labelKey) || section.title}
              </h5>
              {/* Real content or placeholder */}
              {section.type === 'about' && (() => {
                const c = section.content as AboutContent | undefined;
                return c?.description ? (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{c.description}</p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                );
              })()}

              {section.type === 'skills' && (() => {
                const c = section.content as SkillsContent | undefined;
                const items = c?.items?.length ? c.items : ['React', 'Node.js', 'TypeScript', 'Laravel'];
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((s) => (
                      <span key={s} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">{s}</span>
                    ))}
                  </div>
                );
              })()}

              {section.type === 'projects' && (() => {
                const c = section.content as ProjectsContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-2.5">
                    {c.items.map((p) => {
                      const period = [
                        p.startMonth && p.startYear ? `${p.startMonth}/${p.startYear}` : '',
                        p.current ? 'Sekarang' : (p.endMonth && p.endYear ? `${p.endMonth}/${p.endYear}` : '')
                      ].filter(Boolean).join(' - ');
                      return (
                        <div key={p.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 overflow-hidden flex flex-col gap-2 p-2">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{p.name || 'Untitled'}</p>
                                {period && <p className="text-[8px] text-slate-400 font-semibold mt-0.5 truncate">{period}</p>}
                              </div>
                            </div>
                            {p.url && (
                              <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-350 shrink-0 flex items-center gap-0.5 transition-colors mt-0.5">
                                Lihat <ExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-[8px] text-slate-550 dark:text-slate-450 leading-relaxed mt-1 whitespace-pre-line">
                              {p.description}
                            </p>
                          )}
                          
                          {(() => {
                            const images = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []);
                            if (images.length > 0) {
                              return (
                                <div className="flex overflow-x-auto gap-2 mt-1 pb-1 snap-x custom-scrollbar">
                                  {images.map((url, i) => (
                                    <img key={i} src={url} alt="" className="w-24 h-16 object-cover rounded-lg shrink-0 snap-start border border-slate-100 dark:border-slate-800" />
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {p.skills && p.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 border-t border-slate-50 dark:border-slate-800/40 pt-1.5 mt-0.5">
                              {p.skills.map((s) => (
                                <span key={s} className="text-[7.5px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-2.5 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                          <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {section.type === 'work-experience' && (() => {
                const c = section.content as WorkExpContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-2">
                    {c.items.map((w) => {
                      const period = [
                        w.startMonth && w.startYear ? `${w.startMonth}/${w.startYear}` : '',
                        w.current ? 'Sekarang' : (w.endMonth && w.endYear ? `${w.endMonth}/${w.endYear}` : '')
                      ].filter(Boolean).join(' - ');
                      return (
                        <div key={w.id} className="flex gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 shrink-0 flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold truncate">{w.role || 'Posisi'}</p>
                            <p className="text-[9px] text-slate-400 truncate">{w.company}{w.jobType && ` · ${w.jobType}`}</p>
                            {(w.location || period) && (
                              <p className="text-[8px] text-slate-400/70 truncate">{[w.location, period].filter(Boolean).join(' · ')}</p>
                            )}
                            {w.description && (
                              <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 whitespace-pre-line">
                                {w.description}
                              </p>
                            )}
                            {w.skills && w.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {w.skills.map((s) => (
                                  <span key={s} className="text-[7px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                        <div className="flex-1 space-y-1"><div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" /><div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" /></div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {section.type === 'org-experience' && (() => {
                const c = section.content as OrgExpContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-2">
                    {c.items.map((o) => (
                      <div key={o.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 shrink-0 flex items-center justify-center">
                          <UsersIcon className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold truncate">{o.role || 'Posisi'}</p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {o.organization} 
                            {(o.startYear || o.period) && ' · '}
                            {(() => {
                              if (o.startYear) {
                                const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                                const startMonthName = o.startMonth ? (monthsList[parseInt(o.startMonth, 10) - 1] || '') : '';
                                const startStr = startMonthName ? `${startMonthName} ${o.startYear}` : o.startYear;
                                if (o.current) {
                                  return `${startStr} - Sekarang`;
                                }
                                if (o.endYear) {
                                  const endMonthName = o.endMonth ? (monthsList[parseInt(o.endMonth, 10) - 1] || '') : '';
                                  const endStr = endMonthName ? `${endMonthName} ${o.endYear}` : o.endYear;
                                  return `${startStr} - ${endStr}`;
                                }
                                return startStr;
                              }
                              return o.period || '';
                            })()}
                          </p>
                          {o.description && (
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 whitespace-pre-line">
                              {o.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-1"><div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" /><div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" /></div>
                  </div>
                );
              })()}

              {section.type === 'education' && (() => {
                const c = section.content as EduContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-2">
                    {c.items.map((e) => (
                      <div key={e.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 shrink-0 flex items-center justify-center">
                          <GraduationCap className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold truncate">
                            {e.degree || 'Gelar'}
                            {e.major ? ` - ${e.major}` : ''}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {e.institution} 
                            {(e.startYear || e.period) && ' · '}
                            {(() => {
                              if (e.startYear) {
                                const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                                const startMonthName = e.startMonth ? (monthsList[parseInt(e.startMonth, 10) - 1] || '') : '';
                                const startStr = startMonthName ? `${startMonthName} ${e.startYear}` : e.startYear;
                                if (e.current) {
                                  return `${startStr} - Saat Ini`;
                                }
                                if (e.endYear) {
                                  const endMonthName = e.endMonth ? (monthsList[parseInt(e.endMonth, 10) - 1] || '') : '';
                                  const endStr = endMonthName ? `${endMonthName} ${e.endYear}` : e.endYear;
                                  return `${startStr} - ${endStr}`;
                                }
                                return startStr;
                              }
                              return e.period || '';
                            })()}
                          </p>
                          {e.gpa && (
                            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              IPK/Nilai: {e.gpa}
                            </p>
                          )}
                          {e.description && (
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 whitespace-pre-line">
                              {e.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-1"><div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" /><div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" /></div>
                  </div>
                );
              })()}

              {section.type === 'certifications' && (() => {
                const c = section.content as CertContent | undefined;
                return c?.items?.length ? (
                  <div className="space-y-2">
                    {c.items.map((cert) => (
                      <div key={cert.id} className="flex gap-2">
                        {cert.imageUrl ? (
                          <img src={cert.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0 border border-slate-100 dark:border-slate-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 shrink-0 flex items-center justify-center">
                            <Award className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <p className="text-[10px] font-bold truncate">{cert.name || 'Sertifikasi'}</p>
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-350 shrink-0 flex items-center gap-0.5 transition-colors">
                                Lihat <ExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 truncate">
                            {cert.issuer} 
                            {(cert.issueDate || cert.year) && ' · '}
                            {(() => {
                              if (cert.issueDate) {
                                const formatDate = (dateStr: string) => {
                                  if (!dateStr) return '';
                                  const parts = dateStr.split('-');
                                  if (parts.length !== 3) return dateStr;
                                  const year = parts[0];
                                  const monthIdx = parseInt(parts[1], 10) - 1;
                                  const day = parseInt(parts[2], 10);
                                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                                  const monthName = months[monthIdx] || '';
                                  return `${day} ${monthName} ${year}`;
                                };

                                const startStr = formatDate(cert.issueDate);
                                if (cert.noExpiry) {
                                  return `${startStr} - Tanpa Kedaluwarsa`;
                                }
                                if (cert.expiryDate) {
                                  return `${startStr} - ${formatDate(cert.expiryDate)}`;
                                }
                                return startStr;
                              }
                              return cert.year || '';
                            })()}
                          </p>
                          {cert.description && (
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 whitespace-pre-line">
                              {cert.description}
                            </p>
                          )}
                          {cert.skills && cert.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {cert.skills.map((s) => (
                                <span key={s} className="text-[7px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-indigo-500"><Award className="w-4 h-4" /></div>
                        <div className="flex-1 space-y-1"><div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" /><div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" /></div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {section.type === 'contact' && (() => {
                const c = section.content as ContactContent | undefined;
                return c?.items?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {c.items.map((contact) => (
                      <a 
                        key={contact.id} 
                        href={contact.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-400 transition-colors text-[10px] text-slate-600 dark:text-slate-300"
                      >
                        {(() => {
                          switch (contact.platform.toLowerCase()) {
                            case 'email': return <Mail className="w-3 h-3 text-red-500" />;
                            case 'linkedin': return <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
                            case 'instagram': return <svg className="w-3 h-3 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
                            case 'whatsapp': return <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
                            case 'facebook': return <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
                            case 'github': return <svg className="w-3 h-3 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
                            case 'tiktok': return <svg className="w-3 h-3 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
                            case 'x': return <svg className="w-3 h-3 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>;
                            default: return <Link className="w-3 h-3 text-indigo-500" />;
                          }
                        })()}
                        <span className="font-medium truncate max-w-[120px]">{contact.value}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-7 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    ))}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Component
export const PortfolioBuilder = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const DEFAULT_PROFILE: ProfileData = {
    fullName: '',
    bio: '',
    location: '',
    gender: '', 
    avatarUrl: '',
    cvFileName: '',
    cvFileUrl: '',
  };


  const DEFAULT_SECTIONS: PortfolioSection[] = [
    { id: 'about-1',           type: 'about',           title: 'About Me',                 visible: true },
    { id: 'skills-1',          type: 'skills',          title: 'Skills',                   visible: true },
    { id: 'projects-1',        type: 'projects',        title: 'Projects',                 visible: true },
    { id: 'work-experience-1', type: 'work-experience', title: 'Work Experience',          visible: true },
    { id: 'org-experience-1',  type: 'org-experience',  title: 'Organizational Experience',visible: true },
    { id: 'education-1',       type: 'education',       title: 'Education',                visible: true },
    { id: 'contact-1',         type: 'contact',         title: 'Contact Me',               visible: true },
  ];

  // Profile state
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);

  // Sections state
  const [sections, setSections] = useState<PortfolioSection[]>(DEFAULT_SECTIONS);

  // Loading & saving state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewingCv, setIsPreviewingCv] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Fetch portfolio data from API on mount or user change
  useEffect(() => {
    if (!user?.id) return;

    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/portfolio');
        const { profile_data, sections_data } = response.data;

        if (profile_data) {
          // Remove legacy techStack and ensure gender is initialized
          const { techStack, ...cleanedProfile } = profile_data;
          setProfile({
            ...DEFAULT_PROFILE,
            ...cleanedProfile,
            gender: profile_data.gender || '',
          });
        } else {
          setProfile(DEFAULT_PROFILE);
        }

        if (sections_data) {
          // Map legacy 'experience' sections to 'work-experience' to prevent errors
          const mappedSections = (sections_data as PortfolioSection[]).map((s) => {
            if ((s.type as string) === 'experience') {
              return { ...s, type: 'work-experience' as SectionType, title: 'Work Experience', content: s.content || getDefaultContent('work-experience') };
            }
            return { ...s, content: s.content || getDefaultContent(s.type) };
          });

          setSections(mappedSections);
        } else {
          setSections(DEFAULT_SECTIONS);
        }
      } catch {
        // If API fails, start with defaults
        setProfile(DEFAULT_PROFILE);
        setSections(DEFAULT_SECTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Debounced save to API
  const saveToApi = useCallback((profileData: ProfileData, sectionsData: PortfolioSection[]) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await api.put('/portfolio', {
          profile_data: profileData,
          sections_data: sectionsData,
        });
      } catch {
        // Silently fail data is still in local state
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce
  }, []);

  // Cropper state
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [isConfirmingRemoveSelected, setIsConfirmingRemoveSelected] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Persist to API with debounce
  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      saveToApi(next, sections);
      
      if ('avatarUrl' in updates) {
        window.dispatchEvent(new CustomEvent('portfolioAvatarUpdated', { detail: next.avatarUrl }));
      }
      
      return next;
    });
  };

  const updateSections = (newSections: PortfolioSection[]) => {
    setSections(newSections);
    saveToApi(profile, newSections);
  };

  const updateSectionContent = (sectionId: string, content: SectionContent) => {
    const newSections = sections.map((s) =>
      s.id === sectionId ? { ...s, content } : s
    );
    updateSections(newSections);
  };

  // Section actions
  const toggleSection = (id: string) => {
    updateSections(sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const removeSection = (id: string) => {
    updateSections(sections.filter((s) => s.id !== id));
    setSelectedSectionIds((prev) => prev.filter((x) => x !== id));
  };

  const addSection = (type: SectionType) => {
    const meta = SECTION_META[type];
    const newSection: PortfolioSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: meta.label,
      visible: true,
      content: getDefaultContent(type),
    };
    updateSections([...sections, newSection]);
  };

  const addAllSections = () => {
    const orderedTypes: SectionType[] = [
      'about',
      'skills',
      'work-experience',
      'projects',
      'education',
      'org-experience',
      'certifications',
      'contact'
    ];

    const existingTypes = sections.map((s) => s.type);
    const typesToAdd = orderedTypes.filter((t) => !existingTypes.includes(t));

    if (typesToAdd.length === 0) return;

    const newSectionsToAdd: PortfolioSection[] = typesToAdd.map((type) => {
      const meta = SECTION_META[type];
      return {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: meta.label,
        visible: true,
        content: getDefaultContent(type),
      };
    });

    const mergedSections = [...sections, ...newSectionsToAdd];
    
    // Sort sections based on standard professional order
    const sortedSections = [...mergedSections].sort((a, b) => {
      const indexA = orderedTypes.indexOf(a.type);
      const indexB = orderedTypes.indexOf(b.type);
      return indexA - indexB;
    });

    updateSections(sortedSections);
    toast('Berhasil', 'Semua section berhasil ditambahkan dengan urutan standar.', 'success');
  };

  const removeSelectedSections = () => {
    const remainingSections = sections.filter((s) => !selectedSectionIds.includes(s.id));
    updateSections(remainingSections);
    setSelectedSectionIds([]);
    setIsConfirmingRemoveSelected(false);
    toast('Berhasil', 'Section terpilih berhasil dihapus.', 'success');
  };

  const handleRemoveSelectedClick = () => {
    if (isConfirmingRemoveSelected) {
      removeSelectedSections();
    } else {
      setIsConfirmingRemoveSelected(true);
      // Auto reset after 3 seconds
      setTimeout(() => {
        setIsConfirmingRemoveSelected(false);
      }, 3000);
    }
  };

  const handleSelectSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedSectionIds.length === sections.length) {
      setSelectedSectionIds([]);
    } else {
      setSelectedSectionIds(sections.map((s) => s.id));
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        toast('Jenis File Tidak Sesuai', 'File yang diupload tidak sesuai dengan jenis file yang sudah ditentukan yaitu JPG atau PNG', 'error');
        // Reset input value
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageToCrop(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be chosen again
      e.target.value = '';
    }
  };

  const handleCropSave = (croppedImage: string) => {
    updateProfile({ avatarUrl: croppedImage });
    setImageToCrop(null);
    toast('Berhasil', 'Foto profil berhasil diperbarui.', 'success');
  };

  // CV upload handler
  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedExtensions = ['pdf', 'doc', 'docx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        toast('Jenis File Tidak Sesuai', 'File yang di upload tidak sesuai dengan jenis file yang sudah ditentukan yaitu DOC atau PDF', 'error');
        // Reset input value
        e.target.value = '';
        return;
      }

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast('Ukuran File Terlalu Besar', 'Ukuran file yang di upload melebihi batasan maksimum yaitu 2MB', 'error');
        // Reset input value so the same file can be selected again if needed
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        updateProfile({
          cvFileName: file.name,
          cvFileUrl: ev.target?.result as string,
        });
        toast('Berhasil', 'CV berhasil diunggah.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">{t('dashboard.loadingPortfolio')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* ── Editor Side ── */}
      <div className="space-y-6 overflow-auto pr-2 custom-scrollbar">

        {/* Profile Information */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              {t('builder.editor.profileInfo')}
            </h3>
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-4">

            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative group shrink-0 transition-all duration-300",
                  profile.avatarUrl
                    ? "bg-transparent border border-slate-200 dark:border-slate-800"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600"
                )}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7 text-white" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('builder.editor.profilePhoto')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t('builder.editor.clickToUpload')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.avatarUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeletePhotoModal(true);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {profile.avatarUrl && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>

            {/* Full Name */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>
                  <User className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  {t('builder.editor.fullName')}
                </span>
                {profile.fullName && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                placeholder="e.g. Muhammad Rifqi"
                className={cn(
                  inputClass,
                  profile.fullName && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5 focus:ring-emerald-500"
                )}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>
                  <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  {t('builder.editor.bio')}
                </span>
                {profile.bio && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                placeholder="Fullstack Developer with a passion for building modern web apps..."
                className={cn(
                  inputClass, 
                  "min-h-[100px] resize-none",
                  profile.bio && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5 focus:ring-emerald-500"
                )}
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>
                  <MapPin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  {t('builder.editor.location')}
                </span>
                {profile.location && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => updateProfile({ location: e.target.value })}
                placeholder="e.g. Jakarta, Indonesia"
                className={cn(
                  inputClass,
                  profile.location && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5 focus:ring-emerald-500"
                )}
              />
            </div>

            {/* Gender Dropdown */}
            <GenderInput
              value={profile.gender || ''}
              onChange={(gender) => updateProfile({ gender })}
            />

            {/* CV Upload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  {t('builder.editor.uploadCv')} <span className="text-[10px] font-normal text-slate-400 ml-1">{t('builder.editor.cvFormat')}</span>
                </label>
                {profile.cvFileName && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPreviewingCv(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline transition-colors"
                      title={t('builder.editor.preview')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t('builder.editor.preview')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProfile({ cvFileName: '', cvFileUrl: '' });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-colors"
                      title={t('builder.editor.remove')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('builder.editor.remove')}
                    </button>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </div>
              <div
                onClick={() => cvInputRef.current?.click()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                  profile.cvFileName
                    ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500"
                )}
              >
                <Upload className={cn("w-5 h-5", profile.cvFileName ? "text-emerald-500" : "text-slate-400")} />
                <span className={cn("text-sm", profile.cvFileName ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500")}>
                  {profile.cvFileName || 'Click to upload PDF or DOC'}
                </span>
              </div>
              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" />
            </div>
          </div>
        </section>

        {/* Sections Manager */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-1.5 shrink-0">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">{t('builder.editor.sections')}</span>
              <span className="sm:hidden">Bagian</span>
            </h3>
            <div className="flex items-center gap-2 sm:gap-3">
              {selectedSectionIds.length > 0 && (
                <button
                  onClick={handleRemoveSelectedClick}
                  className={cn(
                    "text-[11px] sm:text-xs font-bold transition-all px-2 sm:px-3 py-1.5 rounded-xl flex items-center gap-1 sm:gap-1.5 shrink-0",
                    isConfirmingRemoveSelected
                      ? "text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10"
                      : "text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  {isConfirmingRemoveSelected ? (
                    <><span className="hidden sm:inline">{t('builder.editor.confirmRemove')}</span><span className="sm:hidden">{t('builder.editor.sure')}</span> {`(${selectedSectionIds.length})?`}</>
                  ) : (
                    <><span className="hidden sm:inline">{t('builder.editor.removeSelected')}</span><span className="sm:hidden">{t('builder.editor.remove')}</span> {`(${selectedSectionIds.length})`}</>
                  )}
                </button>
              )}
              <AddSectionDropdown
                existingSections={sections.map((s) => s.type)}
                onAdd={addSection}
                onAddAll={addAllSections}
              />
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No sections yet</p>
              <p className="text-xs mt-1">Click "+ Add Section" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <button
                  onClick={handleSelectAllToggle}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                      sections.length > 0 && selectedSectionIds.length === sections.length
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    )}
                  >
                    {sections.length > 0 && selectedSectionIds.length === sections.length && (
                      <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                    )}
                  </div>
                  {t('builder.editor.selectAll')} ({sections.length})
                </button>

                {selectedSectionIds.length > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-lg">
                    {selectedSectionIds.length} {t('builder.editor.selected')}
                  </span>
                )}
              </div>

              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={updateSections}
                className="space-y-2"
              >
                {sections.map((section) => (
                  <SectionItem
                    key={section.id}
                    section={section}
                    onToggle={toggleSection}
                    onRemove={removeSection}
                    isSelected={selectedSectionIds.includes(section.id)}
                    onSelect={handleSelectSection}
                    isExpanded={expandedSectionId === section.id}
                    onExpandToggle={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                    onContentUpdate={(content) => updateSectionContent(section.id, content)}
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5" />
            {t('builder.editor.dragToReorder')}
          </p>
        </section>
      </div>

      {/* ── Preview Side ── */}
      <div className="hidden lg:block relative">
        <LivePreview profile={profile} sections={sections} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg">
          Live Preview
        </div>
      </div>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <ImageCropperModal
            image={imageToCrop}
            onCropComplete={handleCropSave}
            onCancel={() => setImageToCrop(null)}
          />
        )}
      </AnimatePresence>

      {/* CV Preview Modal */}
      <AnimatePresence>
        {isPreviewingCv && profile.cvFileUrl && (
          <CvPreviewModal
            fileName={profile.cvFileName}
            fileUrl={profile.cvFileUrl}
            onClose={() => setIsPreviewingCv(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Photo Confirmation Modal */}
      <AnimatePresence>
        {showDeletePhotoModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeletePhotoModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('builder.editor.deletePhotoTitle', 'Hapus Foto Profil?')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm">
                  {t('builder.editor.deletePhotoMessage', 'Apakah Anda yakin ingin menghapus foto profil ini?')}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeletePhotoModal(false)}
                    className="rounded-2xl py-3 border-2"
                  >
                    {t('builder.editor.cancel', 'Batal')}
                  </Button>
                  <button
                    onClick={() => {
                      updateProfile({ avatarUrl: '' });
                      setShowDeletePhotoModal(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  >
                    {t('builder.editor.delete', 'Hapus')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
