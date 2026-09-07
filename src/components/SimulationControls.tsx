import React from 'react';
import { 
  RotateCcw, 
  Zap, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldAlert, 
  Flame
} from 'lucide-react';
import { Language, WiFiStatus } from '../types';
import { translations } from '../data/translations';

interface SimulationControlsProps {
  status: WiFiStatus;
  lang: Language;
  onSimulateDowngrade: () => void;
  onSimulateWeakSignal: () => void;
  onSimulateRestoreSignal: () => void;
  onForceRoam5G: () => void;
  onResetSimulation: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  status,
  lang,
  onSimulateDowngrade,
  onSimulateWeakSignal,
  onSimulateRestoreSignal,
  onForceRoam5G,
  onResetSimulation,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.simulationTitle}</h3>
            <p className="text-xs text-slate-400">
              {lang === 'vi' 
                ? 'Thử nghiệm cơ chế phát hiện & khóa băng tần tự động của FiveGLock'
                : 'Test FiveGLock auto-detection and 5 GHz band locking loop'}
            </p>
          </div>
        </div>

        <button
          id="reset-simulation-btn"
          onClick={onResetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-xl border border-slate-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Lab</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Downgrade to 2.4 GHz Simulation */}
        <button
          id="sim-downgrade-btn"
          onClick={onSimulateDowngrade}
          disabled={status.band === '2.4 GHz'}
          className="p-3.5 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-amber-500/30 hover:border-amber-500/60 text-left transition-all group disabled:opacity-40"
        >
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20">
              Test Scenario 1
            </span>
          </div>
          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
            {t.simulateDowngrade}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {lang === 'vi'
              ? 'Mô phỏng máy bị rớt về sóng 2.4 GHz để xem FiveGLock tự động kéo về 5 GHz.'
              : 'Drops connection to 2.4 GHz to watch FiveGLock auto-lock back to 5 GHz.'}
          </p>
        </button>

        {/* Weak Signal Simulation */}
        <button
          id="sim-weak-signal-btn"
          onClick={onSimulateWeakSignal}
          className="p-3.5 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-rose-500/30 hover:border-rose-500/60 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-rose-400 mb-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20">
              Test Scenario 2
            </span>
          </div>
          <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
            {t.simulateSignalDrop}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {lang === 'vi'
              ? 'Giảm công suất thu RSSI xuống -82 dBm để quan sát ngưỡng SNR/chất lượng.'
              : 'Degrades RSSI to -82 dBm to test weak signal handling.'}
          </p>
        </button>

        {/* Restore Strong Signal */}
        <button
          id="sim-strong-signal-btn"
          onClick={onSimulateRestoreSignal}
          className="p-3.5 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-sky-500/30 hover:border-sky-500/60 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-sky-400 mb-1.5">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20">
              Test Scenario 3
            </span>
          </div>
          <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
            {t.simulateRestoreSignal}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {lang === 'vi'
              ? 'Phục hồi cường độ sóng về -50 dBm lý tưởng.'
              : 'Restores RSSI back to optimal -50 dBm levels.'}
          </p>
        </button>

        {/* Force Roam 5G Now */}
        <button
          id="sim-force-roam-btn"
          onClick={onForceRoam5G}
          className="p-3.5 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
              Instant Action
            </span>
          </div>
          <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
            {t.forceRoam5G}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {lang === 'vi'
              ? 'Gửi lệnh tức thì chuyển về AP 5 GHz và khởi động cooldown 30 giây.'
              : 'Immediately associate to candidate 5 GHz AP and activate 30s cooldown.'}
          </p>
        </button>
      </div>
    </div>
  );
};
