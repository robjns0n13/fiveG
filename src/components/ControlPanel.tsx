import React, { useState } from 'react';
import { 
  Wifi, 
  Lock, 
  Key, 
  ShieldCheck, 
  MapPin, 
  Power, 
  Check, 
  AlertCircle, 
  Save, 
  Clock, 
  Radio, 
  Zap, 
  Eye, 
  EyeOff, 
  Settings,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Language, WiFiStatus } from '../types';
import { translations } from '../data/translations';

interface ControlPanelProps {
  status: WiFiStatus;
  lang: Language;
  onSaveConfig: (ssid: string, password?: string) => void;
  onToggleAutoLock: () => void;
  onToggleLaunchAtLogin: () => void;
  onRequestLocationPermission: () => void;
  onForceScan: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  lang,
  onSaveConfig,
  onToggleAutoLock,
  onToggleLaunchAtLogin,
  onRequestLocationPermission,
  onForceScan,
}) => {
  const t = translations[lang];
  const [ssidInput, setSsidInput] = useState(status.configuredSSID || status.currentSSID || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSSID = ssidInput.trim();
    if (!cleanSSID || cleanSSID.length > 32) {
      setSaveError(t.saveError);
      setSaveFeedback(null);
      return;
    }

    setSaveError(null);
    onSaveConfig(cleanSSID, passwordInput);
    setSaveFeedback(t.saveSuccess);
    setPasswordInput('');
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const getLocationStatusBadge = () => {
    switch (status.locationStatus) {
      case 'authorized':
        return { text: t.locationGranted, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'denied':
        return { text: t.locationDenied, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'restricted':
        return { text: t.locationRestricted, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'disabled':
        return { text: t.locationDisabled, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      default:
        return { text: t.locationChecking, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
  };

  const locationBadge = getLocationStatusBadge();

  return (
    <div className="space-y-6">
      {/* Live Radio Status Hero Banner */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none ${
          status.band === '5 GHz' ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.currentStatus}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                status.band === '5 GHz'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {status.band === '5 GHz' ? '5 GHz LOCKED' : '2.4 GHz BAND'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
              {status.currentSSID || 'Not Connected'}
              {status.configuredSSID === status.currentSSID && (
                <span className="text-xs px-2 py-0.5 font-normal rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Target Match
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-scan-hero-btn"
              onClick={onForceScan}
              disabled={status.isScanning}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600/60 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.isScanning ? 'animate-spin text-blue-400' : ''}`} />
              <span>{status.isScanning ? t.scanning : t.scanNow}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">{t.band}</span>
              <Radio className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className={`text-lg font-bold font-mono ${
              status.band === '5 GHz' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {status.band}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">{t.channel}</span>
              <Wifi className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {status.channel}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">{t.signal}</span>
              <Zap className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-sky-400 font-mono">
              {status.rssi} dBm
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">{t.txRate}</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-indigo-400 font-mono">
              {status.txRate} Mbps
            </div>
          </div>
        </div>

        {/* Status Prompt Line */}
        <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="font-medium">{status.status}</span>
          </div>
          {status.cooldownRemaining > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
              Cooldown: {status.cooldownRemaining}s
            </span>
          )}
        </div>
      </div>

      {/* Main Configuration Form & Auto-Lock Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SSID & Password Vault Configuration */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.setupTitle}</h3>
                <p className="text-xs text-slate-400">{t.rateLimitNote}</p>
              </div>
            </div>

            {/* Auto Lock Master Switch */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">{t.autoLock}</div>
                <div className="text-[10px] text-slate-400">
                  {status.autoLockEnabled ? 'Active' : 'Disabled'}
                </div>
              </div>
              <button
                id="main-autolock-switch"
                onClick={onToggleAutoLock}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors ${
                  status.autoLockEnabled ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                  status.autoLockEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* SSID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                {t.targetSSID}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Wifi className="w-4 h-4" />
                </div>
                <input
                  id="target-ssid-input"
                  type="text"
                  value={ssidInput}
                  onChange={(e) => setSsidInput(e.target.value)}
                  placeholder={t.targetSSIDPlaceholder}
                  className="w-full pl-9 pr-24 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />
                <button
                  type="button"
                  id="use-current-ssid-btn"
                  onClick={() => setSsidInput(status.currentSSID)}
                  className="absolute inset-y-1 right-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  Use Current
                </button>
              </div>
            </div>

            {/* Password Input (Stored in Keychain) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  {t.password}
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  {status.hasPasswordSaved ? 'Password stored in Keychain' : 'No saved password'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="target-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  id="toggle-pw-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'vi' 
                  ? 'Mật khẩu chỉ lưu an toàn trong macOS Keychain để tái kết nối nhanh khi đổi băng tần.'
                  : 'Password is only stored in secure Keychain to auto-reconnect when roaming bands.'}
              </p>
            </div>

            {/* Notifications */}
            {saveFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveFeedback}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="save-config-btn"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveConfig}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: System Permissions & Preferences */}
        <div className="space-y-4">
          {/* Location Services Permissions (Required for Wi-Fi SSID read on macOS) */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t.locationSection}
              </h4>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {lang === 'vi'
                ? 'FiveGLock cần quyền vị trí (CoreLocation) để đọc SSID và tìm điểm phát Wi-Fi 5 GHz của mạng bạn chọn.'
                : 'FiveGLock requires CoreLocation permission to read active SSID and discover 5 GHz access points.'}
            </p>

            <div className={`p-2.5 rounded-xl border text-xs font-medium mb-3 flex items-center gap-2 ${locationBadge.color}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{locationBadge.text}</span>
            </div>

            <button
              id="grant-location-btn"
              onClick={onRequestLocationPermission}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl border border-slate-600 transition-colors"
            >
              <span>{status.locationStatus === 'authorized' ? t.openLocationSettings : t.grantLocation}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Launch at Login Card */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.loginItem}
                </h4>
              </div>
              <button
                id="login-items-switch"
                onClick={onToggleLaunchAtLogin}
                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                  status.launchAtLogin ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  status.launchAtLogin ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {t.loginItemDesc}
            </p>

            <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
              Status: {status.launchAtLogin ? 'Registered in SMAppService' : 'Not configured'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
