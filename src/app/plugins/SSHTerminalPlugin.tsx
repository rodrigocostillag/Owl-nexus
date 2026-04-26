import { useTheme } from '../components/ThemeContext';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function SSHTerminalSettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Configuración SSH Terminal
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Personaliza tu experiencia de terminal
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.bg }}>
          <Label className="font-medium mb-3 block" style={{ color: theme.colors.text }}>
            Timeout de conexión (segundos)
          </Label>
          <Input
            type="number"
            defaultValue="30"
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
            Tamaño de fuente
          </Label>
          <Select defaultValue="14">
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
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Auto-reconexión
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Reconectar automáticamente si se pierde conexión
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Guardar historial de comandos
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Acceder con ↑ ↓
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Copiar al seleccionar
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Copiar texto seleccionado automáticamente
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
