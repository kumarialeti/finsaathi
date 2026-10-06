import { Bell, User, Globe } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  
  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return { title: t('sidebar.dashboard'), desc: t('dashboard.overview') };
    if (path.includes('transactions')) return { title: t('transactions.title'), desc: t('transactions.subtitle') };
    if (path.includes('budgets')) return { title: t('budgets.title'), desc: t('budgets.subtitle') };
    if (path.includes('insights')) return { title: t('insights.title'), desc: t('insights.subtitle') };
    if (path.includes('ask')) return { title: t('chat.title'), desc: t('chat.subtitle') };
    if (path.includes('settings')) return { title: t('settings.title'), desc: t('settings.subtitle') };
    return { title: 'FinSaathi', desc: 'Intelligence Copilot' };
  };

  const { title, desc } = getPageContext();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="h-20 border-b border-border bg-card px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 mr-2">
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
        <div className="h-8 w-px bg-border"></div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-card"></span>
        </button>
        <Link to="/settings" className="flex items-center gap-3 pl-2 rounded-full hover:bg-secondary p-1 pr-3 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
            {getInitials(user?.name || 'User')}
          </div>
        </Link>
      </div>
    </header>
  );
}
