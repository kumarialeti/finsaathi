import React, { useState, useEffect } from 'react';
import { Target, Plus, AlertTriangle, X } from 'lucide-react';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const { t } = useTranslation();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${currentMonth}&year=${currentYear}`);
      setBudgets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/budgets', {
        category,
        amount: Number(amount),
        month: currentMonth,
        year: currentYear
      });
      setShowModal(false);
      setAmount('');
      fetchBudgets();
    } catch (err) {
      console.error(err);
      alert('Failed to create budget. Maybe one already exists for this category?');
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('budgets.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('budgets.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> {t('budgets.create_budget')}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-border">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">{t('budgets.new_budget')}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t('budgets.category_label')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                  <option>Entertainment</option>
                  <option>General</option>
                  <option>Health</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t('budgets.monthly_limit_label')}</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="0.00" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium mt-6 hover:bg-primary/90 transition-colors shadow-sm">{t('budgets.save_budget')}</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">{t('budgets.loading')}</div>
      ) : budgets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Target className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t('budgets.no_budgets_yet')}</h2>
          <p className="text-muted-foreground max-w-sm mb-8">{t('budgets.create_first_budget')}</p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium shadow-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> {t('budgets.create_budget')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
            const isOver = budget.spent > budget.amount;
            
            return (
              <div key={budget.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{budget.category}</h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1">₹{budget.amount.toLocaleString()} {t('budgets.monthly_limit').toLowerCase()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('budgets.spent')}</p>
                      <p className="text-xl font-bold text-foreground">₹{budget.spent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('budgets.remaining')}</p>
                      <p className={`text-xl font-bold ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                        {isOver ? '-' : ''}₹{Math.abs(budget.amount - budget.spent).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-muted-foreground">{t('budgets.progress')}</span>
                    <span className={`text-xs font-bold ${isOver ? 'text-destructive' : 'text-primary'}`}>
                      {((budget.spent / budget.amount) * 100).toFixed(0)}{t('budgets.used')}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-border">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${isOver ? 'bg-destructive' : 'bg-primary'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
