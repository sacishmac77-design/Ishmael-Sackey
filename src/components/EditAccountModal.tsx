import React, { useState } from 'react';
import { Building2, Check, Smartphone, CreditCard, DollarSign } from 'lucide-react';
import { BankAccount, Currency } from '../types/finance';
import { formatCurrency } from '../services/api';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | null;
  onSaveAccount: (accountId: string, updates: Partial<BankAccount>) => void;
  currency: Currency;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSaveAccount,
  currency,
}) => {
  if (!isOpen || !account) return null;

  const [name, setName] = useState(account.name);
  const [balance, setBalance] = useState(account.balance.toString());
  const [institution, setInstitution] = useState(account.institution);
  const [accountNumber, setAccountNumber] = useState(account.accountNumber);
  const [phoneNumber, setPhoneNumber] = useState(account.phoneNumber || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) return;

    onSaveAccount(account.id, {
      name,
      balance: numBalance,
      institution,
      accountNumber,
      phoneNumber: phoneNumber || undefined,
      lastSynced: 'Just updated',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Update Real Account Balance</h3>
            <p className="text-[11px] text-slate-400">
              Set the exact actual balance reflecting your bank or mobile money account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Account Label / Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-400 block mb-1">
              Exact Actual Balance ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500/50"
              placeholder="0.00"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tip: For credit cards or overdrafts, you can enter a negative amount (e.g. -450.00).
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Institution
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Account Number Mask
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {account.type === 'momo' && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Mobile Money Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0548696717"
                className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              Save Real Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
