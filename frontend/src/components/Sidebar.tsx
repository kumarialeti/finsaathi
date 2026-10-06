import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListOrdered,
  Target,
  LineChart,
  Bot,
  User,
  Settings,
  LogOut,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  const mainNavItems = [
    { name: t('sidebar.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.transactions'), path: '/transactions', icon: ListOrdered },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: t('sidebar.budgets'), path: '/budgets', icon: Target },
    { name: t('sidebar.insights'), path: '/insights', icon: LineChart },
  ];

  const intelNavItems = [
    { name: t('sidebar.ask_finsaathi'), path: '/ask', icon: Bot },
  ];

  const accountNavItems = [
    { name: t('sidebar.settings'), path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderNavSection = (title: string, items: typeof mainNavItems) => (
    <div className="mb-6">
      <h3 className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </h3>
      <div className="space-y-0.5 px-2">
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-6 pb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">F</span>
          FinSaathi
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Your money, made clear.</p>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {renderNavSection('Main', mainNavItems)}
        {renderNavSection('Intelligence', intelNavItems)}
        {renderNavSection('Account', accountNavItems)}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
              {getInitials(user?.name || 'User')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
}
