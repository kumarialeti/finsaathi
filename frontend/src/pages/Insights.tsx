import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart3,
  Bot
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
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

export default function Insights() {
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, trendRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/monthly-trend')
        ]);
        setSummary(sumRes.data.data);
        setTrend(trendRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch insights data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">{t('insights.loading')}</div>;
  }

  const COLORS = ['hsl(var(--primary))', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const isHealthy = savingsRate >= 20;

  return (
    <div className="space-y-8 max-w-[1200px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('insights.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('insights.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('insights.savings_rate')}</p>
              <h2 className="text-3xl font-bold text-foreground">{savingsRate.toFixed(1)}%</h2>
            </div>
            <div className={`p-2 rounded-lg ${isHealthy ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              {isHealthy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {isHealthy ? t('insights.healthy_saving') : t('insights.reduce_expenses')}
          </p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('insights.top_category')}</p>
              <h2 className="text-3xl font-bold text-foreground capitalize">{summary?.topCategories?.[0]?.name || 'N/A'}</h2>
            </div>
            <div className="p-2 rounded-lg bg-secondary text-primary">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {summary?.topCategories?.[0] ? `${t('insights.highest_spend')} (₹${summary.topCategories[0].amount.toLocaleString()})` : t('insights.no_data')}
          </p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('insights.total_flow')}</p>
              <h2 className="text-3xl font-bold text-foreground">₹{(totalIncome + totalExpense).toLocaleString()}</h2>
            </div>
            <div className="p-2 rounded-lg bg-secondary text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('insights.total_money_moved')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-6">{t('insights.income_vs_expenses')}</h3>
          {trend.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--secondary))', opacity: 0.4}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '6px', border: '1px solid hsl(var(--border))', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  <Bar dataKey="income" name="Income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">{t('insights.no_data')}</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-6">{t('insights.spending_breakdown')}</h3>
          {summary?.topCategories?.length > 0 ? (
            <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="w-full md:w-1/2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.topCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
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
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                {summary.topCategories.map((cat: any, i: number) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">₹{cat.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">{t('insights.no_data')}</div>
          )}
        </div>
      </div>
      
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-1">{t('insights.want_deeper_analysis')}</h4>
            <p className="text-sm text-muted-foreground">{t('insights.chat_with_finsaathi')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
