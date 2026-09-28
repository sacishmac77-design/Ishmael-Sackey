export type Currency = 'USD' | 'GHS' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  symbol: string;
  rate: number; // relative to USD (USD=1, GHS=15.5, EUR=0.92, GBP=0.78)
  label: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'momo';

export interface BankAccount {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  accountNumber: string; // masked, e.g. "•••• 8492"
  balance: number; // in base currency USD
  currency: Currency;
  color: string;
  lastSynced: string;
  status: 'connected' | 'syncing' | 'error';
  network?: 'MTN' | 'Telecel' | 'AirtelTigo' | 'M-Pesa'; // for MoMo
  phoneNumber?: string; // for MoMo
}

export type TransactionCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Housing & Utilities'
  | 'Transportation'
  | 'Subscriptions & Tech'
  | 'Shopping & Lifestyle'
  | 'Health & Wellness'
  | 'Peer-to-Peer & Transfers'
  | 'Entertainment & Leisure'
  | 'Income & Salary'
  | 'Investments & Savings'
  | 'Education & Work';

export interface Transaction {
  id: string;
  accountId: string;
  merchant: string;
  category: TransactionCategory;
  amount: number; // positive = expense, negative or type income = income
  type: 'expense' | 'income';
  date: string; // ISO format YYYY-MM-DD
  time?: string;
  status: 'cleared' | 'pending';
  isRecurring?: boolean;
  notes?: string;
  tags?: string[];
  referenceNumber?: string;
  momoNetwork?: string;
  encrypted?: boolean;
}

export interface BudgetCategory {
  id: string;
  category: TransactionCategory;
  monthlyLimit: number;
  spent: number;
  color: string;
  iconName: string;
}

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  amount: number;
  billingCycle: 'monthly' | 'annually' | 'weekly';
  category: TransactionCategory;
  nextBillingDate: string;
  accountId: string;
  status: 'active' | 'paused' | 'cancelled';
  priceHikeDetected?: boolean;
  previousAmount?: number;
  alertEnabled: boolean;
  website?: string;
}

export interface SplitParticipant {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  shareAmount: number;
  status: 'settled' | 'pending';
  paidAt?: string;
  network: 'MTN' | 'Telecel' | 'AirtelTigo' | 'M-Pesa';
}

export interface BillSplit {
  id: string;
  title: string;
  totalAmount: number;
  category: TransactionCategory;
  createdAt: string;
  dueDate: string;
  splitType: 'equal' | 'custom' | 'installment';
  participants: SplitParticipant[];
  payerId: string; // Ishmael
  notes?: string;
  status: 'open' | 'completed';
  installmentPlan?: {
    totalInstallments: number;
    intervalWeeks: number;
    installmentAmount: number;
    installmentsPaid: number;
    nextDueDate: string;
    autoDebitMoMo: boolean;
  };
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: 'Emergency' | 'Real Estate' | 'Tech & Equipment' | 'Travel' | 'Investments' | 'Vehicle' | 'Personal';
  linkedAccountId: string;
  color: string;
  iconName?: string;
  autoDepositEnabled: boolean;
  autoDepositAmount?: number;
  autoDepositFrequency?: 'weekly' | 'biweekly' | 'monthly';
  createdAt: string;
  notes?: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number; // monthly equivalent in base USD
  cadence: 'monthly' | 'biweekly' | 'weekly' | 'annual';
  depositAccountId: string;
  category: 'Salary' | 'Freelance' | 'Investments' | 'Rental' | 'Other';
  active: boolean;
  payday?: string;
}

export interface MomoTransferRequest {
  recipientName: string;
  recipientPhone: string;
  network: 'MTN' | 'Telecel' | 'AirtelTigo' | 'M-Pesa';
  amount: number;
  reference: string;
  sourceAccountId: string;
}

export interface SecuritySettings {
  pinLockEnabled: boolean;
  pinCode: string; // 4-digit PIN
  biometricEnabled: boolean;
  autoLockMinutes: number;
  dataMasking: boolean; // masks balances and account numbers
  endToEndEncrypted: boolean;
  lastSecurityAudit: string;
}

export interface AISpendingSummary {
  summary: string;
  healthScore: number;
  savingsRate: number;
  burnRateDaily: number;
  topLeaks: {
    category: string;
    amount: number;
    advice: string;
  }[];
  actionItems: string[];
  projectedSurplus: number;
  modelUsed?: string;
}
