import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X, Sparkles } from "lucide-react";
import { useRightPanel } from "./RightPanelContext";

// DEV-ID: ai-overlay-panel
export default function AiOverlayPanel() {
  const { theme } = useTheme();
  const rp = useRightPanel();
  const [input, setInput] = useState("");

  return (
    <aside
      className="fixed right-0 top-0 h-screen w-[440px] z-50 border-l flex flex-col"
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }}
      data-right-panel="true"
      data-dev-id="ai-right-panel"
    >
      <div
        className="h-16 px-4 border-b flex items-center justify-between"
        style={{ borderColor: theme.colors.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">AI Overlay</div>
            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
              UI only (sin backend)
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            rp.setAiOpen(false);
            rp.setActivePanel(null);
          }}
          title="Cerrar AI"
          data-dev-id="ai-overlay-close"
        >
          <X />
        </Button>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-auto" data-dev-id="ai-overlay-body">
        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Este panel es el placeholder del overlay global de IA. Aqui luego van:
          historial, streaming, estado del agente, contador de tokens y dictado por voz (UI).
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un comando..."
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
            data-dev-id="ai-overlay-input"
          />
          <Button
            type="button"
            onClick={() => setInput("")}
            disabled={!input.trim()}
            data-dev-id="ai-overlay-send"
          >
            Enviar
          </Button>
        </div>
      </div>
    </aside>
  );
}

