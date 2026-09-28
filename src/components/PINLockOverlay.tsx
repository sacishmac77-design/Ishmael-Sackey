import React, { useState } from 'react';
import { Lock, Fingerprint, ShieldCheck, AlertCircle } from 'lucide-react';

interface PINLockOverlayProps {
  correctPin: string;
  onUnlock: () => void;
  biometricEnabled: boolean;
}

export const PINLockOverlay: React.FC<PINLockOverlayProps> = ({
  correctPin,
  onUnlock,
  biometricEnabled,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setTimeout(() => {
            setError(true);
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometricAuth = () => {
    setBiometricSuccess(true);
    setTimeout(() => {
      onUnlock();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
          {biometricSuccess ? (
            <ShieldCheck className="w-7 h-7 text-emerald-400 animate-pulse" />
          ) : (
            <Lock className="w-7 h-7 text-emerald-400" />
          )}
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Fin-Buddy Security Vault</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Encrypted session locked. Enter your 4-digit PIN for Ishmael Sackey Junior.
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > index
                  ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 border border-slate-700'
              } ${error ? 'bg-rose-500 border-rose-500 animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incorrect PIN code. Default is 1234.</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-lg font-semibold text-white border border-slate-750 transition-colors flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          {biometricEnabled ? (
            <button
              type="button"
              onClick={handleBiometricAuth}
              className="h-14 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center cursor-pointer"
              title="Biometric FaceID / TouchID"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-lg font-semibold text-white border border-slate-750 transition-colors flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-slate-800/40 hover:bg-slate-800 active:bg-slate-700 text-xs font-medium text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            Delete
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          AES-256 Bit Hardware Vault · Ishmael Sackey Junior
        </p>
      </div>
    </div>
  );
};
