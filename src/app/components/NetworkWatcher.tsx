import { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Search,
  RefreshCw,
  Save,
  Monitor,
  Smartphone,
  Printer,
  Wifi,
  Router,
  Zap,
  Settings,
  X,
  Pause
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface NetworkDevice {
  ip: string;
  ipv6: string;
  mac: string;
  hostname: string;
  vendor: string;
  type?: string;
  saved: boolean;
  active: boolean;
  username: string;
  usertext: string;
}

const mockScanResults: NetworkDevice[] = [
  { ip: '192.168.1.1', ipv6: 'fe80::1', mac: 'AA:BB:CC:DD:EE:01', hostname: 'router.local', vendor: 'TP-Link', type: 'router', saved: true, active: true, username: 'admin', usertext: 'Router principal' },
  { ip: '192.168.1.100', ipv6: 'fe80::100', mac: 'AA:BB:CC:DD:EE:02', hostname: 'ender3.local', vendor: 'Unknown', type: 'printer3d', saved: true, active: true, username: 'pi', usertext: 'Impresora 3D' },
  { ip: '192.168.1.101', ipv6: 'fe80::101', mac: 'AA:BB:CC:DD:EE:03', hostname: 'raspberrypi.local', vendor: 'Raspberry Pi Foundation', type: 'raspberry', saved: true, active: true, username: 'pi', usertext: 'OctoPrint' },
  { ip: '192.168.1.102', ipv6: 'fe80::102', mac: 'AA:BB:CC:DD:EE:04', hostname: 'esp32-home', vendor: 'Espressif', type: 'esp32', saved: true, active: false, username: 'admin', usertext: 'Control domótico' },
  { ip: '192.168.1.105', ipv6: 'fe80::105', mac: 'AA:BB:CC:DD:EE:05', hostname: 'unknown', vendor: 'Unknown', saved: false, active: true, username: '', usertext: '' },
  { ip: '192.168.1.110', ipv6: 'fe80::110', mac: 'AA:BB:CC:DD:EE:06', hostname: 'laptop', vendor: 'Dell', saved: false, active: true, username: '', usertext: '' },
];

interface Column {
  id: string;
  label: string;
  width: number;
  visible: boolean;
}

export default function NetworkWatcher() {
  const { theme } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [fastScanning, setFastScanning] = useState(false);
  const [devices, setDevices] = useState<NetworkDevice[]>(mockScanResults);
  const [selectedSubnet, setSelectedSubnet] = useState('192.168.1.0/24');
  const [selectedRange, setSelectedRange] = useState('1-254');
  const [configOpen, setConfigOpen] = useState(false);
  const [myDevices] = useState([
    { name: 'WiFi', ip: '192.168.1.50' },
    { name: 'Ethernet', ip: '192.168.1.51' },
  ]);
  const [selectedMyDevice, setSelectedMyDevice] = useState(0);
  const [mySubnet] = useState('255.255.255.0');
  const [myGateway] = useState('192.168.1.1');
  const [scanningIPs, setScanningIPs] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ ip: string; field: string } | null>(null);
  const [hoveredSaveButton, setHoveredSaveButton] = useState<string | null>(null);

  const [columns, setColumns] = useState<Column[]>([
    { id: 'type', label: 'Tipo', width: 80, visible: true },
    { id: 'ip', label: 'IP Address', width: 140, visible: true },
    { id: 'ipv6', label: 'IPv6', width: 180, visible: true },
    { id: 'mac', label: 'MAC Address', width: 150, visible: true },
    { id: 'hostname', label: 'Hostname', width: 150, visible: true },
    { id: 'vendor', label: 'Vendor', width: 150, visible: true },
    { id: 'username', label: 'Username', width: 120, visible: true },
    { id: 'usertext', label: 'User Text', width: 180, visible: true },
    { id: 'actions', label: 'Acciones', width: 80, visible: true },
  ]);

  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);
  const [dragging, setDragging] = useState<{ columnId: string; startIndex: number } | null>(null);

  // DEV-ID: networkwatcher-scan-loop
  const scanIntervalRef = useRef<number | null>(null);
  const scanStateRef = useRef<{ currentIP: number; end: number; baseIP: string } | null>(null);

  const stopScan = () => {
    if (scanIntervalRef.current !== null) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    scanStateRef.current = null;
    setScanning(false);
    setScanPaused(false);
    setScanningIPs([]);
  };

  useEffect(() => {
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = () => {
    if (scanning) {
      // Toggle pause/resume
      setScanPaused((p) => !p);
    } else {
      setScanning(true);
      const baseIP = selectedSubnet.split('.').slice(0, 3).join('.');
      const [start, end] = selectedRange.split('-').map(Number);

      scanStateRef.current = { currentIP: start, end, baseIP };
      setScanPaused(false);

      if (scanIntervalRef.current !== null) {
        window.clearInterval(scanIntervalRef.current);
      }

      // Simulación tipo "ping loop" (no backend todavía): avanza IP por IP.
      scanIntervalRef.current = window.setInterval(() => {
        const st = scanStateRef.current;
        if (!st) return;
        if (scanPaused) return;

        if (st.currentIP <= st.end) {
          const ip = `${st.baseIP}.${st.currentIP}`;
          setScanningIPs((prev) => [...prev.slice(-5), ip]);
          st.currentIP++;
        } else {
          stopScan();
        }
      }, 110);
    }
  };

  const handleFastScan = () => {
    setFastScanning(true);
    setTimeout(() => {
      setFastScanning(false);
    }, 500);
  };

  const handleRefresh = () => {
    // Refresh current results
    console.log('Refreshing...');
  };

  const handleToggleSave = (ip: string) => {
    setDevices(devices.map(d =>
      d.ip === ip ? { ...d, saved: !d.saved } : d
    ));
  };

  const handleUpdateField = (ip: string, field: 'username' | 'usertext', value: string) => {
    setDevices(devices.map(d =>
      d.ip === ip ? { ...d, [field]: value } : d
    ));
    setEditingCell(null);
  };

  const handleDoubleClick = (ip: string, field: string) => {
    setEditingCell({ ip, field });
  };

  const getDeviceIcon = (type?: string, active: boolean = true) => {
    const iconClass = `w-5 h-5 ${active ? '' : 'opacity-30'}`;
    const iconStyle = { color: active ? theme.colors.primary : theme.colors.textSecondary };

    switch (type) {
      case 'router':
        return <Router className={iconClass} style={iconStyle} />;
      case 'printer3d':
        return <Printer className={iconClass} style={iconStyle} />;
      case 'raspberry':
      case 'esp32':
        return <Wifi className={iconClass} style={iconStyle} />;
      case 'mobile':
        return <Smartphone className={iconClass} style={iconStyle} />;
      default:
        return <Monitor className={iconClass} style={iconStyle} />;
    }
  };

  const handleMouseDown = (columnId: string, e: React.MouseEvent) => {
    const column = columns.find(c => c.id === columnId);
    if (column) {
      setResizing({ columnId, startX: e.clientX, startWidth: column.width });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing) {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + diff);
      setColumns(columns.map(c =>
        c.id === resizing.columnId ? { ...c, width: newWidth } : c
      ));
    }
  };

  const handleMouseUp = () => {
    setResizing(null);
    setDragging(null);
  };

  const handleDragStart = (columnId: string, index: number) => {
    setDragging({ columnId, startIndex: index });
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragging && dragging.startIndex !== targetIndex) {
      const visibleColumns = columns.filter(c => c.visible);
      const newColumns = [...visibleColumns];
      const [removed] = newColumns.splice(dragging.startIndex, 1);
      newColumns.splice(targetIndex, 0, removed);

      // Update full columns array maintaining visibility
      const reorderedColumns = newColumns.concat(
        columns.filter(c => !c.visible)
      );
      setColumns(reorderedColumns);
      setDragging({ ...dragging, startIndex: targetIndex });
    }
  };

  useState(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="rounded-2xl p-6 border"
        style={{
          backgroundColor: theme.colors.bgSecondary,
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <h3 className="font-semibold" style={{ color: theme.colors.text }}>Mis Dispositivos de Red</h3>
            <div className="flex items-center gap-4">
              {myDevices.map((device, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMyDevice(idx)}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: selectedMyDevice === idx ? `${theme.colors.primary}20` : theme.colors.bg,
                    borderColor: selectedMyDevice === idx ? theme.colors.primary : theme.colors.border,
                    border: '1px solid',
                    color: selectedMyDevice === idx ? theme.colors.primary : theme.colors.textSecondary
                  }}
                >
                  <span className="opacity-60">{device.name}: </span>
                  <span className="font-mono font-semibold">{device.ip}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: theme.colors.textSecondary }}>
              <div>
                <span className="opacity-60">Subnet: </span>
                <span className="font-mono" style={{ color: theme.colors.primary }}>{mySubnet}</span>
              </div>
              <div>
                <span className="opacity-60">Gateway: </span>
                <span className="font-mono" style={{ color: theme.colors.primary }}>{myGateway}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfigOpen(true)}
            className="p-2 rounded-lg transition-all"
            style={{
              backgroundColor: theme.colors.bg,
              color: theme.colors.textSecondary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Subnet Selector */}
          <div className="md:col-span-3">
            <Label className="text-sm mb-2 block" style={{ color: theme.colors.textSecondary }}>
              Subred a escanear
            </Label>
            <Select value={selectedSubnet} onValueChange={setSelectedSubnet}>
              <SelectTrigger className="h-11 rounded-xl"
                style={{
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="192.168.1.0/24">192.168.1.0/24</SelectItem>
                <SelectItem value="192.168.0.0/24">192.168.0.0/24</SelectItem>
                <SelectItem value="10.0.0.0/24">10.0.0.0/24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Range Selector */}
          <div className="md:col-span-2">
            <Label className="text-sm mb-2 block" style={{ color: theme.colors.textSecondary }}>
              Rango
            </Label>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="h-11 rounded-xl"
                style={{
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-254">1-254 (Full)</SelectItem>
                <SelectItem value="1-50">1-50</SelectItem>
                <SelectItem value="100-150">100-150</SelectItem>
                <SelectItem value="200-254">200-254</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-7 flex items-end gap-2">
            <button
              onClick={handleFastScan}
              disabled={fastScanning}
              className="h-11 w-11 rounded-xl transition-all flex items-center justify-center"
              style={{
                backgroundColor: `${theme.colors.warning}20`,
                borderColor: `${theme.colors.warning}30`,
                border: '1px solid',
                color: theme.colors.warning
              }}
              title="Escaneo rápido (caché local)"
            >
              {fastScanning ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1 relative group">
              <button
                onClick={handleScan}
                // DEV-ID: networkwatcher-start-scan
                data-dev-id="networkwatcher-start-scan"
                data-dev-action="handleScan"
                data-dev-backend={"Implementar backend para iniciar/pausar escaneo de red.\n- input: subnet, range\n- output: streaming de IPs y status\n- persistir ultimos resultados"} 
                data-dev-ia={"Definir como la IA debe guiar/validar el flujo de escaneo.\n- que mostrar en UI\n- when pausar/reanudar\n- validaciones y errores"} 
                className="w-full h-11 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg px-3"
                style={{
                  background: scanning ? theme.colors.bg : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  color: scanning ? theme.colors.text : '#ffffff',
                  boxShadow: scanning ? 'none' : `0 4px 12px ${theme.colors.primary}30`,
                  border: scanning ? `1px solid ${theme.colors.border}` : 'none'
                }}
              >
                {scanning ? (
                  <>
                    <RefreshCw className={`w-5 h-5 ${scanPaused ? '' : 'animate-spin'}`} />
                    <div className="flex flex-col items-start">
                      <span>{scanPaused ? 'Pausado' : 'Escaneando...'}</span>
                      {scanningIPs.length > 0 && (
                        <span className="text-xs opacity-70 font-mono">
                          {scanningIPs[scanningIPs.length - 1]}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Start Scan
                  </>
                )}
              </button>

              {scanning && (
                <div className="absolute top-full mt-2 left-0 right-0 p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  <div className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
                    <div className="font-semibold mb-1" style={{ color: theme.colors.text }}>
                      Escaneando:
                    </div>
                    {scanningIPs.slice(-3).map((ip, idx) => (
                      <div key={idx} style={{ color: theme.colors.primary }}>
                        → {ip}
                      </div>
                    ))}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScanPaused((p) => !p)}
                        className="px-2 py-1 rounded-md border text-xs"
                        style={{
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.bg,
                          color: theme.colors.text,
                        }}
                        // DEV-ID: networkwatcher-scan-pause
                        data-dev-id="networkwatcher-scan-pause"
                        data-dev-action="setScanPaused"
                      >
                        {scanPaused ? "Reanudar" : "Pausar"}
                      </button>
                      <button
                        type="button"
                        onClick={stopScan}
                        className="px-2 py-1 rounded-md border text-xs"
                        style={{
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.bg,
                          color: theme.colors.text,
                        }}
                        // DEV-ID: networkwatcher-scan-stop
                        data-dev-id="networkwatcher-scan-stop"
                        data-dev-action="stopScan"
                      >
                        Detener
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className="h-11 w-11 rounded-xl transition-all flex items-center justify-center"
              style={{
                backgroundColor: `${theme.colors.primary}20`,
                borderColor: `${theme.colors.primary}30`,
                border: '1px solid',
                color: theme.colors.primary
              }}
              title="Actualizar resultados"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: theme.colors.bgSecondary,
          borderColor: theme.colors.border
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                {columns.filter(c => c.visible).map((column, index) => (
                  <th
                    key={column.id}
                    draggable
                    onDragStart={() => handleDragStart(column.id, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDragging(null)}
                    className="text-left px-4 py-3 relative group cursor-move"
                    style={{
                      width: `${column.width}px`,
                      color: theme.colors.textSecondary,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      userSelect: 'none'
                    }}
                  >
                    {column.label}
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: theme.colors.primary }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(column.id, e);
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr
                  key={device.ip}
                  className="transition-colors"
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.find(c => c.id === 'type')?.visible && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {getDeviceIcon(device.type, device.active)}
                      </div>
                    </td>
                  )}
                  {columns.find(c => c.id === 'ip')?.visible && (
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: theme.colors.primary }}>
                      {device.ip}
                    </td>
                  )}
                  {columns.find(c => c.id === 'ipv6')?.visible && (
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: theme.colors.textSecondary }}>
                      {device.ipv6}
                    </td>
                  )}
                  {columns.find(c => c.id === 'mac')?.visible && (
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: theme.colors.textSecondary }}>
                      {device.mac}
                    </td>
                  )}
                  {columns.find(c => c.id === 'hostname')?.visible && (
                    <td className="px-4 py-3" style={{ color: theme.colors.text }}>
                      {device.hostname}
                    </td>
                  )}
                  {columns.find(c => c.id === 'vendor')?.visible && (
                    <td className="px-4 py-3 text-sm" style={{ color: theme.colors.textSecondary }}>
                      {device.vendor}
                    </td>
                  )}
                  {columns.find(c => c.id === 'username')?.visible && (
                    <td className="px-4 py-3" onDoubleClick={() => handleDoubleClick(device.ip, 'username')}>
                      {editingCell?.ip === device.ip && editingCell?.field === 'username' ? (
                        <input
                          type="text"
                          value={device.username}
                          onChange={(e) => handleUpdateField(device.ip, 'username', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                          style={{
                            borderColor: theme.colors.primary,
                            color: theme.colors.text
                          }}
                          placeholder="username"
                        />
                      ) : (
                        <span className="text-sm" style={{ color: theme.colors.text }}>
                          {device.username || 'doble click para editar'}
                        </span>
                      )}
                    </td>
                  )}
                  {columns.find(c => c.id === 'usertext')?.visible && (
                    <td className="px-4 py-3" onDoubleClick={() => handleDoubleClick(device.ip, 'usertext')}>
                      {editingCell?.ip === device.ip && editingCell?.field === 'usertext' ? (
                        <input
                          type="text"
                          value={device.usertext}
                          onChange={(e) => handleUpdateField(device.ip, 'usertext', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                          style={{
                            borderColor: theme.colors.primary,
                            color: theme.colors.text
                          }}
                          placeholder="nota..."
                        />
                      ) : (
                        <span className="text-sm" style={{ color: theme.colors.text }}>
                          {device.usertext || 'doble click para editar'}
                        </span>
                      )}
                    </td>
                  )}
                  {columns.find(c => c.id === 'actions')?.visible && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleSave(device.ip)}
                        onMouseEnter={() => setHoveredSaveButton(device.ip)}
                        onMouseLeave={() => setHoveredSaveButton(null)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: hoveredSaveButton === device.ip && device.saved
                            ? `${theme.colors.error}20`
                            : device.saved
                            ? `${theme.colors.success}20`
                            : `${theme.colors.warning}20`,
                          color: hoveredSaveButton === device.ip && device.saved
                            ? theme.colors.error
                            : device.saved
                            ? theme.colors.success
                            : theme.colors.warning
                        }}
                        title={device.saved ? 'Click para remover' : 'Click para guardar'}
                      >
                        {hoveredSaveButton === device.ip && device.saved ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-2xl"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}
        >
          <DialogHeader>
            <DialogTitle>Configuración de Network Watcher</DialogTitle>
            <DialogDescription style={{ color: theme.colors.textSecondary }}>
              Personaliza qué columnas mostrar en la tabla
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold mb-3" style={{ color: theme.colors.text }}>
                Columnas Visibles
              </h4>
              <div className="space-y-2">
                {columns.map((column) => (
                  <div key={column.id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.colors.bg }}
                  >
                    <span style={{ color: theme.colors.text }}>{column.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => {
                          setColumns(columns.map(c =>
                            c.id === column.id ? { ...c, visible: !c.visible } : c
                          ));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          backgroundColor: theme.colors.bg,
                          border: `1px solid ${theme.colors.border}`
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
