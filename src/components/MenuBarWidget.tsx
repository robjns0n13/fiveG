import React from 'react';
import { Wifi, Lock, Shield, CheckCircle, RefreshCw, X, Radio } from 'lucide-react';
import { Language, WiFiStatus } from '../types';
import { translations } from '../data/translations';

interface MenuBarWidgetProps {
  status: WiFiStatus;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onToggleAutoLock: () => void;
  onForceScan: () => void;
  onSimulateDowngrade: () => void;
  onSimulateRestore: () => void;
}

export const MenuBarWidget: React.FC<MenuBarWidgetProps> = ({
  status,
  lang,
  isOpen,
  onClose,
  onToggleAutoLock,
  onForceScan,
  onSimulateDowngrade,
  onSimulateRestore,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:justify-center p-4 sm:pt-16 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Bar Window Header */}
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {t.menuBarTitle}
                {status.band === '5 GHz' && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-semibold rounded">
                    5G LOCKED
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {status.currentSSID || 'Not Connected'}
              </div>
            </div>
          </div>

          <button
            id="close-menubar-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Wi-Fi Stats Grid */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                {t.band}
              </span>
              <span className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                status.band === '5 GHz' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <Radio className="w-3.5 h-3.5" />
                {status.band}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                {t.channel}
              </span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                {status.channel}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                {t.signal}
              </span>
              <span className="text-sm font-bold text-sky-400 font-mono mt-0.5 block">
                {status.rssi} dBm
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                {t.txRate}
              </span>
              <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">
                {status.txRate} Mbps
              </span>
            </div>
          </div>

          {/* Status Message Box */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <div className={`mt-0.5 p-1 rounded-full ${
              status.band === '5 GHz' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {status.isScanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : status.band === '5 GHz' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-xs">
              <p className="font-medium text-slate-200 leading-snug">
                {status.status}
              </p>
              {status.cooldownRemaining > 0 && (
                <p className="text-[10px] text-amber-400 font-mono mt-1">
                  ⏱ {t.cooldownBadge} {status.cooldownRemaining}{t.seconds}
                </p>
              )}
            </div>
          </div>

          {/* Quick Toggle Auto Lock */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${status.autoLockEnabled ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="text-xs font-semibold text-white">{t.autoLock}</span>
            </div>
            <button
              id="menubar-toggle-autolock"
              onClick={onToggleAutoLock}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                status.autoLockEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                status.autoLockEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5 pt-1">
            <button
              id="menubar-scan-btn"
              onClick={onForceScan}
              disabled={status.isScanning}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700/80 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.isScanning ? 'animate-spin' : ''}`} />
              <span>{t.scanNow}</span>
            </button>

            {status.band === '5 GHz' ? (
              <button
                id="menubar-sim-downgrade-btn"
                onClick={onSimulateDowngrade}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/30 transition-colors"
              >
                <span>{t.simulateDowngrade}</span>
              </button>
            ) : (
              <button
                id="menubar-sim-restore-btn"
                onClick={onSimulateRestore}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/30 transition-colors"
              >
                <span>{t.forceRoam5G}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>FiveGLock v1.0 (macOS)</span>
          <span className="font-mono">{t.rateLimitNote}</span>
        </div>
      </div>
    </div>
  );
};
