import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Bot,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuthStore } from '../store/useAuthStore';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.good_morning');
    if (hour < 18) return t('dashboard.good_afternoon');
    return t('dashboard.good_evening');
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, sumRes, trendRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/analytics/summary'),
          api.get('/analytics/monthly-trend')
        ]);
        setTransactions(txRes.data.data?.transactions || []);
        setSummary(sumRes.data.data);
        setTrend(trendRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">{t('dashboard.loading')}</div>;
  }

  const COLORS = ['hsl(var(--primary))', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  const balance = summary?.balance || 0;
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const totalSavings = totalIncome - totalExpense;

  const topCategory = summary?.topCategories?.[0];
  const insightText = topCategory 
    ? t('dashboard.highest_expense', { amount: topCategory.amount.toLocaleString(), category: topCategory.name })
    : t('dashboard.add_more_transactions');

  return (
    <div className="space-y-10 max-w-[1200px]">
      
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{greeting}, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-muted-foreground mt-2">{t('dashboard.overview')}</p>
      </section>

      {/* Primary Financial Summary */}
      <section className="bg-card border border-border p-8 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-2">{t('dashboard.total_balance')}</p>
            <h2 className="text-5xl font-bold tracking-tight text-foreground">₹{balance.toLocaleString()}</h2>
            <div className="flex items-center gap-2 mt-3 text-sm font-medium">
              <span className={balance >= 0 ? 'text-primary' : 'text-destructive'}>
                {balance >= 0 ? '+' : ''}₹{(trend[trend.length - 1]?.income || 0) - (trend[trend.length - 1]?.expense || 0)} {t('dashboard.this_month')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-8 md:gap-12 pt-4 md:pt-0 border-t md:border-t-0 border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">{t('dashboard.income')}</p>
              <p className="text-xl font-semibold text-foreground">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">{t('dashboard.expenses')}</p>
              <p className="text-xl font-semibold text-foreground">₹{totalExpense.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">{t('dashboard.savings')}</p>
              <p className="text-xl font-semibold text-foreground">₹{totalSavings.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {transactions.length === 0 ? (
        <section className="bg-card border border-border rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t('dashboard.no_transactions_yet')}</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">{t('dashboard.dashboard_starts')}</p>
          <button 
            onClick={() => navigate('/transactions')}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t('dashboard.add_transaction')}
          </button>
        </section>
      ) : (
        <>
          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart - Spending Overview */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-foreground mb-6">{t('dashboard.spending_overview')}</h3>
              {trend.length > 0 ? (
                <div className="h-[280px] w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '6px', border: '1px solid hsl(var(--border))', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                      />
                      <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Not enough data to show trend.</div>
              )}
            </div>

            {/* Pie Chart - Category Breakdown */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-foreground mb-6">{t('dashboard.where_money_goes')}</h3>
              {summary?.topCategories?.length > 0 ? (
                <>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.topCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="amount"
                          stroke="none"
                        >
                          {summary.topCategories.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '6px', border: '1px solid hsl(var(--border))', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    {summary.topCategories.slice(0, 3).map((cat: any, i: number) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">₹{cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.no_category_data')}</div>
              )}
            </div>

          </section>

          {/* FinSaathi Insight Block */}
          <section className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t('dashboard.finsaathi_insight')}</h4>
                <p className="text-sm font-medium text-foreground">{insightText}</p>
              </div>
            </div>
            {topCategory && (
              <button 
                onClick={() => navigate('/ask')}
                className="shrink-0 bg-card border border-border text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
              >
                {t('dashboard.ask_finsaathi_why')}
              </button>
            )}
          </section>

          {/* Transactions List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{t('dashboard.recent_transactions')}</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/transactions')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {t('dashboard.view_all')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">{t('dashboard.date')}</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">{t('dashboard.description')}</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">{t('dashboard.category')}</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">{t('dashboard.amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                           {tx.description}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                            {tx.category}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${tx.transaction_type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                          {tx.transaction_type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
