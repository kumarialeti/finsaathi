import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Upload,
  Plus,
  X
} from 'lucide-react';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { t } = useTranslation();
  
  // Add Transaction State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data.data?.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        amount: Number(amount),
        transaction_type: type,
        category,
        description,
        date: new Date().toISOString()
      });
      setShowAddModal(false);
      fetchTransactions();
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error('Failed to add transaction', err);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.transaction_type === filterType;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  return (
    <div className="space-y-8 max-w-[1200px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('transactions.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            className="hidden"
            id="csv-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append('file', file);
              try {
                setLoading(true);
                const res = await api.post('/import/statement', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                const { imported, failed, errors } = res.data.data;
                let msg = `Successfully imported ${imported} transactions.\n`;
                if (failed > 0) {
                  msg += `Failed to import ${failed} rows.\n`;
                  if (errors && errors.length > 0) {
                    msg += `Reason: ${errors[0].error || 'Invalid format'}`;
                  }
                }
                alert(msg);
                fetchTransactions();
              } catch (err: any) {
                console.error('Failed to import file', err);
                const msg = err.response?.data?.error?.message || 'Failed to import file. Ensure it is correctly formatted.';
                alert(msg);
              } finally {
                setLoading(false);
              }
              // Reset input
              e.target.value = '';
            }}
          />
          <label 
            htmlFor="csv-upload"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium border border-border shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" /> {t('transactions.import_csv', 'Import Statement')}
          </label>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4"/> {t('transactions.add_transaction')}
          </button>
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">{t('transactions.new_transaction')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setType('EXPENSE')} className={`py-2 rounded-md font-medium text-sm border transition-colors ${type === 'EXPENSE' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'}`}>{t('transactions.expense')}</button>
                <button type="button" onClick={() => setType('INCOME')} className={`py-2 rounded-md font-medium text-sm border transition-colors ${type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'}`}>{t('transactions.income')}</button>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t('transactions.amount_label')}</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t('transactions.category_label')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
                  {type === 'EXPENSE' ? (
                    <>
                      <option value="Food">{t('categories.food', 'Food')}</option>
                      <option value="Transport">{t('categories.transport', 'Transport')}</option>
                      <option value="Shopping">{t('categories.shopping', 'Shopping')}</option>
                      <option value="Bills">{t('categories.bills', 'Bills')}</option>
                      <option value="Entertainment">{t('categories.entertainment', 'Entertainment')}</option>
                      <option value="Health">{t('categories.health', 'Health')}</option>
                    </>
                  ) : (
                    <>
                      <option value="Salary">{t('categories.salary', 'Salary')}</option>
                      <option value="Freelance">{t('categories.freelance', 'Freelance')}</option>
                      <option value="Investment">{t('categories.investment', 'Investment')}</option>
                      <option value="Other">{t('categories.other', 'Other')}</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t('transactions.description_label')}</label>
                <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="e.g. Grocery store" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium mt-6 hover:bg-primary/90 transition-colors shadow-sm">{t('transactions.save_transaction')}</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Professional Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-card">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('transactions.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-md border border-border shadow-sm">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded ${filterType === 'ALL' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('transactions.all')}
              </button>
              <button 
                onClick={() => setFilterType('INCOME')}
                className={`px-3 py-1 text-xs font-medium rounded ${filterType === 'INCOME' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('transactions.income')}
              </button>
              <button 
                onClick={() => setFilterType('EXPENSE')}
                className={`px-3 py-1 text-xs font-medium rounded ${filterType === 'EXPENSE' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('transactions.expense')}
              </button>
            </div>
            
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="py-1.5 px-3 border border-border rounded-md bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="ALL">{t('transactions.all_categories')}</option>
              {uniqueCategories.map((c: any) => (
                <option key={c} value={c}>{t(`categories.${c.toLowerCase()}`, c)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground uppercase font-semibold text-xs tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4">{t('dashboard.date')}</th>
                <th className="px-6 py-4">{t('dashboard.description')}</th>
                <th className="px-6 py-4">{t('dashboard.category')}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">{t('transactions.loading')}</td>
                 </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                        <Search className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{t('transactions.no_transactions_yet')}</h3>
                      <p className="text-muted-foreground max-w-sm mb-6">{t('transactions.add_first_transaction')}</p>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> {t('transactions.add_transaction')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {t(`categories.${(tx.category || 'General').toLowerCase()}`, tx.category || 'General')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.transaction_type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                      {tx.transaction_type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
