import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { DevModeProvider } from './components/developer/DevModeContext';
import { useDevMode } from './components/developer/DevModeContext';
import DevClickTracker from './components/developer/DevClickTracker';
import { RightPanelProvider, useRightPanel } from './components/right-panel/RightPanelContext';
import RightPanelHost from './components/right-panel/RightPanelHost';
import { pluginManager } from './plugins/PluginSystem';
import Dashboard from './components/Dashboard';
import NetworkWatcher from './components/NetworkWatcher';
import SSHTerminal from './components/SSHTerminal';
import CredentialsManager from './components/CredentialsManager';
import NetworkConfig from './components/NetworkConfig';
import AIAssistant from './components/AIAssistant';
import SettingsDialog from './components/SettingsDialog';

// Import plugin settings
import DashboardSettings from './plugins/DashboardPlugin';
import NetworkWatcherSettings from './plugins/NetworkWatcherPlugin';
import SSHTerminalSettings from './plugins/SSHTerminalPlugin';

import {
  LayoutDashboard,
  Wifi,
  Terminal,
  KeyRound,
  Network,
  Sparkles,
  Settings,
  Bot
} from 'lucide-react';

// Register all plugins
pluginManager.registerPlugin({
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Vista general de dispositivos',
  icon: LayoutDashboard,
  enabled: true,
  component: Dashboard,
  settingsComponent: DashboardSettings,
  category: 'core'
});

pluginManager.registerPlugin({
  id: 'network',
  name: 'Network Scanner',
  description: 'Escaneo de red y descubrimiento',
  icon: Wifi,
  enabled: true,
  component: NetworkWatcher,
  settingsComponent: NetworkWatcherSettings,
  category: 'network'
});

pluginManager.registerPlugin({
  id: 'terminal',
  name: 'SSH Terminal',
  description: 'Terminal remota SSH',
  icon: Terminal,
  enabled: true,
  component: SSHTerminal,
  settingsComponent: SSHTerminalSettings,
  category: 'tools'
});

pluginManager.registerPlugin({
  id: 'credentials',
  name: 'Credentials',
  description: 'Gestión de credenciales',
  icon: KeyRound,
  enabled: true,
  component: CredentialsManager,
  category: 'tools'
});

pluginManager.registerPlugin({
  id: 'netconfig',
  name: 'Network Config',
  description: 'Configuración de red local',
  icon: Network,
  enabled: true,
  component: NetworkConfig,
  category: 'network'
});

pluginManager.registerPlugin({
  id: 'ai',
  name: 'AI Assistant',
  description: 'Asistente inteligente',
  icon: Sparkles,
  enabled: true,
  component: AIAssistant,
  category: 'ai'
});

function AppContent() {
  const { theme } = useTheme();
  const dev = useDevMode();
  const rp = useRightPanel();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [enabledPlugins, setEnabledPlugins] = useState(pluginManager.getEnabledPlugins());

  useEffect(() => {
    const unsubscribe = pluginManager.subscribe(() => {
      setEnabledPlugins(pluginManager.getEnabledPlugins());
    });
    return unsubscribe;
  }, []);

  const tabs = enabledPlugins;
  const activePlugin = tabs.find(t => t.id === activeTab);
  const ActiveComponent = activePlugin?.component || (enabledPlugins[0]?.component || Dashboard);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: theme.colors.bg }}>
      {/* DEV-ID: right-panel-mount */}
      <RightPanelHost />
      {/* DEV-ID: click-tracker-mount */}
      <DevClickTracker />
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-20 border-r flex flex-col items-center py-6 z-50"
        style={{
          backgroundColor: theme.colors.bgSecondary,
          borderColor: theme.colors.border
        }}
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow: `0 10px 25px ${theme.colors.primary}20`
            }}
          >
            <Network className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-3">
          {tabs.map((plugin) => {
            const Icon = plugin.icon;
            const isActive = activeTab === plugin.id;
            return (
              <button
                key={plugin.id}
                onClick={() => setActiveTab(plugin.id)}
                className="relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 group"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                    : theme.colors.bg,
                  boxShadow: isActive ? `0 8px 20px ${theme.colors.primary}30` : 'none',
                  color: isActive ? '#ffffff' : theme.colors.textSecondary
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.colors.bgSecondary;
                    e.currentTarget.style.color = theme.colors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.colors.bg;
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }
                }}
                title={plugin.name}
              >
                <Icon className="w-6 h-6" />
                {isActive && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 mb-4"
          style={{
            backgroundColor: theme.colors.bg,
            color: theme.colors.textSecondary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.bgSecondary;
            e.currentTarget.style.color = theme.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.bg;
            e.currentTarget.style.color = theme.colors.textSecondary;
          }}
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* Status Indicator */}
        <div className="mt-auto">
          <div className="w-3 h-3 rounded-full animate-pulse shadow-lg"
            style={{
              backgroundColor: theme.colors.success,
              boxShadow: `0 0 10px ${theme.colors.success}50`
            }}
          />
        </div>
      </aside>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Main Content */}
      {/* DEV-ID: main-content-wrapper */}
      <div className="ml-20" style={{ marginRight: (dev.enabled || rp.aiOpen) ? rp.widthPx : 0 }}>
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-8"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: theme.colors.text }}>
              {activePlugin?.name || 'Dashboard'}
            </h1>
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
              NEXUS OS CORE v15.6
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* DEV-ID: ai-overlay-toggle */}
            <button
              type="button"
              onClick={() => rp.setAiOpen(!rp.aiOpen)}
              className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all"
              style={{
                backgroundColor: rp.aiOpen ? `${theme.colors.primary}20` : theme.colors.bg,
                border: `1px solid ${theme.colors.border}`,
                color: rp.aiOpen ? theme.colors.primary : theme.colors.textSecondary
              }}
              title="AI Overlay"
              data-dev-id="ai-overlay-toggle"
              data-dev-action="toggleAiOverlay"
            >
              <Bot className="w-4 h-4" />
              AI
            </button>
            <div className="px-4 py-1.5 rounded-lg text-sm flex items-center gap-2"
              style={{
                backgroundColor: `${theme.colors.success}10`,
                border: `1px solid ${theme.colors.success}20`,
                color: theme.colors.success
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.success }} />
              Online
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DevModeProvider>
        <RightPanelProvider>
          <AppContent />
        </RightPanelProvider>
      </DevModeProvider>
    </ThemeProvider>
  );
}
