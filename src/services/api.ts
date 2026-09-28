import { AISpendingSummary, Currency, CurrencyConfig, Transaction, BudgetCategory, Subscription, BankAccount } from '../types/finance';

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  GHS: { symbol: 'GH₵', rate: 15.5, label: 'GHS (GH₵)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
};

export function formatCurrency(amount: number, currency: Currency = 'USD', masked: boolean = false): string {
  if (masked) return '••••••';
  const config = CURRENCY_CONFIGS[currency];
  const converted = amount * config.rate;
  const isNegative = converted < 0;
  const absVal = Math.abs(converted);

  const formattedNum = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${config.symbol}${formattedNum}`;
}

/**
 * Calculates a 100% real, deterministic Financial Cashflow Audit based directly on
 * Ishmael's actual recorded transactions, actual account balances, and real budget caps.
 * Zero AI imagination.
 */
export function calculateRealSpendingSummary(
  transactions: Transaction[],
  budgets: BudgetCategory[],
  subscriptions: Subscription[],
  accounts: BankAccount[],
  userName: string = 'Ishmael Sackey Junior'
): AISpendingSummary {
  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netLiquidity = totalAssets - totalLiabilities;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((netSavings) / totalIncome) * 1000) / 10) : 0;
  const burnRateDaily = Math.round((totalExpense / 28) * 100) / 100;

  // Real category expense aggregation from ledger
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  // Top actual spending categories from real ledger
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topLeaks = sortedCategories.map(([cat, amt]) => {
    const budget = budgets.find((b) => b.category === cat);
    const limit = budget?.monthlyLimit || 0;
    const over = limit > 0 && amt > limit;
    return {
      category: cat,
      amount: amt,
      advice: over
        ? `Exceeded planned limit of $${limit.toFixed(2)} by $${(amt - limit).toFixed(2)}. Consider trimming non-essential charges.`
        : `Consumes ${totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0}% of your real monthly outflows.`,
    };
  });

  // Real deterministic financial health score:
  // Base 60 + liquidity points + positive savings rate points + budget compliance
  let healthScore = 60;
  if (netSavings > 0) healthScore += 15;
  if (savingsRate >= 20) healthScore += 10;
  if (totalLiabilities < totalAssets * 0.2) healthScore += 10;
  healthScore = Math.min(98, Math.max(40, healthScore));

  const actionItems: string[] = [];
  if (subscriptions.length > 0) {
    const subTotal = subscriptions.reduce((s, sub) => s + sub.amount, 0);
    actionItems.push(
      `Your ${subscriptions.length} recurring subscriptions total $${subTotal.toFixed(2)}/mo. Review any services you haven't used this week.`
    );
  }
  if (netSavings > 0) {
    actionItems.push(
      `You have a real net surplus of $${netSavings.toFixed(2)}. Allocate a portion directly into your High-Yield Reserve.`
    );
  } else {
    actionItems.push(
      `Monthly expenses currently exceed income by $${Math.abs(netSavings).toFixed(2)}. Reduce discretionary spending to balance cashflow.`
    );
  }
  actionItems.push(
    `Keep your real bank and MTN MoMo balances updated after ATM withdrawals or cash deposits.`
  );

  return {
    summary: `Real Financial Ledger Audit for ${userName}: You have ${accounts.length} linked accounts totaling $${netLiquidity.toFixed(2)} in net liquidity. This month you recorded $${totalIncome.toFixed(2)} in total income and $${totalExpense.toFixed(2)} in actual expenses, resulting in a real net cashflow of ${netSavings >= 0 ? '+' : ''}$${netSavings.toFixed(2)}.`,
    healthScore,
    savingsRate,
    burnRateDaily,
    topLeaks: topLeaks.length > 0 ? topLeaks : [
      { category: 'No expenses recorded', amount: 0, advice: 'Log your transactions to track outflow leaks.' }
    ],
    actionItems,
    projectedSurplus: Math.round(netSavings * 100) / 100,
    modelUsed: 'real-accounting-ledger',
  };
}

/**
 * Deterministic category detection based on exact merchant keywords.
 */
export function categorizeMerchantReal(merchant: string, amount: number, type: 'expense' | 'income', notes?: string) {
  const lower = (merchant + ' ' + (notes || '')).toLowerCase();
  let category: any = 'Shopping & Lifestyle';

  if (type === 'income' || lower.includes('salary') || lower.includes('payroll') || lower.includes('direct deposit')) {
    category = 'Income & Salary';
  } else if (lower.includes('uber') || lower.includes('bolt') || lower.includes('fuel') || lower.includes('shell') || lower.includes('petrol') || lower.includes('ride') || lower.includes('taxi')) {
    category = 'Transportation';
  } else if (lower.includes('cafe') || lower.includes('restaurant') || lower.includes('food') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('kfc') || lower.includes('burger') || lower.includes('pizza') || lower.includes('bistro')) {
    category = 'Food & Dining';
  } else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('cloud') || lower.includes('aws') || lower.includes('adobe') || lower.includes('apple') || lower.includes('github') || lower.includes('claude') || lower.includes('openai')) {
    category = 'Subscriptions & Tech';
  } else if (lower.includes('market') || lower.includes('grocery') || lower.includes('whole foods') || lower.includes('shoprite') || lower.includes('supermarket')) {
    category = 'Groceries';
  } else if (lower.includes('rent') || lower.includes('landlord') || lower.includes('power') || lower.includes('water') || lower.includes('internet') || lower.includes('utility') || lower.includes('ecg')) {
    category = 'Housing & Utilities';
  } else if (lower.includes('momo') || lower.includes('transfer') || lower.includes('p2p') || lower.includes('kwame') || lower.includes('ama') || lower.includes('kofi')) {
    category = 'Peer-to-Peer & Transfers';
  } else if (lower.includes('gym') || lower.includes('fitness') || lower.includes('pharmacy') || lower.includes('clinic') || lower.includes('health') || lower.includes('hospital')) {
    category = 'Health & Wellness';
  } else if (lower.includes('interest') || lower.includes('dividend') || lower.includes('savings') || lower.includes('stocks')) {
    category = 'Investments & Savings';
  }

  const isRecurring = lower.includes('netflix') || lower.includes('spotify') || lower.includes('aws') || lower.includes('adobe') || lower.includes('rent') || lower.includes('internet') || lower.includes('gym');

  return {
    category,
    confidence: 1.0,
    isRecurring,
    budgetImpactAdvice: `Categorized under ${category} based on your merchant ledger rules.`,
  };
}
