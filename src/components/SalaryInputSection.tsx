import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Briefcase,
  TrendingUp,
  Edit2,
  Trash2,
  Check,
  Building2,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { IncomeSource, BankAccount, Currency } from '../types/finance';
import { formatCurrency } from '../services/api';

interface SalaryInputSectionProps {
  incomeSources: IncomeSource[];
  accounts: BankAccount[];
  currency: Currency;
  dataMasking: boolean;
  onUpdateIncome: (id: string, updates: Partial<IncomeSource>) => void;
  onAddIncome: (source: Omit<IncomeSource, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

export const SalaryInputSection: React.FC<SalaryInputSectionProps> = ({
  incomeSources,
  accounts,
  currency,
  dataMasking,
  onUpdateIncome,
  onAddIncome,
  onDeleteIncome,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCadence, setFormCadence] = useState<IncomeSource['cadence']>('monthly');
  const [formCategory, setFormCategory] = useState<IncomeSource['category']>('Salary');
  const [formAccountId, setFormAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [formPayday, setFormPayday] = useState('25th of month');

  // Total active income calculation
  const totalMonthlyIncome = incomeSources
    .filter((inc) => inc.active)
    .reduce((sum, inc) => {
      if (inc.cadence === 'weekly') return sum + inc.amount * 4.33;
      if (inc.cadence === 'biweekly') return sum + inc.amount * 2.16;
      if (inc.cadence === 'annual') return sum + inc.amount / 12;
      return sum + inc.amount;
    }, 0);

  const handleStartEdit = (source: IncomeSource) => {
    setEditingId(source.id);
    setEditAmount(source.amount.toString());
  };

  const handleSaveInline = (id: string) => {
    const num = parseFloat(editAmount);
    if (!isNaN(num) && num >= 0) {
      onUpdateIncome(id, { amount: num });
    }
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(formAmount);
    if (!formName || isNaN(num) || num <= 0) return;

    onAddIncome({
      name: formName,
      amount: num,
      cadence: formCadence,
      depositAccountId: formAccountId,
      category: formCategory,
      active: true,
      payday: formPayday,
    });

    setFormName('');
    setFormAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Monthly Salary & Income Sources</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded">
              Verified Inflows
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized monthly salary input and income stream manager for realistic cashflow modeling.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
              Total Monthly Inflow
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              +{formatCurrency(totalMonthlyIncome, currency, dataMasking)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Income Stream</span>
          </button>
        </div>
      </div>

      {/* Income Stream Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {incomeSources.map((source) => {
          const account = accounts.find((a) => a.id === source.depositAccountId);
          const isEditing = editingId === source.id;

          return (
            <div
              key={source.id}
              className={`p-4 rounded-xl bg-slate-850/70 border transition-all flex flex-col justify-between ${
                source.active ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-white truncate max-w-[170px]" title={source.name}>
                    {source.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                    {source.category}
                  </span>
                </div>

                {/* Amount with Inline Edit */}
                {isEditing ? (
                  <div className="flex items-center gap-1.5 my-1">
                    <span className="text-xs font-mono text-emerald-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-28 bg-slate-800 border border-emerald-500/50 rounded-lg px-2 py-1 text-sm font-mono text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveInline(source.id)}
                      className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(source)}
                    className="flex items-center gap-2 cursor-pointer group"
                    title="Click to edit salary figure"
                  >
                    <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                      {formatCurrency(source.amount, currency, dataMasking)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      /{source.cadence === 'monthly' ? 'mo' : source.cadence}
                    </span>
                    <Edit2 className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                )}

                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Deposited to: {account?.name || 'Linked Checking'}
                  {source.payday && ` · Payday: ${source.payday}`}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateIncome(source.id, { active: !source.active })}
                  className={`hover:underline cursor-pointer ${
                    source.active ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {source.active ? 'Active Stream' : 'Paused Stream'}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteIncome(source.id)}
                  className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  title="Remove income stream"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Income Stream Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Monthly Income Source</h3>
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
                  Income Description / Employer
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Consulting, Freelance Retainer"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
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
                    placeholder="3500.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Cadence
                  </label>
                  <select
                    value={formCadence}
                    onChange={(e) => setFormCadence(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Salary">Primary Salary</option>
                    <option value="Freelance">Freelance & Contracts</option>
                    <option value="Investments">Investments / Dividends</option>
                    <option value="Rental">Rental & Real Estate</option>
                    <option value="Other">Other Inflow</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Deposit Account
                  </label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Payday / Schedule Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25th of month, every second Friday"
                  value={formPayday}
                  onChange={(e) => setFormPayday(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
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
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
                >
                  Save Income Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
