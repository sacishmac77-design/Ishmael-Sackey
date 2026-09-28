import React, { useState } from 'react';
import {
  Building2,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CreditCard,
  RefreshCw,
  Search,
} from 'lucide-react';
import { BankAccount, AccountType, Currency } from '../types/finance';

interface LinkAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<BankAccount, 'id' | 'lastSynced' | 'status'>) => void;
  currency: Currency;
}

const SUPPORTED_BANKS = [
  { name: 'Standard Chartered', country: 'Global & Ghana', type: 'checking', color: '#0284c7' },
  { name: 'Ecobank International', country: 'Pan-African', type: 'credit', color: '#6366f1' },
  { name: 'Fidelity Bank', country: 'Ghana & Wealth', type: 'savings', color: '#10b981' },
  { name: 'Absa Bank / Barclays', country: 'International', type: 'checking', color: '#e11d48' },
  { name: 'Zenith Bank', country: 'Commercial', type: 'checking', color: '#dc2626' },
  { name: 'GCB Bank', country: 'National Commercial', type: 'checking', color: '#f59e0b' },
  { name: 'Chase Bank', country: 'United States', type: 'checking', color: '#1e40af' },
  { name: 'MTN Mobile Money', country: 'West & East Africa', type: 'momo', color: '#f59e0b' },
  { name: 'Telecel Cash', country: 'Mobile Money', type: 'momo', color: '#e11d48' },
];

export const LinkAccountModal: React.FC<LinkAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  currency,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'select' | 'auth' | 'success'>('select');
  const [selectedBank, setSelectedBank] = useState<typeof SUPPORTED_BANKS[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [username, setUsername] = useState('ishmael.sackey');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const filteredBanks = SUPPORTED_BANKS.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectBank = (bank: typeof SUPPORTED_BANKS[0]) => {
    setSelectedBank(bank);
    setStep('auth');
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      if (selectedBank) {
        onAddAccount({
          name: `${selectedBank.name} ${selectedBank.type === 'savings' ? 'Reserve' : selectedBank.type === 'credit' ? 'Platinum' : 'Account'}`,
          institution: selectedBank.name,
          type: selectedBank.type as AccountType,
          accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
          balance: selectedBank.type === 'credit' ? -350.00 : 2500.00,
          currency: currency,
          color: selectedBank.color,
          network: selectedBank.type === 'momo' ? 'MTN' : undefined,
          phoneNumber: selectedBank.type === 'momo' ? '0548696717' : undefined,
        });
      }
      setStep('success');
    }, 1200);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedBank(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Step 1: Select Bank */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Link Financial Account</h3>
                  <p className="text-[11px] text-slate-400">Open Banking & MoMo encrypted synchronization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search financial institution or network..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-850 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className="w-full p-3 rounded-xl bg-slate-850/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block group-hover:text-emerald-400 transition-colors">
                        {bank.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {bank.country} · {bank.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>End-to-End 256-bit Encrypted Tokenization</span>
            </div>
          </div>
        )}

        {/* Step 2: Credential Authorization */}
        {step === 'auth' && selectedBank && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: selectedBank.color }}
                >
                  {selectedBank.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Connect {selectedBank.name}</h3>
                  <p className="text-[10px] text-slate-400">Secure Open Banking OAuth Bridge</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Back
              </button>
            </div>

            <form onSubmit={handleAuthorize} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Online Banking ID or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Password or Token Code
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Permissions requested:</span>
                <div>• Read account balances and transaction history</div>
                <div>• Real-time webhook push updates on new card/momo charges</div>
              </div>

              <button
                type="submit"
                disabled={isAuthorizing}
                className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthorizing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isAuthorizing ? 'Authorizing with Bank...' : 'Authorize & Connect'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && selectedBank && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Account Successfully Linked!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {selectedBank.name} has been added to Ishmael Sackey Junior's Fin-Buddy dashboard. Initial transaction ledger synchronized.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
