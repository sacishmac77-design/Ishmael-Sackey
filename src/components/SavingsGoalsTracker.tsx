import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Trash2,
  Edit2,
  Sparkles,
  DollarSign,
  Layers,
  Clock,
  Laptop,
  Home,
  Smartphone,
  Compass,
} from 'lucide-react';
import { SavingsGoal, BankAccount, Currency } from '../types/finance';
import { formatCurrency } from '../services/api';

interface SavingsGoalsTrackerProps {
  goals: SavingsGoal[];
  accounts: BankAccount[];
  currency: Currency;
  dataMasking: boolean;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string, amount: number, sourceAccountId: string) => void;
}

export const SavingsGoalsTracker: React.FC<SavingsGoalsTrackerProps> = ({
  goals,
  accounts,
  currency,
  dataMasking,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSourceId, setDepositSourceId] = useState(accounts[0]?.id || 'acc-1');

  // New Goal Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('0');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState<SavingsGoal['category']>('Emergency');
  const [linkedAccountId, setLinkedAccountId] = useState(accounts[1]?.id || accounts[0]?.id || 'acc-2');
  const [color, setColor] = useState('#10b981');
  const [autoDepositEnabled, setAutoDepositEnabled] = useState(true);
  const [autoDepositAmount, setAutoDepositAmount] = useState('250');
  const [autoDepositFrequency, setAutoDepositFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [notes, setNotes] = useState('');

  // Overall Statistics
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const totalMonthlyCommitment = goals
    .filter((g) => g.autoDepositEnabled && g.autoDepositAmount)
    .reduce((sum, g) => {
      const amt = g.autoDepositAmount || 0;
      if (g.autoDepositFrequency === 'weekly') return sum + amt * 4.33;
      if (g.autoDepositFrequency === 'biweekly') return sum + amt * 2.16;
      return sum + amt;
    }, 0);

  const calculateDaysRemaining = (targetDateStr: string) => {
    const today = new Date('2026-09-28');
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateMonthlyPaceNeeded = (goal: SavingsGoal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const days = calculateDaysRemaining(goal.targetDate);
    const months = Math.max(0.5, days / 30.4);
    return Math.round((remaining / months) * 100) / 100;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Emergency':
        return <ShieldCheck className="w-4 h-4" />;
      case 'Real Estate':
        return <Home className="w-4 h-4" />;
      case 'Tech & Equipment':
        return <Laptop className="w-4 h-4" />;
      case 'Travel':
        return <Compass className="w-4 h-4" />;
      case 'Personal':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const initNum = parseFloat(initialSaved) || 0;
    if (!title || isNaN(targetNum) || targetNum <= 0) return;

    onAddGoal({
      title,
      targetAmount: targetNum,
      currentAmount: initNum,
      targetDate,
      category,
      linkedAccountId,
      color,
      autoDepositEnabled,
      autoDepositAmount: autoDepositEnabled ? parseFloat(autoDepositAmount) || 0 : undefined,
      autoDepositFrequency: autoDepositEnabled ? autoDepositFrequency : undefined,
      notes,
    });

    // Reset Form
    setTitle('');
    setTargetAmount('');
    setInitialSaved('0');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleQuickDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;

    onDepositToGoal(depositModalGoal.id, num, depositSourceId);

    // If goal reaches or passes 100%, trigger celebratory confetti
    if (depositModalGoal.currentAmount + num >= depositModalGoal.targetAmount) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b'],
        });
      } catch (err) {
        // fallback
      }
    }

    setDepositModalGoal(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Savings Goal Tracker & Milestones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Set target deadlines, calculate required monthly savings pace, and monitor real-time progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Total Capital Saved</span>
          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(totalSaved, currency, dataMasking)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Across {goals.length} active goals
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Target Capital Goal</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {formatCurrency(totalTarget, currency, dataMasking)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {formatCurrency(totalTarget - totalSaved, currency, dataMasking)} to completion
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Aggregate Completion</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {totalProgress}%
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Monthly Auto-Savings</span>
          <span className="text-lg font-bold font-mono text-indigo-400 tabular-nums">
            {formatCurrency(totalMonthlyCommitment, currency, dataMasking)}/mo
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">
            Automated direct allocations
          </span>
        </div>
      </div>

      {/* Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysLeft = calculateDaysRemaining(goal.targetDate);
          const monthlyPace = calculateMonthlyPaceNeeded(goal);
          const linkedAccount = accounts.find((a) => a.id === goal.linkedAccountId);
          const isComplete = percent >= 100;

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: `${goal.color}25`, color: goal.color }}
                    >
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{goal.title}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{goal.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">Target: {goal.targetDate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isComplete
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : percent >= 75
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isComplete ? 'Goal Funded!' : `${daysLeft} days left`}
                  </span>
                </div>

                {/* Progress Numbers */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-baseline justify-between text-xs">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono text-white tabular-nums">
                        {formatCurrency(goal.currentAmount, currency, dataMasking)}
                      </span>
                      <span className="text-slate-400 font-mono text-xs">
                        / {formatCurrency(goal.targetAmount, currency, dataMasking)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                </div>

                {/* Required Pace & Auto-Deposit Info */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-850/80 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Required Monthly Pace</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {isComplete ? 'Goal Cleared' : `${formatCurrency(monthlyPace, currency)} / mo`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Auto-Deposit Rule</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {goal.autoDepositEnabled && goal.autoDepositAmount
                        ? `${formatCurrency(goal.autoDepositAmount, currency)} (${goal.autoDepositFrequency})`
                        : 'Manual Deposits'}
                    </span>
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-2.5 leading-relaxed">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  Vault: {linkedAccount?.name || 'Linked Account'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDepositModalGoal(goal);
                      setDepositAmount('100');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Deposit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Savings Goal</h3>
                  <p className="text-[11px] text-slate-400">
                    Track capital targets and time-bounded milestone funding for Ishmael
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

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Goal Name / Objective
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accra Land Title Escrow, Emergency Fund, Tokyo Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Initial Balance Saved ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialSaved}
                    onChange={(e) => setInitialSaved(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Target Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Emergency">Emergency Reserve</option>
                    <option value="Real Estate">Real Estate & Property</option>
                    <option value="Tech & Equipment">Tech & Hardware</option>
                    <option value="Travel">Travel & Vacation</option>
                    <option value="Investments">Investments</option>
                    <option value="Vehicle">Vehicle & Auto</option>
                    <option value="Personal">Personal & Rainy Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Linked Holding Account
                  </label>
                  <select
                    value={linkedAccountId}
                    onChange={(e) => setLinkedAccountId(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#10b981', '#6366f1', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto Deposit Rule */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span className="font-semibold">Enable Automated Scheduled Savings</span>
                  <input
                    type="checkbox"
                    checked={autoDepositEnabled}
                    onChange={(e) => setAutoDepositEnabled(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                  />
                </label>

                {autoDepositEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-750">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Auto-Save Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={autoDepositAmount}
                        onChange={(e) => setAutoDepositAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Frequency</label>
                      <select
                        value={autoDepositFrequency}
                        onChange={(e) => setAutoDepositFrequency(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every 2 Weeks</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notes / Financial Purpose
                </label>
                <input
                  type="text"
                  placeholder="Optional motivation note"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
                >
                  Create Savings Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Deposit to Goal</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {depositModalGoal.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalGoal(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Deposit Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="100.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Transfer From Source
                </label>
                <select
                  value={depositSourceId}
                  onChange={(e) => setDepositSourceId(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} · Balance: {formatCurrency(acc.balance, currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>New Goal Balance:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatCurrency(
                    depositModalGoal.currentAmount + (parseFloat(depositAmount) || 0),
                    currency
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
