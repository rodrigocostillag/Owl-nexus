import { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import {
  Sparkles,
  Send,
  Bot,
  Trash2,
  Settings,
  Key,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AIProvider {
  id: string;
  name: string;
  configured: boolean;
  models: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const aiProviders: AIProvider[] = [
  { id: 'openai', name: 'OpenAI', configured: false, models: ['gpt-4', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic Claude', configured: false, models: ['claude-3-opus', 'claude-3-sonnet'] },
  { id: 'google', name: 'Google Gemini', configured: false, models: ['gemini-pro', 'gemini-pro-vision'] },
  { id: 'local', name: 'Local Model (Ollama)', configured: false, models: ['llama2', 'mistral'] },
];

export default function AIAssistant() {
  const { theme } = useTheme();
  const [providers, setProviders] = useState<AIProvider[]>(aiProviders);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [chatEnabled, setChatEnabled] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'AI Assistant activado. Puedo ayudarte con configuración de dispositivos, troubleshooting, y sugerencias de comandos.',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentProvider = providers.find(p => p.id === selectedProvider);

  const handleSaveApiKey = () => {
    setProviders(providers.map(p =>
      p.id === selectedProvider ? { ...p, configured: true } : p
    ));
    console.log('Saving API key for:', selectedProvider);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !aiEnabled) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setChatMessages([...chatMessages, newMessage]);
    setUserInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: `Para configurar tu dispositivo, te recomiendo:\n\n1. Verificar la conexión SSH\n2. Actualizar el firmware\n3. Configurar los parámetros de red\n\n¿Necesitas ayuda con algún paso específico?`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        role: 'system',
        content: 'Chat reiniciado. ¿En qué puedo ayudarte?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Main Config Area */}
      <div className={`flex-1 space-y-6 overflow-y-auto ${chatEnabled ? 'mr-0' : ''}`}>
        {/* AI Toggle */}
        <div className="rounded-2xl p-6 border"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1" style={{ color: theme.colors.text }}>
                Asistente de IA
              </h3>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {aiEnabled ? 'IA Activada' : 'IA Desactivada'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <Label className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Mostrar Chat
                </Label>
                <Switch
                  checked={chatEnabled}
                  onCheckedChange={setChatEnabled}
                  disabled={!currentProvider?.configured}
                />
              </div>
              <Switch
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
                disabled={!currentProvider?.configured}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2 border"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border
            }}
          >
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6 mt-6">
            {/* Provider Selection */}
            <div className="rounded-2xl p-6 border"
              style={{
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.border
              }}
            >
              <h4 className="font-semibold mb-4" style={{ color: theme.colors.text }}>
                Seleccionar Proveedor de AI
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setSelectedModel(provider.models[0]);
                    }}
                    className="p-4 rounded-xl border-2 transition-all text-left"
                    style={{
                      backgroundColor: selectedProvider === provider.id ? `${theme.colors.primary}20` : theme.colors.bg,
                      borderColor: selectedProvider === provider.id ? theme.colors.primary : theme.colors.border
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5" style={{ color: theme.colors.primary }} />
                        <span className="font-semibold" style={{ color: theme.colors.text }}>
                          {provider.name}
                        </span>
                      </div>
                      {provider.configured && (
                        <CheckCircle2 className="w-4 h-4" style={{ color: theme.colors.success }} />
                      )}
                    </div>
                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      {provider.models.length} modelos disponibles
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Configuration */}
            {currentProvider && (
              <div className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  borderColor: theme.colors.border
                }}
              >
                <h4 className="font-semibold mb-4" style={{ color: theme.colors.text }}>
                  Configurar {currentProvider.name}
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2" style={{ color: theme.colors.textSecondary }}>
                      <Key className="w-4 h-4" />
                      API Key
                    </Label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={selectedProvider === 'local' ? 'No requerido para modelo local' : 'sk-...'}
                      disabled={selectedProvider === 'local'}
                      className="h-11 rounded-xl font-mono"
                      style={{
                        backgroundColor: theme.colors.bg,
                        borderColor: theme.colors.border,
                        color: theme.colors.text
                      }}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block" style={{ color: theme.colors.textSecondary }}>
                      Modelo
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="h-11 rounded-xl"
                        style={{
                          backgroundColor: theme.colors.bg,
                          borderColor: theme.colors.border,
                          color: theme.colors.text
                        }}
                      >
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentProvider.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <button
                    onClick={handleSaveApiKey}
                    disabled={!apiKey && selectedProvider !== 'local'}
                    className="w-full h-11 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      color: '#ffffff',
                      boxShadow: `0 4px 12px ${theme.colors.primary}30`,
                      opacity: (!apiKey && selectedProvider !== 'local') ? 0.5 : 1
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    Guardar Configuración
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4 mt-6">
            <div className="rounded-2xl p-6 border"
              style={{
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.border
              }}
            >
              <h4 className="font-semibold mb-4" style={{ color: theme.colors.text }}>
                Prompts Sugeridos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  '¿Cómo configuro OctoPrint en mi Raspberry Pi?',
                  'Ayúdame a solucionar problemas de conexión SSH',
                  '¿Qué comandos uso para actualizar firmware?',
                  'Configura OpenWrt en mi router',
                  'Diagnóstica por qué mi impresora no responde',
                  'Optimiza la configuración de red de mi ESP32'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (chatEnabled) {
                        setUserInput(prompt);
                      }
                    }}
                    disabled={!aiEnabled || !chatEnabled}
                    className="p-4 rounded-xl border text-left text-sm transition-all"
                    style={{
                      backgroundColor: theme.colors.bg,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                      opacity: (!aiEnabled || !chatEnabled) ? 0.5 : 1
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Sidebar */}
      {chatEnabled && (
        <div className="w-96 flex flex-col rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border
          }}
        >
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: theme.colors.border }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: theme.colors.primary }} />
              <h4 className="font-semibold" style={{ color: theme.colors.text }}>
                AI Chat
              </h4>
            </div>
            <button
              onClick={handleClearChat}
              className="p-2 rounded-lg transition-all"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.error;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] rounded-xl p-3"
                    style={{
                      backgroundColor: message.role === 'user'
                        ? theme.colors.primary
                        : message.role === 'assistant'
                        ? theme.colors.bg
                        : `${theme.colors.warning}20`,
                      color: message.role === 'user' ? '#ffffff' : theme.colors.text,
                      border: message.role !== 'user' ? `1px solid ${theme.colors.border}` : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === 'assistant' && <Bot className="w-3 h-3" />}
                      <span className="text-xs opacity-70">
                        {message.role === 'user' ? 'Tú' : message.role === 'assistant' ? 'AI' : 'Sistema'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl p-3 border"
                    style={{
                      backgroundColor: theme.colors.bg,
                      borderColor: theme.colors.border
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 animate-pulse" style={{ color: theme.colors.primary }} />
                      <span className="text-sm" style={{ color: theme.colors.text }}>Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t"
            style={{ borderColor: theme.colors.border }}
          >
            {aiEnabled ? (
              <div className="flex items-end gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Pregunta algo..."
                  className="min-h-[60px] rounded-xl resize-none"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                    color: theme.colors.text
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isLoading}
                  className="h-11 w-11 rounded-xl transition-all flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    color: '#ffffff',
                    opacity: (!userInput.trim() || isLoading) ? 0.5 : 1
                  }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4" style={{ color: theme.colors.textSecondary }}>
                <p className="text-sm">AI desactivado</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
