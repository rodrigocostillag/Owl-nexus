import { useTheme } from '../components/ThemeContext';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';

export default function DashboardSettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Configuración del Dashboard
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Personaliza cómo se muestran tus dispositivos
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Vista de cuadrícula compacta
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Muestra más dispositivos en pantalla
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Auto-refresh
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Actualiza el estado cada 30 segundos
            </p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Mostrar estadísticas
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Muestra las cards de resumen arriba
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div>
            <Label className="font-medium" style={{ color: theme.colors.text }}>
              Animaciones
            </Label>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Efectos visuales y transiciones
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}
