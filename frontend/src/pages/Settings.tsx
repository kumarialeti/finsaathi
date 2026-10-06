import React, { useState } from 'react';
import { User, Bell, Shield, Wallet, CreditCard, HelpCircle, LogOut, Upload } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-64 bg-[hsl(var(--muted))/30] border-r border-[hsl(var(--border))] p-4 flex flex-col gap-1">
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
        
        <div className="flex-1 p-8">
          {activeTab === 'profile' && (
            <>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-2xl font-bold text-[hsl(var(--primary-foreground))] shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm">
                      Change Avatar
                    </button>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
                  <button className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg text-sm font-medium border border-[hsl(var(--border))] shadow-sm hover:bg-[hsl(var(--muted))] transition-colors">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm font-medium shadow-sm hover:bg-opacity-90 transition-colors">
                    Save Changes
                  </button>
                </div>
                
                <div className="pt-8 border-t border-[hsl(var(--border))]">
                  <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Disconnect from your session or permanently delete your account.</p>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'accounts' && (
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Linked Accounts</h2>
              <div className="text-[hsl(var(--muted-foreground))] text-sm">
                Connect your bank accounts securely using Plaid or upload statements manually in the Transactions page.
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Notification Preferences</h2>
              <div className="text-[hsl(var(--muted-foreground))] text-sm">
                Choose what updates you want to receive.
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Security Settings</h2>
              <div className="text-[hsl(var(--muted-foreground))] text-sm">
                Update your password and enable two-factor authentication.
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Help & Support</h2>
              <div className="text-[hsl(var(--muted-foreground))] text-sm">
                Contact us if you need help with FinSaathi.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
