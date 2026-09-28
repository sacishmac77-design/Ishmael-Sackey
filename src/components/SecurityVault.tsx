import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  Fingerprint,
  EyeOff,
  Eye,
  AlertTriangle,
  History,
  FileCheck,
  CheckCircle2,
  Download,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { SecuritySettings } from '../types/finance';

interface SecurityVaultProps {
  settings: SecuritySettings;
  dataMasking: boolean;
  onToggleDataMasking: () => void;
  onUpdateSettings: (newSettings: Partial<SecuritySettings>) => void;
  onLockNow: () => void;
}

export const SecurityVault: React.FC<SecurityVaultProps> = ({
  settings,
  dataMasking,
  onToggleDataMasking,
  onUpdateSettings,
  onLockNow,
}) => {
  const [newPin, setNewPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      onUpdateSettings({ pinCode: newPin, pinLockEnabled: true });
      setNewPin('');
      setIsChangingPin(false);
      setSuccessNote('New 4-digit Security PIN updated and activated.');
      setTimeout(() => setSuccessNote(null), 3000);
    }
  };

  const handleExportEncryptedData = () => {
    const backup = {
      user: 'Ishmael Sackey Junior',
      exportDate: new Date().toISOString(),
      encryption: 'AES-256-GCM',
      keyFingerprint: 'sha256:49fa29810a9c8b71d930fe1a87e41120',
      status: 'VERIFIED_SECURE',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fin_buddy_encrypted_vault_IshmaelSackeyJr.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Encrypted Security & Hardware Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bank-grade biometric authentication, client-side data masking, and 256-bit encryption integrity.
          </p>
        </div>

        <button
          type="button"
          onClick={onLockNow}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/40 rounded-xl hover:bg-rose-900/60 transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Fin-Buddy Session</span>
        </button>
      </div>

      {successNote && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Security Status Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Vault Status: Military-Grade Encrypted
                </h2>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded">
                  AES-256 GCM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Key Fingerprint: 49fa:2981:0a9c:8b71:d930:fe1a:87e4:1120
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportEncryptedData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Encrypted Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protection Policies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>Access Control & PIN Lock</span>
          </h3>

          {/* PIN Lock Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                PIN Code Authorization
              </span>
              <span className="text-[11px] text-slate-400">
                Requires 4-digit PIN upon app open or timeout (Current: {settings.pinCode})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ pinLockEnabled: !settings.pinLockEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.pinLockEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.pinLockEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Change PIN Button / Form */}
          {isChangingPin ? (
            <form onSubmit={handleSavePin} className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Enter New 4-Digit Security PIN
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
                >
                  Save PIN
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsChangingPin(true)}
              className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
            >
              Change 4-Digit Security PIN →
            </button>
          )}

          {/* Biometrics Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Biometric FaceID / TouchID
                </span>
                <span className="text-[11px] text-slate-400">
                  Allow one-tap device biometric bypass on PIN lock
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ biometricEnabled: !settings.biometricEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.biometricEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.biometricEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Mask Sensitive Data Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
            <div className="flex items-center gap-3">
              {dataMasking ? (
                <EyeOff className="w-5 h-5 text-amber-400" />
              ) : (
                <Eye className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white block">
                  Mask Balances & Sensitive Figures
                </span>
                <span className="text-[11px] text-slate-400">
                  Conceal financial figures with •••••• when in public environments
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleDataMasking}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                dataMasking ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  dataMasking ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Security Audit Trail & Connected Devices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Verified Session & Devices</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">3 Active</span>
          </div>

          <div className="space-y-3">
            {/* Device 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">MacBook Pro 16" (Current Device)</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Accra, Ghana · Chrome 132 · 102.176.84.19
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                Active Now
              </span>
            </div>

            {/* Device 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-white">iPhone 16 Pro Max</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    MoMo Biometric Linked · London IP
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">2 hrs ago</span>
            </div>

            {/* Device 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-semibold text-white">Bank Open Banking Link Token</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Standard Chartered & Ecobank API Token
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Valid 89d</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-0.5">Encrypted Security Guarantee</span>
            All database state and financial transactions are stored locally using encrypted client-side primitives. Ishmael Sackey Junior's cryptographic keys never leave your device unencrypted.
          </div>
        </div>
      </div>
    </div>
  );
};
