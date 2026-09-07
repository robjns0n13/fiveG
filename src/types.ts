export type BandType = '2.4 GHz' | '5 GHz' | '6 GHz' | '--';

export interface AccessPoint {
  bssid: string;
  ssid: string;
  band: BandType;
  channel: number;
  channelWidth: '20 MHz' | '40 MHz' | '80 MHz' | '160 MHz';
  rssi: number; // e.g. -48 dBm
  noise: number; // e.g. -92 dBm
  snr: number; // rssi - noise
  security: 'WPA2 Personal' | 'WPA3 Personal' | 'WPA2/WPA3 Mixed' | 'Open' | 'WPA2 Enterprise';
  isCurrent: boolean;
  isTarget5G: boolean;
  phyMode: '802.11ax (Wi-Fi 6)' | '802.11ac (Wi-Fi 5)' | '802.11n (Wi-Fi 4)' | '802.11be (Wi-Fi 7)';
}

export interface WiFiStatus {
  currentSSID: string;
  band: BandType;
  channel: string;
  channelNumber: number;
  rssi: number;
  noise: number;
  txRate: number; // Mbps
  status: string;
  configuredSSID: string;
  autoLockEnabled: boolean;
  isLockedTo5G: boolean;
  isScanning: boolean;
  isSwitching: boolean;
  cooldownRemaining: number; // seconds remaining in cooldown
  pollIntervalSec: number; // default 8s
  locationStatus: 'authorized' | 'denied' | 'restricted' | 'notDetermined' | 'disabled';
  launchAtLogin: boolean;
  lastSwitchTimestamp: number | null;
  lastScanTimestamp: number | null;
  hasPasswordSaved: boolean;
  vaultSavedSSID: string;
}

export interface RoamLogEntry {
  id: string;
  timestamp: Date;
  type: 'scan' | 'switch' | 'lock' | 'status' | 'warning' | 'error';
  title: string;
  message: string;
  details?: {
    fromBand?: string;
    toBand?: string;
    fromChannel?: number;
    toChannel?: number;
    rssi?: number;
    bssid?: string;
  };
}

export type Language = 'vi' | 'en';
