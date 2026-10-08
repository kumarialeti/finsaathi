import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SupportSettings() {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<string | null>(null);

  const faqs = t('settings.support.faqs', { returnObjects: true }) as { q: string, a: string }[];

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportStatus("Support requests are currently processed manually. Please email support@finsaathi.com.");
    setSupportMessage("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">{t('settings.support.title')}</h2>
        <div className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
          {t('settings.support.desc')}
        </div>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
          <h3 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> {t('settings.support.faq_title')}
          </h3>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4">
              <button 
                onClick={() => toggleFaq(index)}
                className="flex w-full justify-between items-center text-left focus:outline-none"
              >
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{faq.q}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="mt-3 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed pr-8">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
          <h3 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Mail className="w-4 h-4" /> {t('settings.support.contact_title')}
          </h3>
        </div>
        <div className="p-6">
          {supportStatus && (
            <div className="p-4 mb-4 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">
              {supportStatus}
            </div>
          )}
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.support.how_can_we_help')}</label>
              <textarea 
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm resize-none"
                placeholder={t('settings.support.placeholder')}
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors shadow-sm"
              >
                {t('settings.support.send')}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">{t('settings.support.privacy_title')}</h3>
        <ul className="list-disc list-inside text-sm text-[hsl(var(--muted-foreground))] space-y-2">
          <li>{t('settings.support.privacy_1')}</li>
          <li>{t('settings.support.privacy_2')}</li>
          <li>{t('settings.support.privacy_3')}</li>
        </ul>
      </div>
    </div>
  );
}
