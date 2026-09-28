import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  ArrowUpRight,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Calendar,
  ShieldCheck,
  CreditCard,
  QrCode,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { BillSplit, SplitParticipant, BankAccount, Currency, Transaction } from '../types/finance';
import { formatCurrency } from '../services/api';
import { POPULAR_MOMO_CONTACTS } from '../data/initialData';

interface MobileMoneyHubProps {
  accounts: BankAccount[];
  bills: BillSplit[];
  currency: Currency;
  dataMasking: boolean;
  onAddBillSplit: (bill: Omit<BillSplit, 'id'>) => void;
  onSettleParticipant: (billId: string, participantId: string) => void;
  onExecuteP2PTransfer: (params: {
    recipientName: string;
    recipientPhone: string;
    network: 'MTN' | 'Telecel' | 'AirtelTigo' | 'M-Pesa';
    amount: number;
    reference: string;
  }) => void;
  onAddInstallmentPlan: (plan: {
    title: string;
    totalAmount: number;
    installments: number;
    intervalWeeks: number;
  }) => void;
}

export const MobileMoneyHub: React.FC<MobileMoneyHubProps> = ({
  accounts,
  bills,
  currency,
  dataMasking,
  onAddBillSplit,
  onSettleParticipant,
  onExecuteP2PTransfer,
  onAddInstallmentPlan,
}) => {
  const momoAccount = accounts.find((a) => a.type === 'momo') || accounts[0];

  const [activeTab, setActiveTab] = useState<'splits' | 'p2p' | 'installments'>('splits');

  // P2P State
  const [p2pRecipientName, setP2pRecipientName] = useState('Kwame Mensah');
  const [p2pRecipientPhone, setP2pRecipientPhone] = useState('+233 20 445 9912');
  const [p2pNetwork, setP2pNetwork] = useState<'MTN' | 'Telecel' | 'AirtelTigo' | 'M-Pesa'>('Telecel');
  const [p2pAmount, setP2pAmount] = useState('50.00');
  const [p2pReference, setP2pReference] = useState('Dinner split & drinks');
  const [p2pSuccessReceipt, setP2pSuccessReceipt] = useState<any | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // New Bill Split Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitTitle, setSplitTitle] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [splitParticipants, setSplitParticipants] = useState<Array<{ name: string; phone: string; network: 'MTN' | 'Telecel' | 'AirtelTigo'; share: number }>>([
    { name: 'Ishmael Sackey Junior (You)', phone: '0548696717', network: 'MTN', share: 0 },
    { name: 'Ama Osei', phone: '+233 55 912 3341', network: 'MTN', share: 0 },
    { name: 'Kwame Mensah', phone: '+233 20 445 9912', network: 'Telecel', share: 0 },
  ]);

  // Installment Plan Modal State
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planAmount, setPlanAmount] = useState('');
  const [planCount, setPlanCount] = useState(3);
  const [planInterval, setPlanInterval] = useState(2);

  // Notification Toast simulation
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendReminder = (participantName: string, phone: string, amount: number) => {
    showToast(`USSD MoMo push request of ${formatCurrency(amount, currency)} triggered to ${participantName} (${phone})`);
  };

  const handleP2PSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(p2pAmount);
    if (!p2pRecipientPhone || isNaN(num) || num <= 0) return;

    if (momoAccount.balance < num) {
      showToast('Insufficient balance in your Mobile Money wallet.');
      return;
    }

    onExecuteP2PTransfer({
      recipientName: p2pRecipientName,
      recipientPhone: p2pRecipientPhone,
      network: p2pNetwork,
      amount: num,
      reference: p2pReference,
    });

    // Fire Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#6366f1'],
      });
    } catch (e) {
      // fallback
    }

    const receiptId = `MM-${Date.now().toString().slice(-6)}`;
    setP2pSuccessReceipt({
      id: receiptId,
      recipient: p2pRecipientName,
      phone: p2pRecipientPhone,
      network: p2pNetwork,
      amount: num,
      reference: p2pReference,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    });

    showToast(`MoMo Transfer of ${formatCurrency(num, currency)} successfully sent to ${p2pRecipientName}!`);
  };

  const handleCreateSplit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(splitAmount);
    if (!splitTitle || isNaN(total) || total <= 0) return;

    const count = splitParticipants.length;
    const equalShare = Math.round((total / count) * 100) / 100;

    const finalParticipants: SplitParticipant[] = splitParticipants.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      name: p.name,
      phone: p.phone,
      shareAmount: splitMode === 'equal' ? equalShare : p.share || equalShare,
      status: p.name.includes('You') ? 'settled' : 'pending',
      paidAt: p.name.includes('You') ? '2026-09-28' : undefined,
      network: p.network as any,
    }));

    onAddBillSplit({
      title: splitTitle,
      totalAmount: total,
      category: 'Food & Dining',
      createdAt: '2026-09-28',
      dueDate: '2026-10-05',
      splitType: splitMode,
      payerId: 'Ishmael Sackey Junior',
      status: 'open',
      participants: finalParticipants,
    });

    setSplitTitle('');
    setSplitAmount('');
    setIsSplitModalOpen(false);
    showToast('New MoMo Bill Split created. Payment request notifications sent to participants!');
  };

  const handleCreateInstallmentPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(planAmount);
    if (!planTitle || isNaN(total) || total <= 0) return;

    onAddInstallmentPlan({
      title: planTitle,
      totalAmount: total,
      installments: planCount,
      intervalWeeks: planInterval,
    });

    setPlanTitle('');
    setPlanAmount('');
    setIsInstallmentModalOpen(false);
    showToast(`MoMo Flexi-Plan active for ${planTitle}: ${planCount} installments scheduled.`);
  };

  const copyReceipt = () => {
    if (p2pSuccessReceipt) {
      navigator.clipboard.writeText(
        `Fin-Buddy MoMo Receipt\nRef: ${p2pSuccessReceipt.id}\nTo: ${p2pSuccessReceipt.recipient} (${p2pSuccessReceipt.phone})\nAmount: ${formatCurrency(p2pSuccessReceipt.amount, currency)}\nStatus: Successful`
      );
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Mobile Money Hub & Seamless Bill Splitting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            MTN MoMo, Telecel Cash, and AirtelTigo peer-to-peer transfers with automated installment plans.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('splits')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'splits'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bill Splitting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('p2p')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'p2p'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Instant P2P Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('installments')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'installments'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MoMo Flexi-Plan
          </button>
        </div>
      </div>

      {/* MoMo Primary Wallet Card */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-800/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Primary Mobile Money Wallet
                </h2>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
                  MTN MoMo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {momoAccount.phoneNumber || '0548696717'} · Ishmael Sackey Junior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-slate-400 block">Available MoMo Balance</span>
              <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
                {formatCurrency(momoAccount.balance, currency, dataMasking)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('p2p')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
              >
                Send Money →
              </button>
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                + Split Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: BILL SPLITTING */}
      {activeTab === 'splits' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Active Bill Splits & Payment Status</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsSplitModalOpen(true)}
              className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
            >
              + Create New Split
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bills
              .filter((b) => b.splitType !== 'installment')
              .map((bill) => {
                const totalSettled = bill.participants
                  .filter((p) => p.status === 'settled')
                  .reduce((sum, p) => sum + p.shareAmount, 0);
                const percent = Math.round((totalSettled / bill.totalAmount) * 100);

                return (
                  <div
                    key={bill.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{bill.title}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Created {bill.createdAt} · Due {bill.dueDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-white tabular-nums">
                          {formatCurrency(bill.totalAmount, currency, dataMasking)}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {percent}% Collected
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Participants List */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {bill.participants.map((p) => {
                        const isSettled = p.status === 'settled';
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-850/60"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isSettled ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              <div>
                                <span className="font-semibold text-slate-200 block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {p.network} · {p.phone}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono font-semibold text-slate-200">
                                {formatCurrency(p.shareAmount, currency, dataMasking)}
                              </span>

                              {isSettled ? (
                                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                                  Settled
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSendReminder(p.name, p.phone, p.shareAmount)}
                                    className="px-2.5 py-1 text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/40 rounded hover:bg-amber-900/60 transition-colors cursor-pointer"
                                    title="Send USSD push payment reminder"
                                  >
                                    Prompt MoMo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onSettleParticipant(bill.id, p.id)}
                                    className="px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                    title="Mark settled"
                                  >
                                    Mark Paid
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: INSTANT P2P TRANSFERS */}
      {activeTab === 'p2p' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">
              Send Peer-to-Peer Mobile Money Transfer
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Instant transfer from your MTN MoMo balance directly to any mobile network in Ghana or East Africa.
            </p>

            {/* Quick Contacts */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Recent Contacts
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {POPULAR_MOMO_CONTACTS.map((c) => (
                  <button
                    key={c.phone}
                    type="button"
                    onClick={() => {
                      setP2pRecipientName(c.name);
                      setP2pRecipientPhone(c.phone);
                      setP2pNetwork(c.network as any);
                    }}
                    className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer shrink-0 ${
                      p2pRecipientPhone === c.phone
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-white'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {c.network} · {c.phone}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleP2PSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={p2pRecipientName}
                    onChange={(e) => setP2pRecipientName(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+233 24..."
                    value={p2pRecipientPhone}
                    onChange={(e) => setP2pRecipientPhone(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Mobile Network
                  </label>
                  <select
                    value={p2pNetwork}
                    onChange={(e) => setP2pNetwork(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Telecel">Telecel / Vodafone Cash</option>
                    <option value="AirtelTigo">AirtelTigo Money</option>
                    <option value="M-Pesa">M-Pesa Safaricom</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={p2pAmount}
                    onChange={(e) => setP2pAmount(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Payment Reference / Memo
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lunch split, weekend travel"
                  value={p2pReference}
                  onChange={(e) => setP2pReference(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Network Transfer Fee</span>
                <span className="font-mono text-emerald-400 font-semibold">GH₵0.00 (Zero Fee)</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Send {formatCurrency(parseFloat(p2pAmount) || 0, currency)}</span>
              </button>
            </form>
          </div>

          {/* Digital Receipt / Confirmation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  MoMo Transfer Receipt
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Verified 256-bit</span>
              </div>

              {p2pSuccessReceipt ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-white block">Transfer Successful</span>
                    <span className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
                      {formatCurrency(p2pSuccessReceipt.amount, currency)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                      <span>Transaction ID:</span>
                      <span className="text-white font-semibold">{p2pSuccessReceipt.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                      <span>Recipient:</span>
                      <span className="text-white">{p2pSuccessReceipt.recipient}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                      <span>Phone:</span>
                      <span className="text-white">{p2pSuccessReceipt.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                      <span>Network:</span>
                      <span className="text-amber-400 font-semibold">{p2pSuccessReceipt.network} MoMo</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                      <span>Timestamp:</span>
                      <span className="text-slate-300 text-[10px]">{p2pSuccessReceipt.date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={copyReceipt}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRef ? 'Receipt Copied!' : 'Copy Transaction Receipt'}</span>
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Smartphone className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-xs leading-relaxed max-w-xs mx-auto">
                    Fill the form on the left to send an instant MoMo transfer. A digital encrypted receipt will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-800">
              Sender: Ishmael Sackey Junior · MTN MoMo Primary
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOMO FLEXI-PLAN (INSTALLMENT PAYMENT PLANS) */}
      {activeTab === 'installments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Mobile Money Scheduled Payment Plans (MoMo Flexi)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated recurring MoMo deductions for major expenses. Zero compounding interest.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsInstallmentModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              + Create Payment Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bills
              .filter((b) => b.splitType === 'installment')
              .map((plan) => {
                const planDetails = plan.installmentPlan!;
                const percent = Math.round(
                  (planDetails.installmentsPaid / planDetails.totalInstallments) * 100
                );

                return (
                  <div
                    key={plan.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                          0% Interest MoMo Plan
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{plan.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{plan.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-white tabular-nums">
                          {formatCurrency(plan.totalAmount, currency, dataMasking)}
                        </span>
                        <span className="block text-[10px] text-slate-400">Total Obligation</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-300">
                        <span>
                          Part {planDetails.installmentsPaid} of {planDetails.totalInstallments} Cleared
                        </span>
                        <span>{percent}% Paid</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-850/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Next Auto-Debit</span>
                        <span className="font-mono text-white font-semibold">
                          {planDetails.nextDueDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Debit Amount</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {formatCurrency(planDetails.installmentAmount, currency, dataMasking)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Auto-debit from MTN MoMo Enabled</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast(`Simulated manual payoff for ${plan.title}`)}
                        className="text-emerald-400 hover:underline font-medium cursor-pointer"
                      >
                        Pay Off Early →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Create New Bill Split Modal */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Group Bill Split</h3>
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSplit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Bill Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sushi Dinner, Beach House, Electricity Bill"
                  value={splitTitle}
                  onChange={(e) => setSplitTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Total Bill Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="120.00"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Split Method
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-850 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSplitMode('equal')}
                    className={`py-1.5 rounded-lg font-medium transition-colors ${
                      splitMode === 'equal'
                        ? 'bg-slate-750 text-white shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    Equal Shares
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('custom')}
                    className={`py-1.5 rounded-lg font-medium transition-colors ${
                      splitMode === 'custom'
                        ? 'bg-slate-750 text-white shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    Custom Amounts
                  </button>
                </div>
              </div>

              {/* Participants list */}
              <div>
                <span className="text-xs font-medium text-slate-300 block mb-2">
                  Participants ({splitParticipants.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {splitParticipants.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-850 border border-slate-800"
                    >
                      <div>
                        <span className="font-semibold text-white block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.network} · {p.phone}
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {splitAmount
                          ? formatCurrency(parseFloat(splitAmount) / splitParticipants.length, currency)
                          : '$0.00'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSplitModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
                >
                  Confirm & Send MoMo Prompts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Installment Plan Modal */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create MoMo Payment Plan</h3>
              <button
                type="button"
                onClick={() => setIsInstallmentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInstallmentPlan} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Item or Purchase Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Desk Chair, Flight Ticket"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Total Obligation Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="300.00"
                  value={planAmount}
                  onChange={(e) => setPlanAmount(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Number of Payments
                  </label>
                  <select
                    value={planCount}
                    onChange={(e) => setPlanCount(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value={2}>2 Installments</option>
                    <option value={3}>3 Installments</option>
                    <option value={4}>4 Installments</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Cadence
                  </label>
                  <select
                    value={planInterval}
                    onChange={(e) => setPlanInterval(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value={1}>Every Week</option>
                    <option value={2}>Every 2 Weeks</option>
                    <option value={4}>Monthly</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Each Installment:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {planAmount
                      ? formatCurrency(parseFloat(planAmount) / planCount, currency)
                      : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Interest rate:</span>
                  <span className="text-emerald-400 font-medium">0% APR (Zero Fee)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInstallmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
                >
                  Activate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
