import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { Subscription, BankAccount, TransactionCategory, Currency } from '../types/finance';
import { formatCurrency } from '../services/api';

interface SubscriptionsManagerProps {
  subscriptions: Subscription[];
  accounts: BankAccount[];
  currency: Currency;
  dataMasking: boolean;
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const SubscriptionsManager: React.FC<SubscriptionsManagerProps> = ({
  subscriptions,
  accounts,
  currency,
  dataMasking,
  onAddSubscription,
  onDeleteSubscription,
  onToggleAlert,
  onToggleStatus,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [negotiationModalSub, setNegotiationModalSub] = useState<Subscription | null>(null);

  // New Subscription Form
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [category, setCategory] = useState<TransactionCategory>('Subscriptions & Tech');
  const [nextBillingDate, setNextBillingDate] = useState('2026-10-15');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-4');

  // Stats
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    return sum + (s.billingCycle === 'annually' ? s.amount / 12 : s.amount);
  }, 0);
  const annualTotal = monthlyTotal * 12;
  const priceHikeCount = subscriptions.filter((s) => s.priceHikeDetected).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name || isNaN(num) || num <= 0) return;

    onAddSubscription({
      name,
      provider: provider || name,
      amount: num,
      billingCycle,
      category,
      nextBillingDate,
      accountId,
      status: 'active',
      alertEnabled: true,
    });

    setName('');
    setProvider('');
    setAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Recurring Subscription Management & Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated recurring audit, renewal warning alerts, and price hike detectors for Ishmael Sackey Junior.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Subscription KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Monthly Recurring Cost</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {formatCurrency(monthlyTotal, currency, dataMasking)}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Annual Projected Runaway</span>
          <span className="text-lg font-bold font-mono text-slate-300 tabular-nums">
            {formatCurrency(annualTotal, currency, dataMasking)}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Active Subscriptions</span>
          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            {activeSubs.length} services
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Price Hike Alerts</span>
          <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
            {priceHikeCount} detected
          </span>
        </div>
      </div>

      {/* Price Hike Warning Banner */}
      {priceHikeCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-950/20 to-slate-900 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-300">
                Price Hike Detected on Adobe Creative Cloud
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Billing increased by $6.00/mo (+12.2%) compared to previous cycle. Use Fin-Buddy’s negotiation template to request student/loyalty retention rates.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNegotiationModalSub(subscriptions.find((s) => s.id === 'sub-1') || null)}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-900/40 border border-amber-700/50 rounded-lg hover:bg-amber-800/40 transition-colors whitespace-nowrap cursor-pointer"
          >
            Negotiate Price →
          </button>
        </div>
      )}

      {/* Subscriptions Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-850/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 pl-6 pr-4 font-semibold">Service / Provider</th>
                <th className="py-3.5 pr-4 font-semibold">Cost & Cadence</th>
                <th className="py-3.5 pr-4 font-semibold">Billing Account</th>
                <th className="py-3.5 pr-4 font-semibold">Next Renewal</th>
                <th className="py-3.5 pr-4 font-semibold">Renewal Alert</th>
                <th className="py-3.5 pr-4 font-semibold">Status</th>
                <th className="py-3.5 pr-6 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subscriptions.map((sub) => {
                const account = accounts.find((a) => a.id === sub.accountId);
                const isPaused = sub.status === 'paused';

                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-850/40 transition-colors ${
                      isPaused ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{sub.name}</span>
                        {sub.priceHikeDetected && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.2 rounded">
                            Price Hike
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{sub.category}</div>
                    </td>

                    <td className="py-3.5 pr-4 font-mono font-semibold tabular-nums text-white">
                      {formatCurrency(sub.amount, currency, dataMasking)}
                      <span className="text-[10px] text-slate-400 font-normal font-sans ml-1">
                        /{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </td>

                    <td className="py-3.5 pr-4 text-slate-300">
                      <div>{account?.institution || 'Bank'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {account?.accountNumber}
                      </div>
                    </td>

                    <td className="py-3.5 pr-4 font-mono text-[11px] text-slate-300">
                      {sub.nextBillingDate}
                    </td>

                    <td className="py-3.5 pr-4">
                      <button
                        type="button"
                        onClick={() => onToggleAlert(sub.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          sub.alertEnabled
                            ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300'
                            : 'bg-slate-850 border-slate-750 text-slate-500'
                        }`}
                        title="Toggle 3-day renewal notification"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>{sub.alertEnabled ? '3d Alert Active' : 'Muted'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 pr-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          sub.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isPaused ? 'Resume subscription' : 'Simulate pause'}
                        >
                          {isPaused ? <PlayCircle className="w-3.5 h-3.5 text-emerald-400" /> : <PauseCircle className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSubscription(sub.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Track Recurring Subscription</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube Premium, GitHub Copilot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="14.99"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Cadence
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.institution} ({acc.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Negotiation Template Modal */}
      {negotiationModalSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Price Negotiation & Retention Draft</span>
              </div>
              <button
                type="button"
                onClick={() => setNegotiationModalSub(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Copy and send this retention email to {negotiationModalSub.name} support to lower your bill back to {formatCurrency(negotiationModalSub.previousAmount || 48.99, currency)}:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-xs font-mono text-slate-200 space-y-2 select-all">
              <p>Subject: Account Review & Subscription Rate for Ishmael Sackey Junior</p>
              <p>Hi {negotiationModalSub.name} Support,</p>
              <p>
                I recently noticed my plan renewed at {formatCurrency(negotiationModalSub.amount, currency)}, up from {formatCurrency(negotiationModalSub.previousAmount || 48.99, currency)}.
              </p>
              <p>
                As a loyal user, I am reviewing my monthly software expenses and would love to stay on this plan if you can match my previous grandfathered rate or apply an annual loyalty discount.
              </p>
              <p>Thank you,<br />Ishmael Sackey Junior</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setNegotiationModalSub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
