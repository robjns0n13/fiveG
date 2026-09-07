# FiveGLock

macOS Wi-Fi 5 GHz Band Lock and Roaming Manager.

## Overview
FiveGLock monitors your active Wi-Fi connection and automatically locks your connection to high-speed 5 GHz access points whenever macOS roams down to 2.4 GHz on combined dual-band SSIDs.

## Key Features
- **Auto-Lock 5 GHz**: Automatically scans and associates back to 5 GHz BSSIDs when degraded to 2.4 GHz.
- **8s Polling & 30s Cooldown**: Intelligent roaming loop that prevents ping-pong reconnection loops.
- **Wi-Fi Scanner**: Full scan of surrounding 2.4 GHz, 5 GHz, and 6 GHz access points with RSSI, noise, SNR, channel width, and PHY mode.
- **macOS Menu Bar Popover**: Quick status view and controls.
- **Event Logging**: Real-time timestamps of roaming and radio events with JSON export.
- **Simulation Sandbox**: Interactive testing to simulate 2.4 GHz degradation, signal loss, and auto-recovery.
