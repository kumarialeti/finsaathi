import React, { useState } from 'react';
import { User, Bell, Shield, Wallet, HelpCircle } from 'lucide-react';
import ProfileSettings from '../components/settings/ProfileSettings';
import AccountSettings from '../components/settings/AccountSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import SupportSettings from '../components/settings/SupportSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-64 bg-[hsl(var(--muted))/30] border-r border-[hsl(var(--border))] p-4 flex flex-col gap-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
            <User className="w-4 h-4" /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'accounts' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
            <Wallet className="w-4 h-4" /> Accounts
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'notifications' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'security' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
            <Shield className="w-4 h-4" /> Security
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors mt-auto ${activeTab === 'support' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
            <HelpCircle className="w-4 h-4" /> Help & Support
          </button>
        </div>
        
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'accounts' && <AccountSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'support' && <SupportSettings />}
        </div>
      </div>
    </div>
  );
}
