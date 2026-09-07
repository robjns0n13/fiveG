import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Radio
} from 'lucide-react';
import { Language, RoamLogEntry } from '../types';
import { translations } from '../data/translations';

interface LogViewerProps {
  logs: RoamLogEntry[];
  lang: Language;
  onClearLogs: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  lang,
  onClearLogs,
}) => {
  const t = translations[lang];
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fiveglock-log-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLogIcon = (type: RoamLogEntry['type']) => {
    switch (type) {
      case 'lock':
      case 'switch':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'scan':
        return <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-700/60 text-slate-300 border border-slate-600/50">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.logsTitle}</h3>
            <p className="text-xs text-slate-400">
              {logs.length} events recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown / Select */}
          <select
            id="log-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Events</option>
            <option value="switch">Band Roam / Switch</option>
            <option value="lock">Lock 5 GHz</option>
            <option value="scan">AP Scan</option>
            <option value="warning">Warnings</option>
          </select>

          <button
            id="export-logs-btn"
            onClick={exportAsJSON}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-xl border border-slate-600 transition-colors"
            title={t.exportLogs}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportLogs}</span>
          </button>

          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-600 transition-colors"
            title={t.clearLogs}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Console Container */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 max-h-72 overflow-y-auto font-mono text-xs space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-sans">
            No log events recorded yet.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 transition-colors"
            >
              <div className="mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 text-[11px] truncate">
                    {log.title}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5 font-sans leading-relaxed">
                  {log.message}
                </p>
                {log.details && (
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800 font-mono">
                    {log.details.fromBand && (
                      <span>Band: {log.details.fromBand} → {log.details.toBand}</span>
                    )}
                    {log.details.toChannel && (
                      <span>Channel: {log.details.toChannel}</span>
                    )}
                    {log.details.rssi && (
                      <span>RSSI: {log.details.rssi} dBm</span>
                    )}
                    {log.details.bssid && (
                      <span>BSSID: {log.details.bssid}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
