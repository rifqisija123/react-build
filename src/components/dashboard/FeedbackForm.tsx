import React, { useState } from 'react';
import { MessageSquare, Image as ImageIcon, X, Send } from 'lucide-react';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

export const FeedbackForm = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [category, setCategory] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'suggestion', label: t('dashboard.feedback.categories.suggestion', 'Saran & Ide') },
    { id: 'bug', label: t('dashboard.feedback.categories.bug', 'Laporan Bug / Error') },
    { id: 'criticism', label: t('dashboard.feedback.categories.criticism', 'Kritik') },
    { id: 'other', label: t('dashboard.feedback.categories.other', 'Lainnya') },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter only image files
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => validImageTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      toast(t('dashboard.feedback.imageErrorTitle', 'Error'), t('dashboard.feedback.imageErrorMessage', 'Beberapa file ditolak karena bukan format gambar yang didukung (JPG, PNG, GIF, WEBP)'), 'error');
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Clear input so same file can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('message', message);
      
      images.forEach((image) => {
        formData.append('images[]', image);
      });

      await api.post('/feedback', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast(t('dashboard.feedback.successTitle', 'Sukses'), t('dashboard.feedback.successMessage', 'Terima kasih atas feedback Anda! Laporan telah terkirim.'), 'success');
      
      setMessage('');
      setImages([]);
      setImagePreviews([]);
      setCategory('suggestion');
    } catch (error) {
      console.error(error);
      toast(t('dashboard.feedback.submitErrorTitle', 'Gagal'), t('dashboard.feedback.submitErrorMessage', 'Terjadi kesalahan saat mengirim feedback. Silakan coba lagi.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          {t('dashboard.feedback.title', 'Kirim Feedback')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t('dashboard.feedback.subtitle', 'Bantu kami menjadi lebih baik dengan memberikan saran, kritik, atau melaporkan bug pada aplikasi ini.')}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Selection */}
          <div className="space-y-3">
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('dashboard.feedback.categoryLabel', 'Kategori Feedback')}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-200 transition-colors cursor-pointer appearance-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message Textarea */}
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('dashboard.feedback.messageLabel', 'Pesan Detail')}
            </label>
            <textarea
              id="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('dashboard.feedback.messagePlaceholder', 'Ceritakan secara detail mengenai feedback yang ingin Anda sampaikan...')}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-200 resize-y transition-colors"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('dashboard.feedback.imageLabel', 'Lampiran Gambar (Opsional)')}
            </label>
            <div className="mt-1">
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative inline-block group">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-200 dark:border-slate-700 object-cover bg-slate-50 dark:bg-slate-800" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors shadow-sm opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 focus:outline-none">
                <span className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                    <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <span className="font-medium text-sm text-slate-600 dark:text-slate-400 text-center">
                    {t('dashboard.feedback.imagePlaceholder', 'Klik untuk unggah gambar atau screenshot')}
                  </span>
                </span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5">
              <Send className="w-4 h-4" />
              {isSubmitting ? t('dashboard.feedback.submitting', 'Mengirim...') : t('dashboard.feedback.submitBtn', 'Kirim Feedback')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
