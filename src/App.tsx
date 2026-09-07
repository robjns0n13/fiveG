import { useState, useEffect } from 'react';
import { 
  Settings, 
  Radio, 
  Terminal, 
  Flame 
} from 'lucide-react';
import { AccessPoint, Language, RoamLogEntry, WiFiStatus } from './types';
import { wifiEngine } from './services/wifiEngine';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ScannerPanel } from './components/ScannerPanel';
import { LogViewer } from './components/LogViewer';
import { SimulationControls } from './components/SimulationControls';
import { MenuBarWidget } from './components/MenuBarWidget';

export function App() {
  const [lang, setLang] = useState<Language>('vi');
  const [activeTab, setActiveTab] = useState<'control' | 'scanner' | 'logs' | 'simulation'>('control');
  const [status, setStatus] = useState<WiFiStatus>(() => ({
    currentSSID: 'Home_WiFi_Mesh',
    band: '5 GHz',
    channel: 'Ch 36 (80 MHz)',
    channelNumber: 36,
    rssi: -52,
    noise: -92,
    txRate: 866,
    status: 'Đã kết nối 5 GHz. Bắt đầu cooldown 30 giây.',
    configuredSSID: 'Home_WiFi_Mesh',
    autoLockEnabled: true,
    isLockedTo5G: true,
    isScanning: false,
    isSwitching: false,
    cooldownRemaining: 30,
    pollIntervalSec: 8,
    locationStatus: 'authorized',
    launchAtLogin: true,
    lastSwitchTimestamp: Date.now(),
    lastScanTimestamp: null,
    hasPasswordSaved: true,
    vaultSavedSSID: 'Home_WiFi_Mesh',
  }));
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [logs, setLogs] = useState<RoamLogEntry[]>([]);
  const [isMenuBarOpen, setIsMenuBarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = wifiEngine.subscribe((newStatus, newAPs, newLogs) => {
      setStatus(newStatus);
      setAccessPoints(newAPs);
      setLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    wifiEngine.setLanguage(newLang);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        status={status}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenMenuBar={() => setIsMenuBarOpen(true)}
        isMenuBarOpen={isMenuBarOpen}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 w-fit overflow-x-auto max-w-full">
          <button
            id="tab-control-btn"
            onClick={() => setActiveTab('control')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'control'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.setupTitle}</span>
          </button>

          <button
            id="tab-scanner-btn"
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t.scannerTitle}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {accessPoints.length}
            </span>
          </button>

          <button
            id="tab-logs-btn"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.logsTitle}</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {logs.length}
              </span>
            )}
          </button>

          <button
            id="tab-simulation-btn"
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sandbox Test</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'control' && (
          <ControlPanel
            status={status}
            lang={lang}
            onSaveConfig={(ssid, pw) => wifiEngine.saveConfiguration(ssid, pw)}
            onToggleAutoLock={() => wifiEngine.toggleAutoLock()}
            onToggleLaunchAtLogin={() => wifiEngine.toggleLaunchAtLogin()}
            onRequestLocationPermission={() => wifiEngine.requestLocationPermission()}
            onForceScan={() => wifiEngine.forceScan()}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerPanel
            accessPoints={accessPoints}
            currentSSID={status.currentSSID}
            isScanning={status.isScanning}
            lang={lang}
            onScan={() => wifiEngine.forceScan()}
            onSelectTargetAP={(ap) => wifiEngine.lockToAP(ap)}
          />
        )}

        {activeTab === 'logs' && (
          <LogViewer
            logs={logs}
            lang={lang}
            onClearLogs={() => wifiEngine.clearLogs()}
          />
        )}

        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <SimulationControls
              status={status}
              lang={lang}
              onSimulateDowngrade={() => wifiEngine.simulateDowngradeTo24G()}
              onSimulateWeakSignal={() => wifiEngine.simulateWeakSignal()}
              onSimulateRestoreSignal={() => wifiEngine.simulateRestoreSignal()}
              onForceRoam5G={() => wifiEngine.triggerAutoRoamTo5G()}
              onResetSimulation={() => wifiEngine.resetSimulation()}
            />
            {/* Embedded Live Log View for Simulation */}
            <LogViewer
              logs={logs}
              lang={lang}
              onClearLogs={() => wifiEngine.clearLogs()}
            />
          </div>
        )}
      </main>

      {/* Popover MenuBar Widget */}
      <MenuBarWidget
        status={status}
        lang={lang}
        isOpen={isMenuBarOpen}
        onClose={() => setIsMenuBarOpen(false)}
        onToggleAutoLock={() => wifiEngine.toggleAutoLock()}
        onForceScan={() => wifiEngine.forceScan()}
        onSimulateDowngrade={() => wifiEngine.simulateDowngradeTo24G()}
        onSimulateRestore={() => wifiEngine.triggerAutoRoamTo5G()}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FiveGLock · macOS 5 GHz Wi-Fi Lock & Roaming Manager</span>
          <span>CoreWLAN & CoreLocation Native Engine Port</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
