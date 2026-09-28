import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Share2,
  Clock,
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Home,
  Laptop,
  Compass,
  Edit2,
  Globe,
} from 'lucide-react';
import {
  BankAccount,
  Transaction,
  BudgetCategory,
  Subscription,
  Currency,
  BillSplit,
  SavingsGoal,
  IncomeSource,
} from '../types/finance';
import { formatCurrency } from '../services/api';
import { SalaryInputSection } from './SalaryInputSection';

interface DashboardOverviewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  budgets: BudgetCategory[];
  subscriptions: Subscription[];
  bills: BillSplit[];
  goals: SavingsGoal[];
  incomeSources: IncomeSource[];
  currency: Currency;
  dataMasking: boolean;
  onNavigate: (tab: string) => void;
  onOpenAudit: () => void;
  onOpenLinkAccount: () => void;
  onEditAccount: (account: BankAccount) => void;
  onOpenMoMoTransfer: () => void;
  onOpenSplitBill: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewGoal?: () => void;
  onQuickDepositGoal?: (goal: SavingsGoal) => void;
  onUpdateIncome: (id: string, updates: Partial<IncomeSource>) => void;
  onAddIncome: (source: Omit<IncomeSource, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  accounts,
  transactions,
  budgets,
  subscriptions,
  bills,
  goals,
  incomeSources,
  currency,
  dataMasking,
  onNavigate,
  onOpenAudit,
  onOpenLinkAccount,
  onEditAccount,
  onOpenMoMoTransfer,
  onOpenSplitBill,
  onOpenNewTransaction,
  onOpenNewGoal,
  onQuickDepositGoal,
  onUpdateIncome,
  onAddIncome,
  onDeleteIncome,
}) => {
  // Real mathematical ground truth calculations
  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  const currentMonth = '2026-09';
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Active verified monthly salary & income inflows
  const totalMonthlyIncome = incomeSources
    .filter((inc) => inc.active)
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalBudgetCap = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetUtilization = totalBudgetCap > 0 ? (monthlyExpenses / totalBudgetCap) * 100 : 0;

  // Savings Goals aggregate
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const aggregateGoalPercent = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0;

  // Active alerts
  const priceHikeSub = subscriptions.find((s) => s.priceHikeDetected);
  const pendingBillParticipants = bills.flatMap((b) =>
    b.participants.filter((p) => p.status === 'pending' && !p.name.includes('You'))
  );

  const calculateDaysRemaining = (targetDateStr: string) => {
    const today = new Date('2026-09-28');
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Global Fin-Buddy badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/avatar_ishmael_sackey_1790583762161.jpg"
            alt="Ishmael Sackey Junior"
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Fin-Buddy Global
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <Globe className="w-3 h-3" /> Universal Financial Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active profile: Ishmael Sackey Junior (0548696717) · Real-time multicurrency accounting & cashflow ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAudit}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-xl hover:bg-emerald-900/60 transition-all cursor-pointer shadow-sm shadow-emerald-950"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Financial Audit</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* SPACE FOR PERSONALIZED SALARY INPUT AT TOP OF DASHBOARD */}
      <SalaryInputSection
        incomeSources={incomeSources}
        accounts={accounts}
        currency={currency}
        dataMasking={dataMasking}
        onUpdateIncome={onUpdateIncome}
        onAddIncome={onAddIncome}
        onDeleteIncome={onDeleteIncome}
      />

      {/* Financial Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Real Total Net Worth</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {formatCurrency(netWorth, currency, dataMasking)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Calculated from linked accounts & cashflow</span>
          </div>
        </div>

        {/* Monthly Inflow / Income */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Monthly Salary & Inflow</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight">
            +{formatCurrency(totalMonthlyIncome, currency, dataMasking)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Across {incomeSources.filter((s) => s.active).length} verified income streams
          </div>
        </div>

        {/* Monthly Outflow / Expenses */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Actual Recorded Expenses</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {formatCurrency(monthlyExpenses, currency, dataMasking)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Budget Cap: {formatCurrency(totalBudgetCap, currency, dataMasking)}</span>
            <span className={`font-semibold ${budgetUtilization > 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {Math.round(budgetUtilization)}% spent
            </span>
          </div>
        </div>

        {/* Mobile Money & Liquid Cash */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>MTN MoMo Real Balance</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums tracking-tight">
            {formatCurrency(
              accounts.find((a) => a.type === 'momo')?.balance || 0,
              currency,
              dataMasking
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{accounts.find((a) => a.type === 'momo')?.phoneNumber || '0548696717'}</span>
            <button
              onClick={onOpenMoMoTransfer}
              className="text-amber-400 hover:underline font-medium cursor-pointer"
            >
              Transfer →
            </button>
          </div>
        </div>
      </div>

      {/* Linked Accounts with Direct "Update Real Balance" Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Linked Accounts & Multi-Currency Balances
            </h2>
            <p className="text-xs text-slate-400">
              Click any card to update its exact real balance whenever your physical account changes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenLinkAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ Link Account</span>
            </button>
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => onEditAccount(acc)}
              className="relative p-4 rounded-xl bg-slate-850/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between cursor-pointer group shadow-sm"
              title="Click to edit real balance"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <span>{acc.name}</span>
                    <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {acc.institution} · {acc.accountNumber}
                  </span>
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: acc.color }}
                  title={acc.type.toUpperCase()}
                />
              </div>

              <div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">
                  {formatCurrency(acc.balance, currency, dataMasking)}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {acc.lastSynced}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Real Balance
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVINGS GOALS DASHBOARD MONITOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Savings Goals Tracker & Target Dates</span>
              </h2>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded">
                {aggregateGoalPercent}% Funded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoring real capital allocated toward your target dates ({formatCurrency(totalGoalSaved, currency, dataMasking)} of {formatCurrency(totalGoalTarget, currency, dataMasking)} saved).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewGoal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Goal</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('goals')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Manage All Goals →
            </button>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const daysLeft = calculateDaysRemaining(goal.targetDate);
            const isFunded = percent >= 100;

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: `${goal.color}25`, color: goal.color }}
                      >
                        {getCategoryIcon(goal.category)}
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {goal.title}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        isFunded
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isFunded ? 'Funded' : `${daysLeft}d left`}
                    </span>
                  </div>

                  <div className="space-y-1 my-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-mono font-bold text-white tabular-nums">
                        {formatCurrency(goal.currentAmount, currency, dataMasking)}
                      </span>
                      <span className="font-mono font-semibold text-emerald-400 text-[11px]">
                        {percent}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Target: {formatCurrency(goal.targetAmount, currency, dataMasking)} by {goal.targetDate}
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: goal.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 text-[10px]">{goal.category}</span>
                  {onQuickDepositGoal && (
                    <button
                      type="button"
                      onClick={() => onQuickDepositGoal(goal)}
                      className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      + Deposit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Alerts & MoMo Bill Splitting Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Optimization Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Financial Cashflow Alerts</span>
              </h3>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                Action Items
              </span>
            </div>

            <div className="space-y-3">
              {priceHikeSub && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs">
                  <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
                    <span>Subscription Rate Change</span>
                    <span>+{formatCurrency(priceHikeSub.amount - (priceHikeSub.previousAmount || 0), currency)}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {priceHikeSub.name} increased this cycle. Review cancellation reminder or switch to annual billing.
                  </p>
                  <button
                    onClick={() => onNavigate('subscriptions')}
                    className="text-amber-400 text-[11px] font-medium mt-2 hover:underline cursor-pointer"
                  >
                    Manage Subscriptions →
                  </button>
                </div>
              )}

              {pendingBillParticipants.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/30 text-xs">
                  <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                    <span>Pending Bill Split Recoveries</span>
                    <span>{pendingBillParticipants.length} Unsettled</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Kwame Mensah has an outstanding MoMo share of {formatCurrency(150, currency)} for the Beach Villa Retreat.
                  </p>
                  <button
                    onClick={() => onNavigate('momo')}
                    className="text-indigo-400 text-[11px] font-medium mt-2 hover:underline cursor-pointer"
                  >
                    Send MoMo USSD Prompt →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Monthly Net Surplus</span>
            <span className="font-mono font-semibold text-emerald-400">
              +{formatCurrency(totalMonthlyIncome - monthlyExpenses, currency, dataMasking)}
            </span>
          </div>
        </div>

        {/* Mobile Money Payment Plan & Bill Splitting Hub */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>MoMo Splits & Payment Plan</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">MTN / Telecel / AirtelTigo</span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Instant peer-to-peer transfers with zero fees, USSD push payment requests, and installment payment plans.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={onOpenMoMoTransfer}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white">Send MoMo</div>
                <div className="text-[10px] text-slate-400">Instant P2P to contacts</div>
              </button>

              <button
                type="button"
                onClick={onOpenSplitBill}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white">Split a Bill</div>
                <div className="text-[10px] text-slate-400">Dinner, rent or travel</div>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-200 font-medium mb-1">
                <span>Studio Monitor Flexi-Plan</span>
                <span className="font-mono text-emerald-400">Part 1 of 3 Paid</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1.5">
                <div className="bg-emerald-400 h-full rounded-full w-1/3" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Next deduction: Oct 08 ({formatCurrency(140, currency)})</span>
                <span className="text-emerald-400 font-medium">0% Interest</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('momo')}
            className="w-full mt-4 text-center text-xs font-medium text-slate-400 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Open Mobile Money Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Monthly Budget Trajectory & Pace */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Monthly Budget Pace</h3>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              September Day 28 of 30 · Spending trajectory is on target for a positive surplus.
            </p>

            <div className="space-y-3">
              {budgets.slice(0, 3).map((b) => {
                const percent = Math.min(100, Math.round((b.spent / b.monthlyLimit) * 100));
                const isWarning = percent >= 80;
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{b.category}</span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        {formatCurrency(b.spent, currency, dataMasking)} / {formatCurrency(b.monthlyLimit, currency, dataMasking)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: isWarning ? '#f59e0b' : b.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Budget Cushion</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatCurrency(totalBudgetCap - monthlyExpenses, currency, dataMasking)} Left
            </span>
          </div>
        </div>
      </div>

      {/* Recent Real Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Recent Transactions Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Real recorded debit and credit movements across your accounts.
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View all {transactions.length}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Merchant / Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Account</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {transactions.slice(0, 6).map((tx) => {
                const account = accounts.find((a) => a.id === tx.accountId);
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{tx.merchant}</span>
                        {tx.isRecurring && (
                          <span className="text-[9px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.2 rounded font-medium">
                            Recurring
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-slate-300 font-medium">{tx.category}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {account ? `${account.institution} (${account.accountNumber})` : 'Linked Account'}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 font-mono text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      <span className={isIncome ? 'text-emerald-400' : 'text-slate-200'}>
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency, dataMasking)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
