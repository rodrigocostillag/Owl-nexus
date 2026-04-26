import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PluginConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  component: React.ComponentType<any>;
  settingsComponent?: React.ComponentType<any>;
  category?: 'core' | 'network' | 'tools' | 'ai';
}

export interface PluginRegistry {
  [key: string]: PluginConfig;
}

// Plugin Manager
export class PluginManager {
  private static instance: PluginManager;
  private plugins: PluginRegistry = {};
  private listeners: (() => void)[] = [];

  private constructor() {}

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  registerPlugin(plugin: PluginConfig) {
    this.plugins[plugin.id] = plugin;
    this.notifyListeners();
  }

  unregisterPlugin(pluginId: string) {
    delete this.plugins[pluginId];
    this.notifyListeners();
  }

  getPlugin(pluginId: string): PluginConfig | undefined {
    return this.plugins[pluginId];
  }

  getAllPlugins(): PluginConfig[] {
    return Object.values(this.plugins);
  }

  getEnabledPlugins(): PluginConfig[] {
    return Object.values(this.plugins).filter(p => p.enabled);
  }

  togglePlugin(pluginId: string) {
    if (this.plugins[pluginId]) {
      this.plugins[pluginId].enabled = !this.plugins[pluginId].enabled;
      this.notifyListeners();
    }
  }

  setPluginEnabled(pluginId: string, enabled: boolean) {
    if (this.plugins[pluginId]) {
      this.plugins[pluginId].enabled = enabled;
      this.notifyListeners();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const pluginManager = PluginManager.getInstance();
