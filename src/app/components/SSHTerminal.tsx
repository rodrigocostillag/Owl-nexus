import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  Terminal,
  Send,
  Trash2,
  Copy,
  Download,
  Power,
  Circle
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface SSHSession {
  id: string;
  deviceName: string;
  ip: string;
  user: string;
  connected: boolean;
}

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

const mockSessions: SSHSession[] = [
  { id: '1', deviceName: 'Ender 3 Pro', ip: '192.168.1.100', user: 'pi', connected: true },
  { id: '2', deviceName: 'Pi 4 - OctoPrint', ip: '192.168.1.101', user: 'pi', connected: true },
  { id: '3', deviceName: 'OpenWrt Router', ip: '192.168.1.1', user: 'root', connected: false },
];

export default function SSHTerminal() {
  const [sessions] = useState<SSHSession[]>(mockSessions);
  const [activeSession, setActiveSession] = useState<string>(sessions[0]?.id);
  const [command, setCommand] = useState('');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'SSH Terminal initialized. Select a device to connect.', timestamp: new Date() },
    { type: 'system', content: 'Connected to Ender 3 Pro (192.168.1.100) as pi', timestamp: new Date() },
  ]);

  const currentSession = sessions.find(s => s.id === activeSession);

  const handleSendCommand = () => {
    if (!command.trim() || !currentSession?.connected) return;

    // Add command to terminal
    setTerminalLines(prev => [
      ...prev,
      {
        type: 'command',
        content: `${currentSession.user}@${currentSession.deviceName}:~$ ${command}`,
        timestamp: new Date()
      }
    ]);

    // TODO: Send command to backend SSH connection
    // POST /api/ssh/execute with { sessionId, command }

    // Mock response
    setTimeout(() => {
      setTerminalLines(prev => [
        ...prev,
        {
          type: 'output',
          content: `[Mock Output] Command '${command}' executed successfully`,
          timestamp: new Date()
        }
      ]);
    }, 300);

    setCommand('');
  };

  const handleClearTerminal = () => {
    setTerminalLines([
      { type: 'system', content: 'Terminal cleared', timestamp: new Date() }
    ]);
  };

  const handleCopyLogs = () => {
    const logs = terminalLines.map(l => l.content).join('\n');
    navigator.clipboard.writeText(logs);
  };

  const handleExportLogs = () => {
    const logs = terminalLines.map(l =>
      `[${l.timestamp.toLocaleTimeString()}] [${l.type}] ${l.content}`
    ).join('\n');

    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssh-logs-${Date.now()}.txt`;
    a.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-cyan-400';
      case 'output':
        return 'text-slate-300';
      case 'error':
        return 'text-red-400';
      case 'system':
        return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">SSH Terminal</h2>
        <p className="text-slate-400 mt-1">Conecta y controla tus dispositivos remotamente</p>
      </div>

      {/* Session Selector */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Sesión Activa</CardTitle>
          <CardDescription>Selecciona el dispositivo al que quieres conectarte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={activeSession} onValueChange={setActiveSession}>
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(session => (
                  <SelectItem key={session.id} value={session.id}>
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`w-2 h-2 ${session.connected ? 'fill-green-400 text-green-400' : 'fill-red-400 text-red-400'}`}
                      />
                      {session.deviceName} ({session.ip})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              {currentSession && (
                <>
                  <Badge variant="outline" className="font-mono text-xs">
                    {currentSession.user}@{currentSession.ip}
                  </Badge>
                  <Badge
                    variant={currentSession.connected ? 'default' : 'secondary'}
                    className={currentSession.connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                  >
                    {currentSession.connected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Window */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-lg">Terminal Output</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyLogs}
                className="text-slate-400 hover:text-slate-200"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportLogs}
                className="text-slate-400 hover:text-slate-200"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearTerminal}
                className="text-slate-400 hover:text-slate-200"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 font-mono text-sm space-y-1">
              {terminalLines.map((line, index) => (
                <div key={index} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
                  {line.content}
                </div>
              ))}
              {currentSession?.connected && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <span>{currentSession.user}@{currentSession.deviceName}:~$</span>
                  <span className="animate-pulse">▊</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Command Input */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentSession?.connected ? "Escribe un comando..." : "No hay sesión activa"}
              disabled={!currentSession?.connected}
              className="flex-1 bg-slate-900 border-slate-700 font-mono"
            />
            <Button
              onClick={handleSendCommand}
              disabled={!currentSession?.connected || !command.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Presiona Enter para ejecutar el comando
          </p>
        </CardContent>
      </Card>

      {/* Quick Commands */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Comandos Rápidos</CardTitle>
          <CardDescription>Comandos comunes para tus dispositivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Status', cmd: 'systemctl status' },
              { label: 'Uptime', cmd: 'uptime' },
              { label: 'Disk Space', cmd: 'df -h' },
              { label: 'Memory', cmd: 'free -h' },
              { label: 'Processes', cmd: 'top -n 1' },
              { label: 'Network', cmd: 'ip addr' },
              { label: 'Restart', cmd: 'sudo reboot' },
              { label: 'Logs', cmd: 'tail -f /var/log/syslog' },
            ].map((quick) => (
              <Button
                key={quick.cmd}
                size="sm"
                variant="outline"
                onClick={() => setCommand(quick.cmd)}
                disabled={!currentSession?.connected}
                className="border-slate-600 hover:bg-slate-700 text-left justify-start"
              >
                {quick.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
