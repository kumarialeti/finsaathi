import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';

const faqs = [
  {
    question: "How do I upload a bank statement?",
    answer: "Go to the Transactions page and click the 'Upload Statement' button. You can upload PDF bank statements or Excel exports. Our AI will automatically extract and categorize the transactions."
  },
  {
    question: "How does FinSaathi calculate spending?",
    answer: "FinSaathi aggregates all debit transactions from your uploaded statements and categorizes them using AI. It excludes internal transfers and focuses only on actual expenses."
  },
  {
    question: "How does AI use my financial data?",
    answer: "The AI only accesses the transaction and document data you have explicitly uploaded. It uses this data locally in an isolated session to answer your specific questions in the Chat interface."
  },
  {
    question: "How can I delete my financial data?",
    answer: "You can delete your entire account and all associated data from the Profile Settings page. You can also delete individual documents from the Transactions page."
  },
  {
    question: "Are my API credentials protected?",
    answer: "Yes, API keys like Groq are stored securely on the backend server environment variables. They are never exposed to the frontend browser."
  }
];

export default function SupportSettings() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<string | null>(null);

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
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Help & Support</h2>
        <div className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
          Find answers to common questions or reach out to our team.
        </div>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
          <h3 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </h3>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4">
              <button 
                onClick={() => toggleFaq(index)}
                className="flex w-full justify-between items-center text-left focus:outline-none"
              >
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="mt-3 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed pr-8">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
          <h3 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Mail className="w-4 h-4" /> Contact Support
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
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">How can we help?</label>
              <textarea 
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm resize-none"
                placeholder="Describe your issue or question..."
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors shadow-sm"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Privacy & Data</h3>
        <ul className="list-disc list-inside text-sm text-[hsl(var(--muted-foreground))] space-y-2">
          <li>Financial data belongs solely to you.</li>
          <li>Users cannot access another user's transactions or documents.</li>
          <li>AI responses are grounded exclusively in your own uploaded financial data.</li>
        </ul>
      </div>
    </div>
  );
}
