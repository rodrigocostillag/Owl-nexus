import { useState } from 'react';
import { useTheme } from './ThemeContext';
import {
  Printer,
  Cpu,
  Wifi,
  Monitor,
  ExternalLink,
  Terminal,
  Settings,
  Power,
  Activity,
  KeyRound
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'printer3d' | 'raspberry' | 'esp32' | 'router' | 'other';
  ip: string;
  status: 'online' | 'offline' | 'idle';
  webInterface?: string;
  customInterface?: string;
  credentials?: string;
}

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Ender 3 Pro',
    type: 'printer3d',
    ip: '192.168.1.100',
    status: 'online',
    webInterface: 'http://192.168.1.100',
    customInterface: 'moonraker',
    credentials: 'printer-admin'
  },
  {
    id: '2',
    name: 'Pi 4 - OctoPrint',
    type: 'raspberry',
    ip: '192.168.1.101',
    status: 'online',
    webInterface: 'http://192.168.1.101:5000',
    credentials: 'pi-default'
  },
  {
    id: '3',
    name: 'ESP32 - Home Control',
    type: 'esp32',
    ip: '192.168.1.102',
    status: 'idle',
    webInterface: 'http://192.168.1.102',
    credentials: 'esp-admin'
  },
  {
    id: '4',
    name: 'OpenWrt Router',
    type: 'router',
    ip: '192.168.1.1',
    status: 'online',
    webInterface: 'http://192.168.1.1',
    customInterface: 'openwrt',
    credentials: 'router-admin'
  }
];

const getDeviceIcon = (type: Device['type']) => {
  switch (type) {
    case 'printer3d':
      return <Printer className="w-6 h-6" />;
    case 'raspberry':
      return <Cpu className="w-6 h-6" />;
    case 'esp32':
      return <Cpu className="w-6 h-6" />;
    case 'router':
      return <Wifi className="w-6 h-6" />;
    default:
      return <Monitor className="w-6 h-6" />;
  }
};

const getStatusColor = (status: Device['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-red-500';
    case 'idle':
      return 'bg-yellow-500';
  }
};

export default function Dashboard() {
  const { theme } = useTheme();
  const [devices] = useState<Device[]>(mockDevices);

  const handleSSHConnect = (device: Device) => {
    console.log('SSH Connect to:', device);
    // TODO: Implement SSH connection - will open SSH terminal with this device
  };

  const handleWebInterface = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCustomInterface = (type: string, device: Device) => {
    console.log('Open custom interface:', type, device);
    // TODO: Implement custom interface routing
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-6 border"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Devices</p>
            <Monitor className="w-5 h-5" style={{ color: theme.colors.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: theme.colors.text }}>{devices.length}</p>
        </div>
        <div className="rounded-2xl p-6 border"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Online</p>
            <Activity className="w-5 h-5" style={{ color: theme.colors.success }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: theme.colors.success }}>
            {devices.filter(d => d.status === 'online').length}
          </p>
        </div>
        <div className="rounded-2xl p-6 border"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Idle</p>
            <Power className="w-5 h-5" style={{ color: theme.colors.warning }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: theme.colors.warning }}>
            {devices.filter(d => d.status === 'idle').length}
          </p>
        </div>
        <div className="rounded-2xl p-6 border"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Offline</p>
            <Power className="w-5 h-5" style={{ color: theme.colors.error }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: theme.colors.error }}>
            {devices.filter(d => d.status === 'offline').length}
          </p>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className="rounded-2xl p-6 border transition-all group"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${theme.colors.primary}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${theme.colors.primary}15`,
                    color: theme.colors.primary
                  }}
                >
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: theme.colors.text }}>{device.name}</h3>
                  <p className="text-xs font-mono mt-0.5" style={{ color: theme.colors.textSecondary }}>{device.ip}</p>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${device.status === 'online' ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: device.status === 'online' ? theme.colors.success :
                                   device.status === 'idle' ? theme.colors.warning :
                                   theme.colors.error
                }}
              />
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: theme.colors.bg,
                  color: theme.colors.textSecondary
                }}
              >
                {device.type}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: device.status === 'online' ? `${theme.colors.success}20` :
                                   device.status === 'idle' ? `${theme.colors.warning}20` :
                                   `${theme.colors.error}20`,
                  color: device.status === 'online' ? theme.colors.success :
                         device.status === 'idle' ? theme.colors.warning :
                         theme.colors.error
                }}
              >
                {device.status}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSSHConnect(device)}
                className="px-4 py-2.5 border rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.border,
                  color: theme.colors.textSecondary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.primary}20`;
                  e.currentTarget.style.borderColor = `${theme.colors.primary}50`;
                  e.currentTarget.style.color = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.bg;
                  e.currentTarget.style.borderColor = theme.colors.border;
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
              >
                <Terminal className="w-4 h-4" />
                SSH
              </button>
              {device.webInterface && (
                <button
                  onClick={() => handleWebInterface(device.webInterface!)}
                  className="px-4 py-2.5 border rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                    color: theme.colors.textSecondary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.accent}20`;
                    e.currentTarget.style.borderColor = `${theme.colors.accent}50`;
                    e.currentTarget.style.color = theme.colors.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bg;
                    e.currentTarget.style.borderColor = theme.colors.border;
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Web
                </button>
              )}
            </div>

            {device.customInterface && (
              <button
                onClick={() => handleCustomInterface(device.customInterface!, device)}
                className="w-full mt-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: `${theme.colors.accent}20`,
                  borderColor: `${theme.colors.accent}30`,
                  color: theme.colors.accent
                }}
              >
                <Settings className="w-4 h-4" />
                {device.customInterface === 'moonraker' ? 'Moonraker' :
                 device.customInterface === 'openwrt' ? 'OpenWrt' :
                 'Custom'}
              </button>
            )}

            {device.credentials && (
              <div className="mt-3 pt-3 flex items-center gap-2 text-xs"
                style={{
                  borderTop: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textSecondary
                }}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{device.credentials}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
