import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Send, Bot, Loader2 } from 'lucide-react';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Documents() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Upload your bank statements and ask me any questions about your transactions.' }
  ]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/import/statement', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!input.trim() || asking) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAsking(true);

    try {
      const docContext = documents.length > 0 
        ? `[SYSTEM NOTE: User has uploaded these documents: ${documents.map(d => `ID: ${d.id}, Name: ${d.file_name}`).join(' | ')}. Use get_document_content tool with the ID to query their actual text data.]\n\n`
        : '';
        
      const res = await api.post('/chat', { message: docContext + userMessage.content, language: localStorage.getItem('finsaathi_lang') || 'en' });
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: res.data.reply || res.data.data?.reply || 'Sorry, I could not generate a response.'  
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Sorry, I encountered an error answering your question.' 
      }]);
    } finally {
      setAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <h1 className="text-2xl font-bold text-foreground">Financial Documents</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Left column: Documents List */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
          <label className="mb-6 cursor-pointer bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? 'Uploading...' : 'Upload PDF / Excel'}
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileUpload}
              ref={fileInputRef}
              disabled={uploading}
            />
          </label>

          <h3 className="font-semibold text-sm mb-3">Uploaded files:</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No documents uploaded yet.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate" title={doc.file_name}>{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Chat UI */}
        <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h2 className="font-semibold">Ask about your financial data</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                }`}>
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-secondary rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="How much did I spend last month?"
                className="flex-1 bg-secondary border-none rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={asking}
              />
              <button
                onClick={handleAsk}
                disabled={!input.trim() || asking}
                className="bg-primary text-primary-foreground p-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
