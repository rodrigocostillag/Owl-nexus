import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  KeyRound,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2
} from 'lucide-react';

interface Credential {
  id: string;
  name: string;
  username: string;
  password: string;
  devices: string[];
  createdAt: Date;
}

const mockCredentials: Credential[] = [
  {
    id: '1',
    name: 'printer-admin',
    username: 'pi',
    password: 'raspberry',
    devices: ['Ender 3 Pro'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'pi-default',
    username: 'pi',
    password: 'raspberry3141',
    devices: ['Pi 4 - OctoPrint'],
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    name: 'esp-admin',
    username: 'admin',
    password: 'esp32secure',
    devices: ['ESP32 - Home Control'],
    createdAt: new Date('2024-03-05')
  },
  {
    id: '4',
    name: 'router-admin',
    username: 'root',
    password: 'openwrt123',
    devices: ['OpenWrt Router'],
    createdAt: new Date('2024-01-20')
  }
];

export default function CredentialsManager() {
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const handleTogglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (id: string, password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
    // TODO: Delete from backend - DELETE /api/credentials/{id}
  };

  const handleSubmitNew = () => {
    const newCredential: Credential = {
      id: Date.now().toString(),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      devices: [],
      createdAt: new Date()
    };

    setCredentials([...credentials, newCredential]);
    setFormData({ name: '', username: '', password: '' });
    setIsAddDialogOpen(false);

    // TODO: Save to backend - POST /api/credentials
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Credentials Manager</h2>
          <p className="text-slate-400 mt-1">Gestiona usuarios y contraseñas para tus dispositivos</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Credencial
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Credencial</DialogTitle>
              <DialogDescription>
                Crea una nueva credencial para usar en tus dispositivos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Nombre de Credencial</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: router-admin"
                  className="bg-slate-900 border-slate-700 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="ej: root"
                  className="bg-slate-900 border-slate-700 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-slate-900 border-slate-700 mt-2"
                />
              </div>
              <Button
                onClick={handleSubmitNew}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                disabled={!formData.name || !formData.username || !formData.password}
              >
                Guardar Credencial
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Warning */}
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-400">Nota de Seguridad</h4>
              <p className="text-sm text-yellow-200/80 mt-1">
                Las contraseñas se almacenan de forma encriptada. En producción, considera usar SSH keys
                en lugar de contraseñas para mayor seguridad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Credenciales Guardadas</CardTitle>
          <CardDescription>
            {credentials.length} credenciales configuradas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                <TableHead className="text-slate-300">Nombre</TableHead>
                <TableHead className="text-slate-300">Usuario</TableHead>
                <TableHead className="text-slate-300">Contraseña</TableHead>
                <TableHead className="text-slate-300">Dispositivos</TableHead>
                <TableHead className="text-slate-300">Creado</TableHead>
                <TableHead className="text-slate-300 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((credential) => (
                <TableRow key={credential.id} className="border-slate-700 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-slate-200">{credential.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-300">{credential.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-300">
                        {showPasswords[credential.id] ? credential.password : '••••••••'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePassword(credential.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showPasswords[credential.id] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyPassword(credential.id, credential.password)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedId === credential.id ? (
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {credential.devices.length > 0 ? (
                        credential.devices.map((device, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {device}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Sin asignar</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {credential.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCredential(credential.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Credentials</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{credentials.length}</p>
              </div>
              <KeyRound className="w-8 h-8 text-cyan-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Dispositivos Asignados</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {credentials.reduce((acc, c) => acc + c.devices.length, 0)}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sin Asignar</p>
                <p className="text-3xl font-bold text-slate-400 mt-2">
                  {credentials.filter(c => c.devices.length === 0).length}
                </p>
              </div>
              <KeyRound className="w-8 h-8 text-slate-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
