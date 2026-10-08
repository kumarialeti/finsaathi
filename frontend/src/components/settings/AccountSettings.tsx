import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Loader2, Calendar } from 'lucide-react';

export default function AccountSettings() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/settings/accounts');
        setAccounts(res.data);
      } catch (err) {
        console.error('Failed to load accounts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Linked Accounts & Data Sources</h2>
      <div className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
        FinSaathi uses manual statement uploads to ground AI insights. Your connected data sources are listed below.
      </div>
      
      {accounts.length === 0 ? (
        <div className="p-8 text-center border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--muted))/20]">
          <p className="text-[hsl(var(--muted-foreground))]">No financial accounts connected yet.</p>
          <a href="/transactions" className="inline-block mt-4 text-[hsl(var(--primary))] font-medium hover:underline">
            Upload Statement
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map(doc => (
            <div key={doc.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[hsl(var(--foreground))] truncate max-w-xs">{doc.file_name}</h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Statement-based account</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <Calendar className="w-3 h-3" />
                    Last updated: {new Date(doc.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${doc.processing_status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {doc.processing_status === 'COMPLETED' ? 'Active' : 'Processing'}
                </span>
                <a href="/transactions" className="text-xs text-[hsl(var(--primary))] hover:underline mt-2">
                  View Transactions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
