import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState({
    transaction_alerts: true,
    budget_alerts: true,
    goal_reminders: true,
    subscription_reminders: true,
    ai_insights: true,
    security_alerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/notifications');
        if (res.data) {
          setPrefs({
            transaction_alerts: res.data.transaction_alerts ?? true,
            budget_alerts: res.data.budget_alerts ?? true,
            goal_reminders: res.data.goal_reminders ?? true,
            subscription_reminders: res.data.subscription_reminders ?? true,
            ai_insights: res.data.ai_insights ?? true,
            security_alerts: res.data.security_alerts ?? true
          });
        }
      } catch (err) {
        console.error('Failed to load notification preferences', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await api.put('/settings/notifications', prefs);
      setStatus({ type: 'success', message: t('settings.notifications.save_success', 'Preferences updated successfully.') });
    } catch (err) {
      setStatus({ type: 'error', message: t('settings.notifications.save_error', 'Failed to update preferences.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      type="button" 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 ${checked ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))/30]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">{t('settings.notifications.title')}</h2>
      
      {status && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <div className="space-y-6 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifications.transaction_alerts')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('settings.notifications.transaction_alerts_desc')}</p>
          </div>
          <Switch checked={prefs.transaction_alerts} onChange={() => handleToggle('transaction_alerts')} />
        </div>
        
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifications.budget_alerts')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('settings.notifications.budget_alerts_desc')}</p>
          </div>
          <Switch checked={prefs.budget_alerts} onChange={() => handleToggle('budget_alerts')} />
        </div>

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifications.goal_reminders')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('settings.notifications.goal_reminders_desc')}</p>
          </div>
          <Switch checked={prefs.goal_reminders} onChange={() => handleToggle('goal_reminders')} />
        </div>

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifications.subscription_reminders')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('settings.notifications.subscription_reminders_desc')}</p>
          </div>
          <Switch checked={prefs.subscription_reminders} onChange={() => handleToggle('subscription_reminders')} />
        </div>

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifications.ai_insights')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('settings.notifications.ai_insights_desc')}</p>
          </div>
          <Switch checked={prefs.ai_insights} onChange={() => handleToggle('ai_insights')} />
        </div>

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifications.security_alerts')}</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('settings.notifications.security_alerts_desc')}</p>
          </div>
          <Switch checked={prefs.security_alerts} onChange={() => handleToggle('security_alerts')} />
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm font-medium shadow-sm hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {saving ? t('settings.notifications.saving') : t('settings.notifications.save')}
        </button>
      </div>
    </div>
  );
}

