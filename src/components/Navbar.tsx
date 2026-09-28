import React from 'react';
import { RefreshCw, Plus, Shield, Eye, EyeOff } from 'lucide-react';
import { Currency } from '../types/finance';
import { CURRENCY_CONFIGS } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenNewTransaction: () => void;
  onOpenAISummary: () => void;
  dataMasking: boolean;
  onToggleDataMasking: () => void;
  onLockApp: () => void;
  pinLockEnabled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currency,
  onCurrencyChange,
  onSync,
  isSyncing,
  onOpenNewTransaction,
  onOpenAISummary,
  dataMasking,
  onToggleDataMasking,
  onLockApp,
  pinLockEnabled,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'goals', label: 'Savings Goals' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'momo', label: 'Mobile Money & Split' },
    { id: 'reports', label: 'Reports' },
    { id: 'security', label: 'Security Vault' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Fin-Buddy Global
            </span>
          </button>
          <span className="hidden sm:inline-block text-[11px] text-emerald-400/90 font-medium bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
            Ishmael Sackey Jr.
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-slate-850 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Financial Cashflow Audit Trigger */}
          <button
            type="button"
            onClick={onOpenAISummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
            title="Real Financial Cashflow Audit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Cashflow Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Mask Sensitive Data Toggle */}
          <button
            type="button"
            onClick={onToggleDataMasking}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              dataMasking
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={dataMasking ? 'Reveal numbers' : 'Mask sensitive numbers'}
          >
            {dataMasking ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Sync Trigger */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Sync all connected bank & MoMo accounts"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            {(Object.keys(CURRENCY_CONFIGS) as Currency[]).map((cur) => (
              <option key={cur} value={cur}>
                {CURRENCY_CONFIGS[cur].label}
              </option>
            ))}
          </select>

          {/* Add Transaction Button */}
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* Quick Lock if PIN enabled */}
          {pinLockEnabled && (
            <button
              type="button"
              onClick={onLockApp}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Lock Fin-Buddy"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Avatar */}
          <div
            onClick={() => onSelectTab('security')}
            className="relative cursor-pointer group"
            title="Ishmael Sackey Junior - Fin-Buddy Profile"
          >
            <img
              src="/src/assets/images/avatar_ishmael_sackey_1790583762161.jpg"
              alt="Ishmael Sackey Junior"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-emerald-500/60 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto gap-1 pt-2.5 mt-2 border-t border-slate-800/60 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === item.id
                ? 'text-white bg-slate-800 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
