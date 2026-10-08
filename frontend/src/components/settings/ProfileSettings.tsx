import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProfileSettings() {
  const { t, i18n } = useTranslation();
  const { user, setUser, logout } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    language: user?.language || 'en'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/settings/profile');
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          language: res.data.language || 'en'
        });
        setUser({ ...user, ...res.data });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.put('/settings/profile', formData);
      setUser({ ...user, ...res.data });
      // Update i18n language if changed
      if (formData.language !== i18n.language) {
        i18n.changeLanguage(formData.language);
      }
      setStatus({ type: 'success', message: t('settings.profile_info.save_success', 'Your changes have been saved.') });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.error || t('settings.profile_info.save_error', 'Failed to update profile.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">{t('settings.profile_info.title')}</h2>
      
      {status && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.profile_info.full_name')}</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-sm transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.profile_info.email')}</label>
          <input 
            type="email" 
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.profile_info.phone')}</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-sm transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.profile_info.language')}</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-sm transition-all"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm font-medium shadow-sm hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? t('settings.profile_info.saving') : t('settings.profile_info.save')}
        </button>
      </div>
      
      <div className="pt-8 border-t border-[hsl(var(--border))]">
        <h3 className="text-red-500 font-bold mb-2">{t('settings.profile_info.danger_zone')}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{t('settings.profile_info.danger_desc')}</p>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> {t('settings.profile_info.sign_out')}
        </button>
      </div>
    </div>
  );
}
