import { AccessPoint, Language, RoamLogEntry, WiFiStatus } from '../types';
import { INITIAL_ACCESS_POINTS } from '../data/mockNetworks';
import { translations } from '../data/translations';

const STORAGE_KEY_CONFIG = 'fiveglock_config';
const STORAGE_KEY_VAULT = 'fiveglock_vault_pw';

export class WiFiEngine {
  private status: WiFiStatus;
  private accessPoints: AccessPoint[];
  private logs: RoamLogEntry[];
  private listeners: ((status: WiFiStatus, aps: AccessPoint[], logs: RoamLogEntry[]) => void)[] = [];
  private pollTimer: number | null = null;
  private cooldownTimer: number | null = null;
  private currentLanguage: Language = 'vi';

  constructor() {
    // Load local storage configuration if any
    const savedConfig = this.loadConfig();
    const savedPassword = this.loadPassword();

    this.accessPoints = [...INITIAL_ACCESS_POINTS];

    this.status = {
      currentSSID: 'Home_WiFi_Mesh',
      band: '5 GHz',
      channel: 'Ch 36 (80 MHz)',
      channelNumber: 36,
      rssi: -52,
      noise: -92,
      txRate: 866,
      status: 'Đã kết nối 5 GHz. Bắt đầu cooldown 30 giây.',
      configuredSSID: savedConfig?.configuredSSID || 'Home_WiFi_Mesh',
      autoLockEnabled: savedConfig?.autoLockEnabled ?? true,
      isLockedTo5G: true,
      isScanning: false,
      isSwitching: false,
      cooldownRemaining: 30,
      pollIntervalSec: 8,
      locationStatus: 'authorized',
      launchAtLogin: savedConfig?.launchAtLogin ?? true,
      lastSwitchTimestamp: Date.now(),
      lastScanTimestamp: null,
      hasPasswordSaved: !!savedPassword,
      vaultSavedSSID: savedConfig?.configuredSSID || 'Home_WiFi_Mesh',
    };

    this.logs = [
      {
        id: 'init-1',
        timestamp: new Date(),
        type: 'status',
        title: 'FiveGLock Service Started',
        message: 'Khởi động dịch vụ giám sát băng tần 5 GHz. Đã nạp cấu hình Keychain.',
      },
      {
        id: 'init-2',
        timestamp: new Date(),
        type: 'lock',
        title: '5 GHz Lock Active',
        message: 'Đang kết nối vào SSID [Home_WiFi_Mesh] tại Ch 36 (5 GHz). Bắt đầu cooldown 30s.',
        details: {
          toBand: '5 GHz',
          toChannel: 36,
          rssi: -52,
          bssid: 'F4:92:BF:88:31:5A'
        }
      }
    ];

    this.startCooldownTimer();
    this.startPollingLoop();
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    this.updateStatusText();
    this.notify();
  }

  public subscribe(listener: (status: WiFiStatus, aps: AccessPoint[], logs: RoamLogEntry[]) => void) {
    this.listeners.push(listener);
    listener(this.status, this.accessPoints, this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener({ ...this.status }, [...this.accessPoints], [...this.logs]));
  }

  private addLog(entry: Omit<RoamLogEntry, 'id' | 'timestamp'>) {
    const newLog: RoamLogEntry = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date(),
    };
    this.logs = [newLog, ...this.logs.slice(0, 99)]; // keep latest 100
    this.notify();
  }

  private updateStatusText() {
    const t = translations[this.currentLanguage];
    if (!this.status.autoLockEnabled) {
      this.status.status = t.statusDisabled;
      return;
    }

    if (this.status.isSwitching) {
      this.status.status = t.statusRequestingRoam;
    } else if (this.status.isScanning) {
      this.status.status = t.scanning;
    } else if (this.status.band === '5 GHz') {
      if (this.status.cooldownRemaining > 0) {
        this.status.status = t.statusConnected5G;
      } else {
        this.status.status = t.statusMonitoring;
      }
    } else {
      this.status.status = t.statusDetected24G;
    }
  }

  private startCooldownTimer() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = window.setInterval(() => {
      if (this.status.cooldownRemaining > 0) {
        this.status.cooldownRemaining -= 1;
        if (this.status.cooldownRemaining === 0) {
          this.updateStatusText();
        }
        this.notify();
      }
    }, 1000);
  }

  private startPollingLoop() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    // Poll every 8 seconds (CoreWLAN poll cycle from FiveGLock binary)
    this.pollTimer = window.setInterval(() => {
      this.executePollCycle();
    }, 8000);
  }

  public executePollCycle() {
    const t = translations[this.currentLanguage];
    if (!this.status.autoLockEnabled) return;

    // If cooldown is active, skip switching to avoid ping-pong
    if (this.status.cooldownRemaining > 0) {
      return;
    }

    // Check if connected SSID matches configured SSID
    if (this.status.configuredSSID && this.status.currentSSID !== this.status.configuredSSID) {
      this.status.status = t.statusWaitingMatch;
      this.notify();
      return;
    }

    // If on 2.4 GHz, initiate scan and auto-switch
    if (this.status.band === '2.4 GHz') {
      this.addLog({
        type: 'warning',
        title: '2.4 GHz Degradation Detected',
        message: `Phát hiện mạng ${this.status.currentSSID} đang ở băng tần 2.4 GHz (Ch ${this.status.channelNumber}). Đang kích hoạt tìm kiếm AP 5 GHz...`,
        details: {
          fromBand: '2.4 GHz',
          fromChannel: this.status.channelNumber,
          rssi: this.status.rssi,
        }
      });
      this.triggerAutoRoamTo5G();
    }
  }

  public triggerAutoRoamTo5G() {
    const t = translations[this.currentLanguage];
    this.status.isScanning = true;
    this.updateStatusText();
    this.notify();

    // Step 1: Scan for 5 GHz APs for current SSID
    setTimeout(() => {
      this.status.isScanning = false;
      const targetAP = this.accessPoints.find(
        ap => ap.ssid === (this.status.configuredSSID || this.status.currentSSID) && ap.band === '5 GHz'
      );

      if (!targetAP) {
        this.status.status = t.statusNoTarget5GAP;
        this.addLog({
          type: 'warning',
          title: '5 GHz AP Not Found',
          message: `Không tìm thấy điểm phát 5 GHz nào cho SSID [${this.status.configuredSSID || this.status.currentSSID}].`,
        });
        this.notify();
        return;
      }

      // Step 2: Request switch to 5 GHz AP
      this.status.isSwitching = true;
      this.status.status = t.statusRequestingRoam;
      this.notify();

      setTimeout(() => {
        // Complete switch
        this.status.band = '5 GHz';
        this.status.channel = `Ch ${targetAP.channel} (${targetAP.channelWidth})`;
        this.status.channelNumber = targetAP.channel;
        this.status.rssi = targetAP.rssi;
        this.status.txRate = 866;
        this.status.isSwitching = false;
        this.status.isLockedTo5G = true;
        this.status.cooldownRemaining = 30;
        this.status.lastSwitchTimestamp = Date.now();

        // Update AP isCurrent flags
        this.accessPoints = this.accessPoints.map(ap => ({
          ...ap,
          isCurrent: ap.bssid === targetAP.bssid,
        }));

        this.updateStatusText();
        this.addLog({
          type: 'switch',
          title: 'Successfully Locked to 5 GHz',
          message: `Đã kết nối lại thành công vào AP 5 GHz [${targetAP.bssid}] trên kênh ${targetAP.channel} (${targetAP.channelWidth}). Kích hoạt cooldown 30s.`,
          details: {
            fromBand: '2.4 GHz',
            toBand: '5 GHz',
            toChannel: targetAP.channel,
            rssi: targetAP.rssi,
            bssid: targetAP.bssid,
          }
        });
        this.notify();
      }, 1200);
    }, 1500);
  }

  public simulateDowngradeTo24G() {
    const ap24 = this.accessPoints.find(ap => ap.ssid === this.status.currentSSID && ap.band === '2.4 GHz') 
      || this.accessPoints.find(ap => ap.band === '2.4 GHz');

    this.status.band = '2.4 GHz';
    this.status.channel = ap24 ? `Ch ${ap24.channel} (${ap24.channelWidth})` : 'Ch 6 (20 MHz)';
    this.status.channelNumber = ap24?.channel || 6;
    this.status.rssi = -45;
    this.status.txRate = 144;
    this.status.cooldownRemaining = 0; // reset cooldown so auto-lock can kick in
    this.status.isLockedTo5G = false;

    this.accessPoints = this.accessPoints.map(ap => ({
      ...ap,
      isCurrent: ap.bssid === ap24?.bssid,
    }));

    this.updateStatusText();
    this.addLog({
      type: 'warning',
      title: 'Simulation: Roamed to 2.4 GHz',
      message: `Mô phỏng máy bị rớt về sóng 2.4 GHz (Ch ${this.status.channelNumber}). FiveGLock sẽ tự động phát hiện và khóa lại 5 GHz sau chu kỳ 8s.`,
      details: {
        fromBand: '5 GHz',
        toBand: '2.4 GHz',
        toChannel: this.status.channelNumber,
        rssi: -45,
      }
    });

    this.notify();

    // Trigger check immediately or on next poll
    if (this.status.autoLockEnabled) {
      setTimeout(() => {
        this.executePollCycle();
      }, 2500);
    }
  }

  public simulateWeakSignal() {
    this.status.rssi = -82;
    this.status.txRate = 260;
    this.addLog({
      type: 'warning',
      title: 'Simulation: Weak Signal Degradation',
      message: 'Mô phỏng suy hao tín hiệu xuống -82 dBm. Tốc độ truyền giảm còn 260 Mbps.',
      details: {
        rssi: -82,
      }
    });
    this.notify();
  }

  public simulateRestoreSignal() {
    this.status.rssi = -50;
    this.status.txRate = 866;
    this.addLog({
      type: 'status',
      title: 'Simulation: Signal Restored',
      message: 'Cường độ sóng phục hồi về mức tối ưu -50 dBm (SNR 42 dB).',
      details: {
        rssi: -50,
      }
    });
    this.notify();
  }

  public forceScan() {
    this.status.isScanning = true;
    this.status.lastScanTimestamp = Date.now();
    this.updateStatusText();
    this.notify();

    setTimeout(() => {
      this.status.isScanning = false;
      // Slight fluctuation in RSSI on fresh scan
      this.accessPoints = this.accessPoints.map(ap => ({
        ...ap,
        rssi: ap.rssi + (Math.floor(Math.random() * 5) - 2),
      }));
      this.updateStatusText();
      this.addLog({
        type: 'scan',
        title: 'CoreWLAN Scan Completed',
        message: `Đã hoàn tất quét phổ Wi-Fi. Tìm thấy ${this.accessPoints.length} Access Points xung quanh.`,
      });
      this.notify();
    }, 1000);
  }

  public lockToAP(targetAP: AccessPoint) {
    this.status.isSwitching = true;
    this.notify();

    setTimeout(() => {
      this.status.currentSSID = targetAP.ssid;
      this.status.configuredSSID = targetAP.ssid;
      this.status.band = targetAP.band;
      this.status.channel = `Ch ${targetAP.channel} (${targetAP.channelWidth})`;
      this.status.channelNumber = targetAP.channel;
      this.status.rssi = targetAP.rssi;
      this.status.txRate = targetAP.band === '5 GHz' ? 866 : 144;
      this.status.isSwitching = false;
      this.status.isLockedTo5G = targetAP.band === '5 GHz';
      this.status.cooldownRemaining = 30;

      this.accessPoints = this.accessPoints.map(ap => ({
        ...ap,
        isCurrent: ap.bssid === targetAP.bssid,
      }));

      this.saveConfig();
      this.updateStatusText();
      this.addLog({
        type: 'lock',
        title: `Manual Lock to AP: ${targetAP.ssid}`,
        message: `Đã chuyển và khóa thủ công vào AP ${targetAP.bssid} (${targetAP.band}, Ch ${targetAP.channel}).`,
        details: {
          toBand: targetAP.band,
          toChannel: targetAP.channel,
          bssid: targetAP.bssid,
          rssi: targetAP.rssi,
        }
      });
      this.notify();
    }, 800);
  }

  public saveConfiguration(ssid: string, password?: string) {
    this.status.configuredSSID = ssid;
    if (password && password.trim().length > 0) {
      this.savePassword(password);
      this.status.hasPasswordSaved = true;
    }
    this.saveConfig();
    this.addLog({
      type: 'status',
      title: 'Configuration Updated',
      message: `Đã lưu cấu hình khóa SSID [${ssid}]. Mật khẩu được mã hóa trong Keychain.`,
    });
    this.notify();
  }

  public toggleAutoLock() {
    this.status.autoLockEnabled = !this.status.autoLockEnabled;
    this.saveConfig();
    this.updateStatusText();
    this.addLog({
      type: 'status',
      title: this.status.autoLockEnabled ? 'Auto-Lock Enabled' : 'Auto-Lock Disabled',
      message: this.status.autoLockEnabled
        ? 'Đã bật tính năng tự động chuyển và khóa 5 GHz.'
        : 'Đã tắt tự động chuyển.',
    });
    this.notify();
  }

  public toggleLaunchAtLogin() {
    this.status.launchAtLogin = !this.status.launchAtLogin;
    this.saveConfig();
    this.addLog({
      type: 'status',
      title: 'Launch at Login Toggled',
      message: this.status.launchAtLogin
        ? 'Đã đăng ký FiveGLock vào macOS Login Items.'
        : 'Đã xóa FiveGLock khỏi Login Items.',
    });
    this.notify();
  }

  public requestLocationPermission() {
    this.status.locationStatus = 'authorized';
    this.addLog({
      type: 'status',
      title: 'Location Permission Granted',
      message: 'CoreLocation đã cấp quyền truy cập vị trí / SSID cho FiveGLock.',
    });
    this.notify();
  }

  public clearLogs() {
    this.logs = [];
    this.notify();
  }

  public resetSimulation() {
    this.accessPoints = [...INITIAL_ACCESS_POINTS];
    this.status.currentSSID = 'Home_WiFi_Mesh';
    this.status.band = '5 GHz';
    this.status.channel = 'Ch 36 (80 MHz)';
    this.status.channelNumber = 36;
    this.status.rssi = -52;
    this.status.txRate = 866;
    this.status.cooldownRemaining = 30;
    this.status.isLockedTo5G = true;
    this.updateStatusText();
    this.addLog({
      type: 'status',
      title: 'Sandbox Reset',
      message: 'Đã thiết lập lại trạng thái ban đầu của môi trường thí nghiệm.',
    });
    this.notify();
  }

  private saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
        configuredSSID: this.status.configuredSSID,
        autoLockEnabled: this.status.autoLockEnabled,
        launchAtLogin: this.status.launchAtLogin,
      }));
    } catch {
      // ignore
    }
  }

  private loadConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private savePassword(pw: string) {
    try {
      // Mock Keychain vault with base64 storage
      localStorage.setItem(STORAGE_KEY_VAULT, btoa(pw));
    } catch {
      // ignore
    }
  }

  private loadPassword() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_VAULT);
      return data ? atob(data) : null;
    } catch {
      return null;
    }
  }
}

export const wifiEngine = new WiFiEngine();
