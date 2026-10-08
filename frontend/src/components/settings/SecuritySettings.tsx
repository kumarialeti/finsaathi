import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, Key, AlertTriangle, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SecuritySettings() {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [securityInfo, setSecurityInfo] = useState<any>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get('/settings/security');
        setSecurityInfo(res.data);
      } catch (err) {
        console.error('Failed to load security info');
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/settings/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">{t('settings.security.title')}</h2>
        
        {status && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4 text-[hsl(var(--foreground))] font-medium">
            <Key className="w-5 h-5" /> {t('settings.security.change_password')}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.security.current_password')}</label>
            <input 
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.security.new_password')}</label>
              <input 
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.security.confirm_password')}</label>
              <input 
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm"
              />
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? t('settings.security.updating') : t('settings.security.update_password')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4 text-[hsl(var(--foreground))] font-medium">
          <Monitor className="w-5 h-5" /> {t('settings.security.active_sessions')}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--muted))/30]">
          <div>
            <h4 className="font-semibold text-sm text-[hsl(var(--foreground))]">{t('settings.security.current_device')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {t('settings.security.current_device_desc')}
            </p>
          </div>
          <button 
            onClick={logout}
            className="mt-4 md:mt-0 px-4 py-2 bg-white border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors shadow-sm"
          >
            {t('settings.security.sign_out_device')}
          </button>
        </div>
      </div>
      
      {securityInfo && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4 text-[hsl(var(--foreground))] font-medium">
            <Shield className="w-5 h-5" /> {t('settings.security.security_status')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 border border-[hsl(var(--border))] rounded-lg">
              <div className="text-[hsl(var(--muted-foreground))]">{t('settings.security.password_last_changed')}</div>
              <div className="font-medium text-[hsl(var(--foreground))] mt-1">
                {new Date(securityInfo.last_password_change).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4 border border-[hsl(var(--border))] rounded-lg">
              <div className="text-[hsl(var(--muted-foreground))]">{t('settings.security.account_created')}</div>
              <div className="font-medium text-[hsl(var(--foreground))] mt-1">
                {new Date(securityInfo.account_created).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
