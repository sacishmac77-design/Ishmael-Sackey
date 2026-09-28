import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { AISpendingSummary, Currency } from '../types/finance';
import { formatCurrency } from '../services/api';

interface AISpendingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: AISpendingSummary | null;
  isLoading: boolean;
  onRegenerate: () => void;
  currency: Currency;
  userName?: string;
}

export const AISpendingSummaryModal: React.FC<AISpendingSummaryModalProps> = ({
  isOpen,
  onClose,
  summaryData,
  isLoading,
  onRegenerate,
  currency,
  userName = 'Ishmael Sackey Junior',
}) => {
  if (!isOpen) return null;

  const [completedActions, setCompletedActions] = useState<{ [idx: number]: boolean }>({});

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Real Financial Cashflow Audit
                </h2>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Live Account Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact mathematical breakdown computed directly from your accounts and recorded transactions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <div className="text-sm font-semibold text-white">
              Aggregating Real Ledger Transactions...
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Calculating cashflow velocity, verified balances, and budget variances.
            </p>
          </div>
        ) : summaryData ? (
          <div className="space-y-6">
            {/* Core Score & Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Financial Health Score */}
              <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] text-slate-400 block mb-1">Financial Health Rating</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                  {summaryData.healthScore}/100
                </div>
                <span className="text-[10px] text-emerald-400/90 font-medium mt-1">
                  Based on debt-to-liquid ratio
                </span>
              </div>

              {/* Savings Rate */}
              <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] text-slate-400 block mb-1">Real Savings Rate</span>
                <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
                  {summaryData.savingsRate}%
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  (Income − Outflow) / Income
                </span>
              </div>

              {/* Daily Burn Rate */}
              <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] text-slate-400 block mb-1">Real Daily Spend Pace</span>
                <div className="text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
                  {formatCurrency(summaryData.burnRateDaily, currency)}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Actual average daily debit
                </span>
              </div>
            </div>

            {/* Executive Summary Prose */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-slate-200 leading-relaxed">
              <span className="font-bold text-emerald-400 block mb-1 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>Account Audit Findings</span>
              </span>
              {summaryData.summary}
            </div>

            {/* Top Detected Leaks */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Top Outflow Categories from Your Real Ledger</span>
              </h3>
              <div className="space-y-2.5">
                {summaryData.topLeaks.map((leak, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{leak.category}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{leak.advice}</div>
                    </div>
                    <div className="font-mono font-bold text-amber-400 tabular-nums shrink-0">
                      {formatCurrency(leak.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items Checklist */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Concrete Next Steps for Your Accounts</span>
              </h3>
              <div className="space-y-2">
                {summaryData.actionItems.map((action, idx) => {
                  const isDone = !!completedActions[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleAction(idx)}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-3 transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-slate-400 line-through'
                          : 'bg-slate-850/80 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="flex-1 leading-relaxed">{action}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projected Surplus Footer */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Actual Net Monthly Surplus</span>
              <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                +{formatCurrency(summaryData.projectedSurplus, currency)}
              </span>
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">
            Calculated directly from your verified ledger · Ishmael Sackey Junior
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Recalculate Math</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
