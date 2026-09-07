import React, { useState } from 'react';
import { 
  Radio, 
  Lock, 
  RefreshCw, 
  Check
} from 'lucide-react';
import { AccessPoint, Language } from '../types';
import { translations } from '../data/translations';

interface ScannerPanelProps {
  accessPoints: AccessPoint[];
  currentSSID: string;
  isScanning: boolean;
  lang: Language;
  onScan: () => void;
  onSelectTargetAP: (ap: AccessPoint) => void;
}

export const ScannerPanel: React.FC<ScannerPanelProps> = ({
  accessPoints,
  currentSSID: _currentSSID,
  isScanning,
  lang,
  onScan,
  onSelectTargetAP,
}) => {
  const t = translations[lang];
  const [bandFilter, setBandFilter] = useState<'ALL' | '5 GHz' | '2.4 GHz'>('ALL');

  const filteredAPs = accessPoints.filter((ap) => {
    if (bandFilter === 'ALL') return true;
    return ap.band === bandFilter;
  });

  const getSignalColor = (rssi: number) => {
    if (rssi >= -55) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (rssi >= -70) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    if (rssi >= -80) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl space-y-5">
      {/* Header with filters and scan button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {t.scannerTitle}
              <span className="text-xs font-normal text-slate-400">
                ({filteredAPs.length} BSSIDs found)
              </span>
            </h3>
            <p className="text-xs text-slate-400">{t.apList}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Band Filter Pills */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              id="filter-all-btn"
              onClick={() => setBandFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                bandFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              id="filter-5g-btn"
              onClick={() => setBandFilter('5 GHz')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                bandFilter === '5 GHz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5 GHz
            </button>
            <button
              id="filter-24g-btn"
              onClick={() => setBandFilter('2.4 GHz')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                bandFilter === '2.4 GHz'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2.4 GHz
            </button>
          </div>

          <button
            id="scanner-scan-btn"
            onClick={onScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? t.scanning : t.scanNow}</span>
          </button>
        </div>
      </div>

      {/* Access Point Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAPs.map((ap) => {
          const isConnected = ap.isCurrent;

          return (
            <div
              key={ap.bssid}
              className={`p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                isConnected
                  ? 'bg-slate-900/90 border-blue-500/60 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-700/60'
              }`}
            >
              {/* Connected badge */}
              {isConnected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-bold">
                  <Check className="w-3 h-3" />
                  <span>ACTIVE</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">{ap.ssid}</h4>
                    <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                      ap.band === '5 GHz'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ap.band}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    BSSID: {ap.bssid}
                  </div>
                </div>
              </div>

              {/* AP Specs Details */}
              <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-800/80 my-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">{t.channel}</span>
                  <span className="font-mono font-semibold text-slate-200">
                    Ch {ap.channel} ({ap.channelWidth})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">{t.signal}</span>
                  <span className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[11px] inline-block ${getSignalColor(ap.rssi)}`}>
                    {ap.rssi} dBm
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">{t.snr}</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {ap.snr} dB
                  </span>
                </div>
              </div>

              {/* Footer with PHY Mode, Security & Lock Action */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="truncate max-w-[170px]">
                  <span>{ap.phyMode}</span> · <span>{ap.security}</span>
                </div>

                {ap.band === '5 GHz' && !isConnected && (
                  <button
                    id={`lock-ap-${ap.channel}`}
                    onClick={() => onSelectTargetAP(ap)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-semibold rounded-lg border border-emerald-500/40 text-xs transition-colors cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{t.lockToThisAP}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

