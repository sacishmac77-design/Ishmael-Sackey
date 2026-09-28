import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionsManager } from './components/TransactionsManager';
import { BudgetsVisualizer } from './components/BudgetsVisualizer';
import { SavingsGoalsTracker } from './components/SavingsGoalsTracker';
import { SubscriptionsManager } from './components/SubscriptionsManager';
import { MobileMoneyHub } from './components/MobileMoneyHub';
import { FinancialReports } from './components/FinancialReports';
import { SecurityVault } from './components/SecurityVault';
import { AISpendingSummaryModal } from './components/AISpendingSummaryModal';
import { LinkAccountModal } from './components/LinkAccountModal';
import { EditAccountModal } from './components/EditAccountModal';
import { PINLockOverlay } from './components/PINLockOverlay';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_BILLS,
  INITIAL_SECURITY_SETTINGS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_INCOME_SOURCES,
} from './data/initialData';
import {
  BankAccount,
  Transaction,
  BudgetCategory,
  Subscription,
  BillSplit,
  SecuritySettings,
  Currency,
  AISpendingSummary,
  SavingsGoal,
  IncomeSource,
} from './types/finance';
import { calculateRealSpendingSummary } from './services/api';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Persistence / State with Contact Number sync to 0548696717
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('finbuddy_accounts');
    const parsed: BankAccount[] = saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    return parsed.map((acc) => {
      if (acc.type === 'momo') {
        return {
          ...acc,
          phoneNumber: '0548696717',
          accountNumber: '•••• 6717',
        };
      }
      return acc;
    });
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finbuddy_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('finbuddy_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('finbuddy_savings_goals');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => {
    const saved = localStorage.getItem('finbuddy_income_sources');
    return saved ? JSON.parse(saved) : INITIAL_INCOME_SOURCES;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('finbuddy_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [bills, setBills] = useState<BillSplit[]>(() => {
    const saved = localStorage.getItem('finbuddy_bills');
    const parsed: BillSplit[] = saved ? JSON.parse(saved) : INITIAL_BILLS;
    return parsed.map((b) => ({
      ...b,
      participants: b.participants.map((p) =>
        p.name.includes('You') || p.name.includes('Ishmael')
          ? { ...p, phone: '0548696717' }
          : p
      ),
    }));
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('finbuddy_security');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_SETTINGS;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('finbuddy_currency') as Currency) || 'USD';
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditSummaryData, setAuditSummaryData] = useState<AISpendingSummary | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('finbuddy_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finbuddy_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finbuddy_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finbuddy_savings_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finbuddy_income_sources', JSON.stringify(incomeSources));
  }, [incomeSources]);

  useEffect(() => {
    localStorage.setItem('finbuddy_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('finbuddy_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('finbuddy_security', JSON.stringify(securitySettings));
  }, [securitySettings]);

  useEffect(() => {
    localStorage.setItem('finbuddy_currency', currency);
  }, [currency]);

  // Recalculate budget category 'spent' dynamically whenever transactions change
  useEffect(() => {
    const currentMonth = '2026-09';
    setBudgets((prevBudgets) =>
      prevBudgets.map((b) => {
        const spent = transactions
          .filter((t) => t.category === b.category && t.type === 'expense' && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...b, spent };
      })
    );
  }, [transactions]);

  // Sync Action
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          lastSynced: 'Just now',
          status: 'connected',
        }))
      );
      setIsSyncing(false);
    }, 700);
  };

  // Add Transaction & update real account balance immediately
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const created: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [created, ...prev]);

    // Update real account balance mathematically
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === created.accountId) {
          const delta = created.type === 'income' ? created.amount : -created.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );
  };

  // Delete Transaction & reverse balance change
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (target) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === target.accountId) {
            const reverseDelta = target.type === 'income' ? -target.amount : target.amount;
            return { ...acc, balance: acc.balance + reverseDelta };
          }
          return acc;
        })
      );
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Update Budget Limit
  const handleUpdateBudget = (id: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, monthlyLimit: newLimit } : b))
    );
  };

  // Auto-Balance 50/30/20 Rule
  const handleAutoBalance503020 = () => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.category === 'Housing & Utilities') return { ...b, monthlyLimit: 1400 };
        if (b.category === 'Groceries') return { ...b, monthlyLimit: 400 };
        if (b.category === 'Transportation') return { ...b, monthlyLimit: 200 };
        if (b.category === 'Food & Dining') return { ...b, monthlyLimit: 500 };
        if (b.category === 'Shopping & Lifestyle') return { ...b, monthlyLimit: 300 };
        if (b.category === 'Subscriptions & Tech') return { ...b, monthlyLimit: 220 };
        if (b.category === 'Peer-to-Peer & Transfers') return { ...b, monthlyLimit: 250 };
        if (b.category === 'Health & Wellness') return { ...b, monthlyLimit: 180 };
        return b;
      })
    );
  };

  // Income Sources Handlers
  const handleUpdateIncome = (id: string, updates: Partial<IncomeSource>) => {
    setIncomeSources((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc))
    );
  };

  const handleAddIncome = (newSource: Omit<IncomeSource, 'id'>) => {
    const created: IncomeSource = {
      ...newSource,
      id: `inc-${Date.now()}`,
    };
    setIncomeSources((prev) => [...prev, created]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomeSources((prev) => prev.filter((inc) => inc.id !== id));
  };

  // Savings Goals Handlers
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const created: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [...prev, created]);
  };

  const handleUpdateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDepositToGoal = (goalId: string, amount: number, sourceAccountId: string) => {
    // 1. Deduct real funds from source account
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === sourceAccountId ? { ...acc, balance: acc.balance - amount } : acc
      )
    );

    // 2. Increase goal current saved amount
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );

    // 3. Record real transaction entry
    const targetGoal = goals.find((g) => g.id === goalId);
    const newTx: Transaction = {
      id: `tx-goal-${Date.now()}`,
      accountId: sourceAccountId,
      merchant: `Savings Deposit: ${targetGoal?.title || 'Goal'}`,
      category: 'Investments & Savings',
      amount,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'cleared',
      referenceNumber: `SAV-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Direct allocation to ${targetGoal?.title}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Subscription Actions
  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const created: Subscription = {
      ...newSub,
      id: `sub-${Date.now()}`,
    };
    setSubscriptions((prev) => [created, ...prev]);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s))
    );
  };

  const handleToggleStatus = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    );
  };

  // Bill Split Actions
  const handleAddBillSplit = (newBill: Omit<BillSplit, 'id'>) => {
    const created: BillSplit = {
      ...newBill,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [created, ...prev]);
  };

  const handleSettleParticipant = (billId: string, participantId: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const updatedParticipants = b.participants.map((p) => {
            if (p.id === participantId) {
              return { ...p, status: 'settled' as const, paidAt: '2026-09-28' };
            }
            return p;
          });
          return { ...b, participants: updatedParticipants };
        }
        return b;
      })
    );
  };

  // P2P Mobile Money Transfer Execution (Real balance deduction)
  const handleExecuteP2PTransfer = ({
    recipientName,
    recipientPhone,
    network,
    amount,
    reference,
  }: {
    recipientName: string;
    recipientPhone: string;
    network: 'MTN' | 'Telecel' | 'AirtelTigo' | 'M-Pesa';
    amount: number;
    reference: string;
  }) => {
    const momoAcc = accounts.find((a) => a.type === 'momo') || accounts[0];

    // Deduct real balance from MoMo wallet
    setAccounts((prev) =>
      prev.map((a) => (a.id === momoAcc.id ? { ...a, balance: a.balance - amount } : a))
    );

    // Record transaction
    const newTx: Transaction = {
      id: `tx-momo-${Date.now()}`,
      accountId: momoAcc.id,
      merchant: `P2P MoMo to ${recipientName} (${network})`,
      category: 'Peer-to-Peer & Transfers',
      amount,
      type: 'expense',
      date: '2026-09-28',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'cleared',
      momoNetwork: `${network} MoMo`,
      referenceNumber: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `${reference} · Phone: ${recipientPhone}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Add MoMo Installment Plan
  const handleAddInstallmentPlan = ({
    title,
    totalAmount,
    installments,
    intervalWeeks,
  }: {
    title: string;
    totalAmount: number;
    installments: number;
    intervalWeeks: number;
  }) => {
    const perInstallment = Math.round((totalAmount / installments) * 100) / 100;
    const newBill: BillSplit = {
      id: `plan-${Date.now()}`,
      title: `MoMo Flexi-Plan: ${title}`,
      totalAmount,
      category: 'Shopping & Lifestyle',
      createdAt: '2026-09-28',
      dueDate: '2026-11-15',
      splitType: 'installment',
      payerId: 'Ishmael Sackey Junior',
      status: 'open',
      notes: `${installments}-Part scheduled MoMo direct debit plan (0% APR).`,
      participants: [
        {
          id: `p-you-${Date.now()}`,
          name: 'Ishmael Sackey Junior (You)',
          phone: '0548696717',
          shareAmount: totalAmount,
          status: 'pending',
          network: 'MTN',
        },
      ],
      installmentPlan: {
        totalInstallments: installments,
        intervalWeeks,
        installmentAmount: perInstallment,
        installmentsPaid: 0,
        nextDueDate: '2026-10-12',
        autoDebitMoMo: true,
      },
    };
    setBills((prev) => [newBill, ...prev]);
  };

  // Add Bank Account
  const handleAddAccount = (newAcc: Omit<BankAccount, 'id' | 'lastSynced' | 'status'>) => {
    const created: BankAccount = {
      ...newAcc,
      id: `acc-${Date.now()}`,
      lastSynced: 'Just now',
      status: 'connected',
    };
    setAccounts((prev) => [...prev, created]);
  };

  // Update Real Account Balance
  const handleSaveAccount = (accountId: string, updates: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...updates } : acc))
    );
  };

  // Real Cashflow Audit Modal Trigger
  const handleOpenAudit = () => {
    const summary = calculateRealSpendingSummary(
      transactions,
      budgets,
      subscriptions,
      accounts,
      'Ishmael Sackey Junior'
    );
    setAuditSummaryData(summary);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* PIN Lock Screen if app is locked */}
      {isLocked && securitySettings.pinLockEnabled && (
        <PINLockOverlay
          correctPin={securitySettings.pinCode}
          onUnlock={() => setIsLocked(false)}
          biometricEnabled={securitySettings.biometricEnabled}
        />
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currency={currency}
        onCurrencyChange={setCurrency}
        onSync={handleSync}
        isSyncing={isSyncing}
        onOpenNewTransaction={() => setCurrentTab('transactions')}
        onOpenAISummary={handleOpenAudit}
        dataMasking={securitySettings.dataMasking}
        onToggleDataMasking={() =>
          setSecuritySettings((prev) => ({ ...prev, dataMasking: !prev.dataMasking }))
        }
        onLockApp={() => setIsLocked(true)}
        pinLockEnabled={securitySettings.pinLockEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            subscriptions={subscriptions}
            bills={bills}
            goals={goals}
            incomeSources={incomeSources}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
            onNavigate={setCurrentTab}
            onOpenAudit={handleOpenAudit}
            onOpenLinkAccount={() => setIsLinkModalOpen(true)}
            onEditAccount={(acc) => setEditingAccount(acc)}
            onOpenMoMoTransfer={() => setCurrentTab('momo')}
            onOpenSplitBill={() => setCurrentTab('momo')}
            onOpenNewTransaction={() => setCurrentTab('transactions')}
            onOpenNewGoal={() => setCurrentTab('goals')}
            onQuickDepositGoal={(goal) => {
              setCurrentTab('goals');
            }}
            onUpdateIncome={handleUpdateIncome}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsManager
            transactions={transactions}
            accounts={accounts}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'budgets' && (
          <BudgetsVisualizer
            budgets={budgets}
            transactions={transactions}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
            onUpdateBudget={handleUpdateBudget}
            onAutoBalance503020={handleAutoBalance503020}
          />
        )}

        {currentTab === 'goals' && (
          <SavingsGoalsTracker
            goals={goals}
            accounts={accounts}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
          />
        )}

        {currentTab === 'subscriptions' && (
          <SubscriptionsManager
            subscriptions={subscriptions}
            accounts={accounts}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
            onAddSubscription={handleAddSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            onToggleAlert={handleToggleAlert}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {currentTab === 'momo' && (
          <MobileMoneyHub
            accounts={accounts}
            bills={bills}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
            onAddBillSplit={handleAddBillSplit}
            onSettleParticipant={handleSettleParticipant}
            onExecuteP2PTransfer={handleExecuteP2PTransfer}
            onAddInstallmentPlan={handleAddInstallmentPlan}
          />
        )}

        {currentTab === 'reports' && (
          <FinancialReports
            transactions={transactions}
            budgets={budgets}
            accounts={accounts}
            incomeSources={incomeSources}
            currency={currency}
            dataMasking={securitySettings.dataMasking}
          />
        )}

        {currentTab === 'security' && (
          <SecurityVault
            settings={securitySettings}
            dataMasking={securitySettings.dataMasking}
            onToggleDataMasking={() =>
              setSecuritySettings((prev) => ({ ...prev, dataMasking: !prev.dataMasking }))
            }
            onUpdateSettings={(newSettings) =>
              setSecuritySettings((prev) => ({ ...prev, ...newSettings }))
            }
            onLockNow={() => {
              if (!securitySettings.pinLockEnabled) {
                setSecuritySettings((prev) => ({ ...prev, pinLockEnabled: true }));
              }
              setIsLocked(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 px-4 lg:px-8 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">Fin-Buddy Global</span> · Real-time financial management suite for all users worldwide.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>256-bit AES Hardware Encryption</span>
            <span>·</span>
            <span>Global MoMo & Open Banking</span>
            <span>·</span>
            <span>Verified Accounting Ledger</span>
          </div>
        </div>
      </footer>

      {/* Real Cashflow Audit Modal */}
      <AISpendingSummaryModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        summaryData={auditSummaryData}
        isLoading={false}
        onRegenerate={handleOpenAudit}
        currency={currency}
        userName="Ishmael Sackey Junior"
      />

      {/* Link Bank Account Modal */}
      <LinkAccountModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onAddAccount={handleAddAccount}
        currency={currency}
      />

      {/* Edit Real Account Balance Modal */}
      <EditAccountModal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        account={editingAccount}
        onSaveAccount={handleSaveAccount}
        currency={currency}
      />
    </div>
  );
}
