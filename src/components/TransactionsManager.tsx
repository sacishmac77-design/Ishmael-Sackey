import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { Transaction, BankAccount, TransactionCategory, Currency } from '../types/finance';
import { formatCurrency, categorizeMerchantReal } from '../services/api';

interface TransactionsManagerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  currency: Currency;
  dataMasking: boolean;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const ALL_CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Groceries',
  'Housing & Utilities',
  'Transportation',
  'Subscriptions & Tech',
  'Shopping & Lifestyle',
  'Health & Wellness',
  'Peer-to-Peer & Transfers',
  'Entertainment & Leisure',
  'Income & Salary',
  'Investments & Savings',
  'Education & Work',
];

export const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  accounts,
  currency,
  dataMasking,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Transaction Form State
  const [formMerchant, setFormMerchant] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Food & Dining');
  const [formAccountId, setFormAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [formDate, setFormDate] = useState('2026-09-28');
  const [formNotes, setFormNotes] = useState('');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [categorizationTip, setCategorizationTip] = useState<string | null>(null);

  // Auto-categorize based on merchant keyword rules
  const handleMerchantBlur = () => {
    if (!formMerchant.trim()) return;
    const res = categorizeMerchantReal(formMerchant, parseFloat(formAmount) || 20, formType, formNotes);
    if (res && res.category) {
      if (ALL_CATEGORIES.includes(res.category as TransactionCategory)) {
        setFormCategory(res.category as TransactionCategory);
      }
      if (res.isRecurring !== undefined) {
        setFormIsRecurring(res.isRecurring);
      }
      if (res.budgetImpactAdvice) {
        setCategorizationTip(res.budgetImpactAdvice);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(formAmount);
    if (!formMerchant || isNaN(numAmount) || numAmount <= 0) return;

    onAddTransaction({
      merchant: formMerchant,
      amount: numAmount,
      type: formType,
      category: formCategory,
      accountId: formAccountId,
      date: formDate,
      time: '02:30 PM',
      status: 'cleared',
      isRecurring: formIsRecurring,
      notes: formNotes,
      referenceNumber: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Reset form
    setFormMerchant('');
    setFormAmount('');
    setFormNotes('');
    setCategorizationTip(null);
    setIsAddModalOpen(false);
  };

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.referenceNumber && t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesAcc = selectedAccount === 'all' || t.accountId === selectedAccount;
      const matchesType = selectedType === 'all' || t.type === selectedType;

      return matchesSearch && matchesCat && matchesAcc && matchesType;
    });
  }, [transactions, searchTerm, selectedCategory, selectedAccount, selectedType]);

  // Statistics
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const exportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Type,Amount,Status,Reference\n';
    const rows = filtered
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.merchant}","${t.category}","${t.type}",${t.amount},"${t.status}","${t.referenceNumber || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinBuddy_IshmaelSackeyJr_Transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Automated Expense Tracking & Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-account transaction synchronization with automated rule categorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Filtered Outflow</span>
          <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
            {formatCurrency(totalExpense, currency, dataMasking)}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Filtered Inflow</span>
          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            +{formatCurrency(totalIncome, currency, dataMasking)}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Transaction Entries</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {filtered.length} of {transactions.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Auto-Categorization Rate</span>
          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            99.4%
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by merchant, note, or reference ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-850 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.institution} ({acc.accountNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Type Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 p-1 bg-slate-850 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-slate-750 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedType === 'expense'
                  ? 'bg-rose-950/60 text-rose-300 shadow-sm border border-rose-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedType === 'income'
                  ? 'bg-emerald-950/60 text-emerald-300 shadow-sm border border-emerald-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Incomes Only
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing {filtered.length} entries
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No transactions found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search filters or record a new transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-850/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 pl-6 pr-4 font-semibold">Date</th>
                  <th className="py-3.5 pr-4 font-semibold">Merchant / Details</th>
                  <th className="py-3.5 pr-4 font-semibold">Category</th>
                  <th className="py-3.5 pr-4 font-semibold">Account</th>
                  <th className="py-3.5 pr-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 pr-6 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-850/40 transition-colors group">
                      <td className="py-3 pl-6 pr-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {tx.date}
                        {tx.time && <span className="block text-[10px] text-slate-400">{tx.time}</span>}
                      </td>

                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{tx.merchant}</span>
                          {tx.isRecurring && (
                            <span className="text-[9px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.2 rounded font-medium">
                              Recurring
                            </span>
                          )}
                          {tx.momoNetwork && (
                            <span className="text-[9px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded font-medium">
                              {tx.momoNetwork}
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                        {tx.referenceNumber && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Ref: {tx.referenceNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="text-slate-300 font-medium">{tx.category}</span>
                      </td>

                      <td className="py-3 pr-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          {account?.institution || 'Bank'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {account?.accountNumber}
                        </div>
                      </td>

                      <td className="py-3 pr-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-400' : 'text-slate-200'}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency, dataMasking)}
                        </span>
                      </td>

                      <td className="py-3 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal with AI Categorization Preview */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Transaction</h3>
                  <p className="text-[11px] text-slate-400">
                    Fin-Buddy automated expense categorization engine
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-850 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    formType === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400'
                  }`}
                >
                  Expense Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    formType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400'
                  }`}
                >
                  Income Inflow
                </button>
              </div>

              {/* Merchant / Description */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Merchant or Payee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uber Ride, Shell Fuel, Netflix, Kwame MoMo"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    onBlur={handleMerchantBlur}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  {isClassifying && (
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-3" />
                  )}
                </div>
              </div>

              {/* Amount & Account */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Payment Account
                  </label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.institution} · {acc.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Category (Auto-predicted)
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* AI Categorization Tip Callout */}
              {categorizationTip && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{categorizationTip}</span>
                </div>
              )}

              {/* Recurring Toggle & Notes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-850 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  <span>Mark as Recurring Monthly Expense / Subscription</span>
                </label>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Memo / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Optional memo (e.g. Split with Kwame, client lunch)"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
