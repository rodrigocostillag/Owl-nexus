import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Network,
  Save,
  Trash2,
  Plus,
  Wifi,
  CheckCircle2,
  AlertCircle,
  History
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface NetworkProfile {
  id: string;
  name: string;
  ip: string;
  subnet: string;
  gateway: string;
  dns1: string;
  dns2?: string;
  isActive: boolean;
  lastUsed?: Date;
}

const mockProfiles: NetworkProfile[] = [
  {
    id: '1',
    name: 'Router Config',
    ip: '192.168.1.2',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns1: '8.8.8.8',
    dns2: '8.8.4.4',
    isActive: true,
    lastUsed: new Date()
  },
  {
    id: '2',
    name: 'Lab Network',
    ip: '10.0.0.100',
    subnet: '255.255.255.0',
    gateway: '10.0.0.1',
    dns1: '1.1.1.1',
    dns2: '1.0.0.1',
    isActive: false,
    lastUsed: new Date('2024-04-15')
  },
  {
    id: '3',
    name: 'Printer Direct',
    ip: '192.168.0.2',
    subnet: '255.255.255.0',
    gateway: '192.168.0.1',
    dns1: '192.168.0.1',
    isActive: false,
    lastUsed: new Date('2024-04-10')
  }
];

export default function NetworkConfig() {
  const [profiles, setProfiles] = useState<NetworkProfile[]>(mockProfiles);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<NetworkProfile>(
    profiles.find(p => p.isActive) || profiles[0]
  );

  const handleSaveProfile = () => {
    const newProfile: NetworkProfile = {
      ...currentConfig,
      id: Date.now().toString(),
      isActive: false,
      lastUsed: new Date()
    };

    setProfiles([...profiles, newProfile]);
    setIsEditing(false);

    // TODO: Save to backend - POST /api/network/profiles
  };

  const handleApplyProfile = (profile: NetworkProfile) => {
    setProfiles(profiles.map(p => ({ ...p, isActive: p.id === profile.id })));
    setCurrentConfig(profile);

    // TODO: Apply network configuration via backend
    // POST /api/network/apply with profile data
    console.log('Applying network config:', profile);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
    // TODO: Delete from backend - DELETE /api/network/profiles/{id}
  };

  const handleSetAsCurrent = () => {
    // TODO: Apply current configuration to system
    // POST /api/network/apply
    console.log('Applying configuration:', currentConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Network Configuration</h2>
        <p className="text-slate-400 mt-1">Configura y gestiona tus perfiles de red</p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="current">Configuración Actual</TabsTrigger>
          <TabsTrigger value="profiles">Perfiles Guardados</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6 mt-6">
          {/* Current Configuration */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configuración de Red Activa</CardTitle>
                  <CardDescription>
                    Modifica tu configuración de red local
                  </CardDescription>
                </div>
                {currentConfig.isActive && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Activa
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ip">Dirección IP</Label>
                  <Input
                    id="ip"
                    value={currentConfig.ip}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, ip: e.target.value })}
                    placeholder="192.168.1.100"
                    className="bg-slate-900 border-slate-700 font-mono"
                  />
                  <p className="text-xs text-slate-500">Tu dirección IP estática</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subnet">Máscara de Subred</Label>
                  <Input
                    id="subnet"
                    value={currentConfig.subnet}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, subnet: e.target.value })}
                    placeholder="255.255.255.0"
                    className="bg-slate-900 border-slate-700 font-mono"
                  />
                  <p className="text-xs text-slate-500">Generalmente 255.255.255.0</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gateway">Puerta de Enlace</Label>
                  <Input
                    id="gateway"
                    value={currentConfig.gateway}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, gateway: e.target.value })}
                    placeholder="192.168.1.1"
                    className="bg-slate-900 border-slate-700 font-mono"
                  />
                  <p className="text-xs text-slate-500">IP de tu router</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dns1">DNS Primario</Label>
                  <Input
                    id="dns1"
                    value={currentConfig.dns1}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, dns1: e.target.value })}
                    placeholder="8.8.8.8"
                    className="bg-slate-900 border-slate-700 font-mono"
                  />
                  <p className="text-xs text-slate-500">Servidor DNS principal</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dns2">DNS Secundario (Opcional)</Label>
                  <Input
                    id="dns2"
                    value={currentConfig.dns2 || ''}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, dns2: e.target.value })}
                    placeholder="8.8.4.4"
                    className="bg-slate-900 border-slate-700 font-mono"
                  />
                  <p className="text-xs text-slate-500">Servidor DNS de respaldo</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                <Button
                  onClick={handleSetAsCurrent}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Network className="w-4 h-4 mr-2" />
                  Aplicar Configuración
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  variant="outline"
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar como Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Presets */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Configuraciones Rápidas</CardTitle>
              <CardDescription>Presets comunes para configuración de red</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="justify-start border-slate-600 hover:bg-slate-700"
                  onClick={() => setCurrentConfig({
                    ...currentConfig,
                    ip: '192.168.1.2',
                    subnet: '255.255.255.0',
                    gateway: '192.168.1.1',
                    dns1: '192.168.1.1'
                  })}
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Router Estándar
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-slate-600 hover:bg-slate-700"
                  onClick={() => setCurrentConfig({
                    ...currentConfig,
                    dns1: '8.8.8.8',
                    dns2: '8.8.4.4'
                  })}
                >
                  DNS Google
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-slate-600 hover:bg-slate-700"
                  onClick={() => setCurrentConfig({
                    ...currentConfig,
                    dns1: '1.1.1.1',
                    dns2: '1.0.0.1'
                  })}
                >
                  DNS Cloudflare
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perfiles Guardados</CardTitle>
                  <CardDescription>
                    {profiles.length} configuraciones guardadas
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Perfil
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300">Nombre</TableHead>
                    <TableHead className="text-slate-300">IP</TableHead>
                    <TableHead className="text-slate-300">Gateway</TableHead>
                    <TableHead className="text-slate-300">DNS</TableHead>
                    <TableHead className="text-slate-300">Último Uso</TableHead>
                    <TableHead className="text-slate-300">Estado</TableHead>
                    <TableHead className="text-slate-300 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-cyan-400" />
                          <span className="font-semibold text-slate-200">{profile.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-300">{profile.ip}</TableCell>
                      <TableCell className="font-mono text-sm text-slate-300">{profile.gateway}</TableCell>
                      <TableCell className="font-mono text-sm text-slate-400">{profile.dns1}</TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {profile.lastUsed?.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {profile.isActive ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-600">
                            Guardada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!profile.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyProfile(profile)}
                              className="border-cyan-500/30 hover:bg-cyan-500/10"
                            >
                              Aplicar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            disabled={profile.isActive}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <History className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-400">Perfiles con Memoria</h4>
                  <p className="text-sm text-blue-200/80 mt-1">
                    Guarda diferentes configuraciones de red y cambia entre ellas rápidamente.
                    Ideal cuando trabajas con múltiples routers o entornos de red.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
