import { useState } from 'react';
import { useTheme } from '../components/ThemeContext';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Settings2,
  Wifi,
  Zap,
  Image,
  Network,
  List
} from 'lucide-react';

interface Subnet {
  id: string;
  name: string;
  base: string;
  enabled: boolean;
}

interface IPRange {
  id: string;
  name: string;
  start: number;
  end: number;
}

export default function NetworkWatcherSettings() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('scan');

  const sections = [
    { id: 'scan', label: 'Escaneo', icon: Zap },
    { id: 'subnets', label: 'Subredes', icon: Network },
    { id: 'ranges', label: 'Rangos IP', icon: List },
    { id: 'icons', label: 'Iconos', icon: Image },
    { id: 'advanced', label: 'Avanzado', icon: Settings2 },
  ];

  const ActiveSection = sections.find(s => s.id === activeSection);

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-48 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left"
              style={{
                backgroundColor: activeSection === section.id ? `${theme.colors.primary}20` : 'transparent',
                color: activeSection === section.id ? theme.colors.primary : theme.colors.textSecondary
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.backgroundColor = `${theme.colors.primary}10`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'scan' && <ScanSettings />}
        {activeSection === 'subnets' && <SubnetsSettings />}
        {activeSection === 'ranges' && <RangesSettings />}
        {activeSection === 'icons' && <IconsSettings />}
        {activeSection === 'advanced' && <AdvancedSettings />}
      </div>
    </div>
  );
}

// Scan Settings
function ScanSettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Configuración de Escaneo
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Ajusta la velocidad y comportamiento del escaneo
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.bg }}>
          <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
            Velocidad de escaneo rápido (ms)
          </Label>
          <Input
            type="number"
            defaultValue="50"
            className="h-10 rounded-lg"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
          <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
            Tiempo entre cada IP en modo rápido
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.bg }}>
          <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
            Velocidad de escaneo lento (ms)
          </Label>
          <Input
            type="number"
            defaultValue="500"
            className="h-10 rounded-lg"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
          <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
            Tiempo entre cada IP en modo lento (más preciso)
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.bg }}>
          <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
            Timeout por dispositivo (ms)
          </Label>
          <Input
            type="number"
            defaultValue="2000"
            className="h-10 rounded-lg"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
        </div>

        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.bg }}>
          <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
            Threads simultáneos
          </Label>
          <Select defaultValue="10">
            <SelectTrigger className="h-10 rounded-lg"
              style={{
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 threads</SelectItem>
              <SelectItem value="10">10 threads</SelectItem>
              <SelectItem value="20">20 threads</SelectItem>
              <SelectItem value="50">50 threads</SelectItem>
              <SelectItem value="100">100 threads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Resolver hostnames (DNS)
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Obtener nombres DNS de dispositivos
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Detectar vendor por MAC
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Identificar fabricante del dispositivo
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Actualización automática
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Re-escanear periódicamente
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}

// Subnets Settings
function SubnetsSettings() {
  const { theme } = useTheme();
  const [subnets, setSubnets] = useState<Subnet[]>([
    { id: '1', name: 'Red Principal', base: '192.168.1.x', enabled: true },
    { id: '2', name: 'Red IoT', base: '192.168.2.x', enabled: true },
    { id: '3', name: 'Red Invitados', base: '10.0.0.x', enabled: false },
  ]);

  const [newSubnet, setNewSubnet] = useState({ name: '', base: '' });

  const handleAddSubnet = () => {
    if (newSubnet.name && newSubnet.base) {
      setSubnets([...subnets, {
        id: Date.now().toString(),
        name: newSubnet.name,
        base: newSubnet.base,
        enabled: true
      }]);
      setNewSubnet({ name: '', base: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Subredes Guardadas
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Gestiona las redes que quieres escanear
        </p>
      </div>

      {/* Add New Subnet */}
      <div className="p-4 rounded-xl border-2 border-dashed"
        style={{
          backgroundColor: theme.colors.bg,
          borderColor: theme.colors.border
        }}
      >
        <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
          Agregar Nueva Subred
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Nombre (ej: Red Casa)"
            value={newSubnet.name}
            onChange={(e) => setNewSubnet({ ...newSubnet, name: e.target.value })}
            className="h-10 rounded-lg"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
          <Input
            placeholder="Base (ej: 192.168.1.x)"
            value={newSubnet.base}
            onChange={(e) => setNewSubnet({ ...newSubnet, base: e.target.value })}
            className="h-10 rounded-lg font-mono"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
        </div>
        <Button
          onClick={handleAddSubnet}
          className="mt-3 w-full h-10 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            color: '#ffffff'
          }}
        >
          Agregar Subred
        </Button>
      </div>

      {/* Subnets List */}
      <div className="space-y-3">
        {subnets.map((subnet) => (
          <div
            key={subnet.id}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              backgroundColor: theme.colors.bg,
              border: `1px solid ${subnet.enabled ? theme.colors.primary + '30' : theme.colors.border}`
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5" style={{ color: theme.colors.primary }} />
                <div>
                  <p className="font-medium" style={{ color: theme.colors.text }}>
                    {subnet.name}
                  </p>
                  <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>
                    {subnet.base}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={subnet.enabled}
                onCheckedChange={() => {
                  setSubnets(subnets.map(s =>
                    s.id === subnet.id ? { ...s, enabled: !s.enabled } : s
                  ));
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubnets(subnets.filter(s => s.id !== subnet.id))}
                style={{ color: theme.colors.error }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ranges Settings
function RangesSettings() {
  const { theme } = useTheme();
  const [ranges, setRanges] = useState<IPRange[]>([
    { id: '1', name: 'Full Range', start: 1, end: 254 },
    { id: '2', name: 'Rango Bajo', start: 1, end: 50 },
    { id: '3', name: 'Rango Medio', start: 100, end: 150 },
    { id: '4', name: 'Rango Alto', start: 200, end: 254 },
  ]);

  const [newRange, setNewRange] = useState({ name: '', start: '', end: '' });

  const handleAddRange = () => {
    if (newRange.name && newRange.start && newRange.end) {
      setRanges([...ranges, {
        id: Date.now().toString(),
        name: newRange.name,
        start: parseInt(newRange.start),
        end: parseInt(newRange.end)
      }]);
      setNewRange({ name: '', start: '', end: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Rangos de IP Personalizados
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Define rangos específicos para escanear
        </p>
      </div>

      {/* Add New Range */}
      <div className="p-4 rounded-xl border-2 border-dashed"
        style={{
          backgroundColor: theme.colors.bg,
          borderColor: theme.colors.border
        }}
      >
        <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
          Agregar Nuevo Rango
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Nombre"
            value={newRange.name}
            onChange={(e) => setNewRange({ ...newRange, name: e.target.value })}
            className="h-10 rounded-lg"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
          <Input
            type="number"
            placeholder="Inicio (1-254)"
            value={newRange.start}
            onChange={(e) => setNewRange({ ...newRange, start: e.target.value })}
            min="1"
            max="254"
            className="h-10 rounded-lg font-mono"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
          <Input
            type="number"
            placeholder="Fin (1-254)"
            value={newRange.end}
            onChange={(e) => setNewRange({ ...newRange, end: e.target.value })}
            min="1"
            max="254"
            className="h-10 rounded-lg font-mono"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
        </div>
        <Button
          onClick={handleAddRange}
          className="mt-3 w-full h-10 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            color: '#ffffff'
          }}
        >
          Agregar Rango
        </Button>
      </div>

      {/* Ranges List */}
      <div className="space-y-3">
        {ranges.map((range) => (
          <div
            key={range.id}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              backgroundColor: theme.colors.bg,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>
                {range.name}
              </p>
              <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>
                {range.start} - {range.end} ({range.end - range.start + 1} IPs)
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRanges(ranges.filter(r => r.id !== range.id))}
              style={{ color: theme.colors.error }}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icons Settings
function IconsSettings() {
  const { theme } = useTheme();

  const deviceTypes = [
    { id: 'router', name: 'Router', icon: '🌐' },
    { id: 'printer3d', name: 'Impresora 3D', icon: '🖨️' },
    { id: 'raspberry', name: 'Raspberry Pi', icon: '🥧' },
    { id: 'esp32', name: 'ESP32', icon: '📡' },
    { id: 'mobile', name: 'Móvil', icon: '📱' },
    { id: 'pc', name: 'Computadora', icon: '💻' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Iconos de Dispositivos
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Personaliza los iconos que aparecen en la tabla
        </p>
      </div>

      <div className="space-y-3">
        {deviceTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              backgroundColor: theme.colors.bg,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${theme.colors.primary}20` }}
              >
                {type.icon}
              </div>
              <div>
                <p className="font-medium" style={{ color: theme.colors.text }}>
                  {type.name}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  Tipo: {type.id}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.text
              }}
            >
              Cambiar Icono
            </Button>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl"
        style={{
          backgroundColor: `${theme.colors.warning}20`,
          border: `1px solid ${theme.colors.warning}30`
        }}
      >
        <p className="text-sm" style={{ color: theme.colors.warning }}>
          💡 Pronto podrás subir iconos personalizados en formato SVG
        </p>
      </div>
    </div>
  );
}

// Advanced Settings
function AdvancedSettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Configuración Avanzada
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Opciones avanzadas del sistema de escaneo
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Guardar caché de escaneos
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Para escaneos rápidos con ⚡
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Sonido al completar escaneo
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Notificación sonora
            </p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Logs detallados
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Guardar logs de todos los escaneos
            </p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Auto-registro de dispositivos
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Registrar automáticamente en Device Manager
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.bg }}>
          <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
            Intervalo de actualización (segundos)
          </Label>
          <Input
            type="number"
            defaultValue="60"
            className="h-10 rounded-lg"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
          <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
            Cuando auto-actualización está activa
          </p>
        </div>
      </div>
    </div>
  );
}
