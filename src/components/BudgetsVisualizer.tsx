import React, { useState } from 'react';
import {
  Sliders,
  AlertCircle,
  TrendingDown,
  Sparkles,
  PieChart,
  Home,
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  ArrowRightLeft,
  HeartPulse,
} from 'lucide-react';
import { BudgetCategory, Transaction, Currency } from '../types/finance';
import { formatCurrency } from '../services/api';

interface BudgetsVisualizerProps {
  budgets: BudgetCategory[];
  transactions: Transaction[];
  currency: Currency;
  dataMasking: boolean;
  onUpdateBudget: (id: string, newLimit: number) => void;
  onAutoBalance503020: () => void;
}

export const BudgetsVisualizer: React.FC<BudgetsVisualizerProps> = ({
  budgets,
  transactions,
  currency,
  dataMasking,
  onUpdateBudget,
  onAutoBalance503020,
}) => {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<{ [id: string]: number }>(
    () => Object.fromEntries(budgets.map((b) => [b.id, b.monthlyLimit]))
  );

  // Aggregate stats
  const totalLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const remainingTotal = totalLimit - totalSpent;

  // Day of month calculations for September (30 days total)
  const currentDay = 28;
  const daysInMonth = 30;
  const monthProgressPercent = Math.round((currentDay / daysInMonth) * 100);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Housing & Utilities':
        return <Home className="w-4 h-4" />;
      case 'Food & Dining':
        return <Utensils className="w-4 h-4" />;
      case 'Groceries':
        return <ShoppingCart className="w-4 h-4" />;
      case 'Transportation':
        return <Car className="w-4 h-4" />;
      case 'Shopping & Lifestyle':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Peer-to-Peer & Transfers':
        return <ArrowRightLeft className="w-4 h-4" />;
      case 'Health & Wellness':
        return <HeartPulse className="w-4 h-4" />;
      default:
        return <PieChart className="w-4 h-4" />;
    }
  };

  const handleSaveBudgetAdjustments = () => {
    Object.entries(editingBudgets).forEach(([id, limit]) => {
      onUpdateBudget(id, Math.max(10, limit));
    });
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Monthly Budget Visualizations & Pace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time category spending limits, burn rate trajectory, and automated safety buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAutoBalance503020}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/40 transition-colors cursor-pointer"
            title="Automatically rebalance budgets using the 50/30/20 financial rule"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apply 50/30/20 Rule</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBudgets(Object.fromEntries(budgets.map((b) => [b.id, b.monthlyLimit])));
              setIsAdjustModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Limits</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Monthly Outflow vs Total Cap</span>
              <span className="font-mono text-white tabular-nums font-semibold">
                {formatCurrency(totalSpent, currency, dataMasking)} / {formatCurrency(totalLimit, currency, dataMasking)}
              </span>
            </div>

            <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercent > 100
                    ? 'bg-rose-500'
                    : overallPercent > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, overallPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Day {currentDay} of 30 ({monthProgressPercent}% of cycle elapsed)</span>
              <span className="font-mono font-medium text-emerald-400">
                {formatCurrency(remainingTotal, currency, dataMasking)} Remaining
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Budget Burn Status</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              On Pace (+{formatCurrency(remainingTotal / 2, currency)} safe)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Recommended Daily Burn</span>
            <span className="text-lg font-bold font-mono text-white">
              {formatCurrency(remainingTotal / (daysInMonth - currentDay), currency)} / day
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Chart: Actual Cumulative Spend vs Target Pace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              September Spending Pace vs Target Ceiling
            </h2>
            <p className="text-xs text-slate-400">
              Visual curve tracking daily expenses against maximum recommended monthly burn.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full" />
              <span className="text-slate-300">Actual Outflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-500" />
              <span className="text-slate-400">Linear Target Cap</span>
            </div>
          </div>
        </div>

        {/* SVG Trajectory Chart */}
        <div className="h-44 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
            {/* Grid Lines */}
            <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="600" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

            {/* Linear Ceiling Line */}
            <line
              x1="20"
              y1="140"
              x2="580"
              y2="20"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Actual Spend Area and Curve */}
            <path
              d="M 20 140 Q 140 125, 260 95 T 440 60 T 540 45 L 540 150 L 20 150 Z"
              fill="url(#emerald-gradient)"
              opacity="0.25"
            />
            <path
              d="M 20 140 Q 140 125, 260 95 T 440 60 T 540 45"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Today's Point Marker */}
            <circle cx="540" cy="45" r="5" fill="#10b981" stroke="#022c22" strokeWidth="2" />
            <text x="490" y="30" fill="#34d399" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              Day 28: {formatCurrency(totalSpent, currency, dataMasking)}
            </text>

            {/* Gradients */}
            <defs>
              <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800">
          <span>Sep 01 (Cycle Start)</span>
          <span>Sep 10</span>
          <span>Sep 20</span>
          <span>Sep 28 (Today)</span>
          <span>Sep 30 (Month Close)</span>
        </div>
      </div>

      {/* Visual Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgets.map((b) => {
          const percent = Math.round((b.spent / b.monthlyLimit) * 100);
          const remaining = b.monthlyLimit - b.spent;
          const isOver = percent > 100;
          const isWarning = percent >= 80 && !isOver;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
                isOver
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: `${b.color}25`, color: b.color }}
                  >
                    {getCategoryIcon(b.category)}
                  </div>
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {b.category}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isOver
                      ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      : isWarning
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  }`}
                >
                  {isOver ? 'Exceeded' : isWarning ? 'Caution' : 'Safe'}
                </span>
              </div>

              {/* Amount Figures */}
              <div className="space-y-1 mb-3">
                <div className="text-lg font-bold font-mono text-white tabular-nums">
                  {formatCurrency(b.spent, currency, dataMasking)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Limit: {formatCurrency(b.monthlyLimit, currency, dataMasking)}</span>
                  <span className="font-mono font-semibold">{percent}%</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, percent)}%`,
                    backgroundColor: isOver ? '#f43f5e' : isWarning ? '#f59e0b' : b.color,
                  }}
                />
              </div>

              {/* Remaining Cushion */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Remaining</span>
                <span
                  className={`font-mono font-semibold ${
                    remaining < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {remaining < 0 ? '-' : ''}
                  {formatCurrency(Math.abs(remaining), currency, dataMasking)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Budget Limits Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Adjust Category Monthly Limits</h3>
                <p className="text-[11px] text-slate-400">
                  Configure monthly spending caps for Ishmael Sackey Junior
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {budgets.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {b.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Current spend: {formatCurrency(b.spent, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-400">$</span>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={editingBudgets[b.id] ?? b.monthlyLimit}
                      onChange={(e) =>
                        setEditingBudgets((prev) => ({
                          ...prev,
                          [b.id]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-24 bg-slate-800 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBudgetAdjustments}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
