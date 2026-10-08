import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../utils/api';
import { Bot, CheckCircle2, ShieldCheck, TrendingUp, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('auth.register_error', 'Failed to create account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Language Selector Overlay */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full shadow-sm">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <select 
          className="bg-transparent text-sm text-foreground border-none focus:ring-0 outline-none cursor-pointer"
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="te">తెలుగు</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>

      {/* Left side - Brand/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute w-[800px] h-[800px] rounded-full border-[100px] border-white/20 -top-[400px] -right-[400px]" />
          <div className="absolute w-[600px] h-[600px] rounded-full border-[80px] border-white/20 -bottom-[300px] -left-[300px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FinSaathi</span>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-lg leading-tight" dangerouslySetInnerHTML={{ __html: t('auth.brand_register_title').replace(', ', ', <br/>') }}>
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md mb-12">
            {t('auth.brand_register_subtitle')}
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('auth.bank_security')}</h3>
                <p className="text-primary-foreground/70 text-sm">{t('auth.bank_security_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('auth.smart_analytics')}</h3>
                <p className="text-primary-foreground/70 text-sm">{t('auth.smart_analytics_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('auth.automated_budgeting')}</h3>
                <p className="text-primary-foreground/70 text-sm">{t('auth.automated_budgeting_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          {t('auth.copyright', '© {{year}} FinSaathi Inc. All rights reserved.', { year: new Date().getFullYear() })}
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6 lg:hidden">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">FinSaathi</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('auth.create_account')}</h2>
            <p className="text-muted-foreground">{t('auth.enter_credentials')}</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.full_name_label')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email_label')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.password_label')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
            >
              {loading ? t('auth.creating_account') : t('auth.sign_up_btn')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.already_have_account')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t('auth.sign_in_btn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
