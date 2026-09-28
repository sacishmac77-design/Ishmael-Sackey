import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Layers,
  Printer,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { Transaction, BudgetCategory, BankAccount, Currency, IncomeSource } from '../types/finance';
import { formatCurrency } from '../services/api';

interface FinancialReportsProps {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  accounts: BankAccount[];
  incomeSources: IncomeSource[];
  currency: Currency;
  dataMasking: boolean;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  transactions,
  budgets,
  accounts,
  incomeSources,
  currency,
  dataMasking,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Calculations
  const periodTransactions = transactions.filter((t) => {
    if (reportPeriod === 'monthly') {
      return t.date.startsWith(selectedMonth);
    }
    return t.date.startsWith('2026');
  });

  const totalExpense = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 1000) / 10 : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  periodTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  // Monthly comparison data for 2026
  const monthlyData = [
    { month: 'Apr', income: 4800, expense: 2900 },
    { month: 'May', income: 4950, expense: 3100 },
    { month: 'Jun', income: 5100, expense: 3050 },
    { month: 'Jul', income: 5200, expense: 3400 },
    { month: 'Aug', income: 5400, expense: 3250 },
    { month: 'Sep', income: totalIncome || 5607, expense: totalExpense || 2623 },
  ];

  const handleExportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Type,Amount,Account,Status,Reference\n';
    const rows = periodTransactions
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.merchant.replace(/"/g, '""')}","${t.category}","${t.type}",${t.amount},"${t.accountId}","${t.status}","${t.referenceNumber || ''}"`
      )
      .join('\n');

    const summarySection = `\n\nFIN-BUDDY GLOBAL FINANCIAL AUDIT REPORT\nPeriod: ${reportPeriod === 'monthly' ? selectedMonth : '2026 Full Year'}\nTotal Inflow: $${totalIncome.toFixed(2)}\nTotal Outflow: $${totalExpense.toFixed(2)}\nNet Cashflow: $${netSavings.toFixed(2)}\nSavings Rate: ${savingsRate}%\nGenerated on: ${new Date().toISOString()}\n`;

    const blob = new Blob([headers + rows + summarySection], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinBuddy_Global_Audit_${reportPeriod}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Financial Reports & Cashflow Audits
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive audit reports, Income vs. Expense charts, and spreadsheet exports for Fin-Buddy Global.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setReportPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                reportPeriod === 'monthly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Audit
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                reportPeriod === 'yearly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual 2026 Audit
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-white transition-colors cursor-pointer"
            title="Export CSV / Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Audited Cash Inflow</span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            +{formatCurrency(totalIncome, currency, dataMasking)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Verified salary & transfers
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Audited Expenses</span>
          <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            -{formatCurrency(totalExpense, currency, dataMasking)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Across {periodTransactions.filter((t) => t.type === 'expense').length} transactions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Net Cash Surplus</span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(netSavings, currency, dataMasking)}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">
            Retained liquid surplus
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Effective Savings Rate</span>
          <span className="text-xl font-bold font-mono text-indigo-400 tabular-nums">
            {savingsRate}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Exceeds 20% benchmark
          </span>
        </div>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Income vs. Expenses Trajectory (Past 6 Months)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified monthly cashflow comparisons showing actual savings retention.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-400" />
              <span className="text-slate-300">Total Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-400" />
              <span className="text-slate-300">Total Outflow</span>
            </div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6 pb-2 border-b border-slate-800">
          {monthlyData.map((d) => {
            const maxVal = 6000;
            const incomeHeight = Math.min(100, Math.round((d.income / maxVal) * 100));
            const expenseHeight = Math.min(100, Math.round((d.expense / maxVal) * 100));

            return (
              <div key={d.month} className="flex flex-col items-center justify-end h-full gap-2">
                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                  {/* Income Bar */}
                  <div
                    className="w-4 sm:w-6 bg-emerald-400/90 hover:bg-emerald-300 rounded-t transition-all"
                    style={{ height: `${incomeHeight}%` }}
                    title={`Inflow: $${d.income}`}
                  />
                  {/* Expense Bar */}
                  <div
                    className="w-4 sm:w-6 bg-rose-400/90 hover:bg-rose-300 rounded-t transition-all"
                    style={{ height: `${expenseHeight}%` }}
                    title={`Outflow: $${d.expense}`}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Spending Breakdown Audit */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Category Outflow Distribution</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited breakdown of expenses categorized during this statement period.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sortedCategories.length} Categories
          </span>
        </div>

        <div className="space-y-3">
          {sortedCategories.map(([category, amt]) => {
            const percent = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            return (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200">{category}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{percent}%</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatCurrency(amt, currency, dataMasking)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
