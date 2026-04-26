import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { useTheme, themes } from './ThemeContext';
import { pluginManager } from '../plugins/PluginSystem';
import { useDevMode } from './developer/DevModeContext';
import { Palette, Settings2, Code2, Shield, Cpu, Sparkles, LayoutPanelTop, Layers } from 'lucide-react';
import { Switch } from './ui/switch';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_PROFILE = "nexus_settings_profile_v1";

function readProfile(): "dev" | "prod" | "test" {
  const raw = localStorage.getItem(STORAGE_PROFILE);
  if (raw === "dev" || raw === "prod" || raw === "test") return raw;
  return "dev";
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('core-modules');
  const [plugins, setPlugins] = useState(pluginManager.getEnabledPlugins());
  const dev = useDevMode();
  const [profile, setProfile] = useState<"dev" | "prod" | "test">("dev");

  useEffect(() => {
    setProfile(readProfile());
    const unsubscribe = pluginManager.subscribe(() => {
      setPlugins(pluginManager.getEnabledPlugins());
    });
    return unsubscribe;
  }, []);

  const coreSections = [
    {
      id: 'core-modules',
      label: 'Módulos',
      icon: Layers,
      component: GeneralSettings,
    },
    {
      id: 'core-system',
      label: 'Sistema',
      icon: Cpu,
      component: () => <SystemSettings profile={profile} setProfile={setProfile} />,
    },
    {
      id: 'core-ui',
      label: 'UI',
      icon: LayoutPanelTop,
      component: UiSettings,
    },
    {
      id: 'themes',
      label: 'Temas',
      icon: Palette,
      component: ThemeSettings,
    },
    {
      id: 'core-ai',
      label: 'IA',
      icon: Sparkles,
      component: AiSettings,
    },
    {
      id: 'core-security',
      label: 'Seguridad',
      icon: Shield,
      component: SecuritySettings,
    },
    // DEV-ID: settings-dev-section
    {
      id: 'developer',
      label: 'Developer',
      icon: Code2,
      component: DeveloperSettings,
    },
  ];

  const pluginSections = [
    ...plugins
      .filter(p => p.settingsComponent)
      .map(p => ({
        id: `plugin-${p.id}`,
        label: p.name,
        icon: p.icon,
        component: p.settingsComponent!
      }))
  ];

  const sections = [...coreSections, ...pluginSections];
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || GeneralSettings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[600px] p-0 overflow-hidden"
        style={{
          backgroundColor: theme.colors.bgSecondary,
          borderColor: theme.colors.border
        }}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r p-4"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border
            }}
          >
            <DialogHeader className="px-2 mb-6">
              <DialogTitle style={{ color: theme.colors.text }}>Configuración</DialogTitle>
              <DialogDescription style={{ color: theme.colors.textSecondary }}>
                Personaliza el sistema
              </DialogDescription>
            </DialogHeader>

            <nav className="space-y-4" data-dev-id="settings-nav">
              <div>
                <div className="px-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Core
                </div>
                <div className="mt-2 space-y-1">
                  {coreSections.map((section) => {
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
                        data-dev-id={`settings-core-${section.id}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="px-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Plugins
                </div>
                <div className="mt-2 space-y-1">
                  {pluginSections.length === 0 ? (
                    <div className="px-3 py-2 text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Sin settings de plugins.
                    </div>
                  ) : (
                    pluginSections.map((section) => {
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
                          data-dev-id={`settings-plugin-${section.id}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{section.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <ActiveComponent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// General Settings Component
function GeneralSettings() {
  const { theme } = useTheme();
  const [plugins, setPlugins] = useState(pluginManager.getAllPlugins());
  const dev = useDevMode();

  useEffect(() => {
    const unsubscribe = pluginManager.subscribe(() => {
      setPlugins(pluginManager.getAllPlugins());
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Módulos Activos
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Activa o desactiva módulos del sistema
        </p>
      </div>

      <div className="space-y-3">
        {plugins.map((plugin) => {
          const Icon = plugin.icon;
          return (
            <div
              key={plugin.id}
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `${theme.colors.primary}20`,
                    color: theme.colors.primary
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: theme.colors.text }}>
                    {plugin.name}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {plugin.description}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={plugin.enabled}
                  onChange={() => {
                    pluginManager.togglePlugin(plugin.id);
                    dev.logEvent("plugin_toggle", `Plugin toggle: ${plugin.id}`, {
                      pluginId: plugin.id,
                      enabled: !plugin.enabled
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: plugin.enabled ? theme.colors.primary : theme.colors.border
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Theme Settings Component
function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const dev = useDevMode();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Seleccionar Tema
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Personaliza la apariencia del sistema
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTheme(t.id);
              dev.logEvent("theme_set", `Theme set: ${t.id}`, { themeId: t.id });
            }}
            className="p-4 rounded-xl border-2 transition-all text-left"
            style={{
              backgroundColor: theme.id === t.id ? `${t.colors.primary}20` : theme.colors.bg,
              borderColor: theme.id === t.id ? t.colors.primary : theme.colors.border
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg"
                style={{ backgroundColor: t.colors.primary }}
              />
              <div>
                <p className="font-semibold" style={{ color: theme.colors.text }}>
                  {t.name}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {t.id}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {[t.colors.primary, t.colors.success, t.colors.warning, t.colors.error].map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SystemSettings({ profile, setProfile }: { profile: "dev" | "prod" | "test"; setProfile: (p: "dev" | "prod" | "test") => void }) {
  const { theme } = useTheme();

  return (
    <div className="space-y-6" data-dev-id="settings-system">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Sistema
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Preferencias globales (UI only por ahora).
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}>
          <div className="font-medium" style={{ color: theme.colors.text }}>Perfil</div>
          <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            Dev / Prod / Test (persistente).
          </div>
          <div className="mt-3 flex items-center gap-2">
            {(["dev", "prod", "test"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  localStorage.setItem(STORAGE_PROFILE, p);
                  setProfile(p);
                }}
                className="px-3 py-1.5 rounded-lg text-sm border"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: profile === p ? `${theme.colors.primary}20` : theme.colors.bgSecondary,
                  color: profile === p ? theme.colors.primary : theme.colors.textSecondary
                }}
                data-dev-id={`settings-profile-${p}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UiSettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6" data-dev-id="settings-ui">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          UI
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Layout, animaciones y densidad (stubs por ahora).
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}>
          <Label className="font-medium" style={{ color: theme.colors.text }}>Animaciones</Label>
          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            Placeholder.
          </p>
          <div className="mt-3">
            <Switch defaultChecked data-dev-id="settings-ui-animations" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AiSettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6" data-dev-id="settings-ai">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          IA
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Proveedor, limites y modo (UI only por ahora).
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}>
          <Label className="font-medium" style={{ color: theme.colors.text }}>Modo</Label>
          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            Manual / asistido / automatico (stub).
          </p>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6" data-dev-id="settings-security">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Seguridad
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Confirmaciones globales y permisos de IA (stubs por ahora).
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}>
          <Label className="font-medium" style={{ color: theme.colors.text }}>Confirmar acciones criticas</Label>
          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            Placeholder.
          </p>
          <div className="mt-3">
            <Switch defaultChecked data-dev-id="settings-security-confirm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// DEV-ID: developer-settings-component
function DeveloperSettings() {
  const { theme } = useTheme();
  const dev = useDevMode();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Developer Mode
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
          Activa el dock derecho para escribir notas de backend y guardar snapshots IA,Dev.
        </p>
      </div>

      <div
        className="flex items-center justify-between p-4 rounded-xl border"
        style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}
        data-dev-id="dev-mode-toggle-row"
      >
        <div>
          <Label className="font-medium" style={{ color: theme.colors.text }}>
            Modo desarrollador
          </Label>
          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            Al activarlo se abre un panel a la derecha con herramientas de notas y guardado.
          </p>
        </div>
        {/* DEV-ID: dev-mode-toggle */}
        <Switch
          checked={dev.enabled}
          onCheckedChange={(v) => {
            dev.setEnabled(Boolean(v));
            dev.logEvent("dev_mode_toggle", `Dev mode: ${v ? "on" : "off"}`, { enabled: Boolean(v) });
          }}
          data-dev-id="dev-mode-toggle"
        />
      </div>
    </div>
  );
}
