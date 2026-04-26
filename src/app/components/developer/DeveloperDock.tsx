import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../ThemeContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useDevMode } from "./DevModeContext";
import {
  Bot,
  Download,
  Save,
  Plus,
  Trash2,
  X,
  Terminal,
  ListChecks,
  ClipboardPaste,
  History,
} from "lucide-react";

// DEV-ID: developer-dock
export default function DeveloperDock() {
  const { theme } = useTheme();
  const dev = useDevMode();
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);

  useEffect(() => {
    if (!dev.enabled) return;
    setActiveSnippetId((cur) => cur ?? dev.ensureOneSnippet());
    dev.logEvent("dev_mode", "Modo desarrollador activado");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dev.enabled]);

  const activeSnippet = useMemo(() => {
    if (!activeSnippetId) return null;
    return dev.snippets.find((s) => s.id === activeSnippetId) ?? null;
  }, [activeSnippetId, dev.snippets]);

  const activeSnippetHistory = useMemo(() => {
    return dev.getSnippetHistory(activeSnippetId);
  }, [activeSnippetId, dev]);

  // DEV-ID: snippet-editor-draft
  const [snippetEditorValue, setSnippetEditorValue] = useState("");

  useEffect(() => {
    // On snippet switch or reload: if there's a saved history, show last saved for readability.
    if (!activeSnippetId) {
      setSnippetEditorValue("");
      return;
    }
    const last = activeSnippetHistory[0];
    const body = (activeSnippet?.body ?? "").trim();
    if (!body && last?.body) {
      setSnippetEditorValue(last.body);
      return;
    }
    setSnippetEditorValue(activeSnippet?.body ?? "");
  }, [activeSnippetId, activeSnippet?.updatedAt, activeSnippetHistory]);

  if (!dev.enabled) return null;

  return (
    <aside
      className="fixed right-0 top-0 h-screen w-[440px] z-50 border-l flex flex-col"
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }}
      data-dev-id="dev-right-dock"
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
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Modo Desarrollador</div>
            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
              notas persistentes + snapshot IA,Dev
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* DEV-ID: dev-save-button */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={dev.devSave}
            title="Dev Save (largo plazo)"
            data-dev-id="dev-save"
          >
            <Save />
          </Button>

          {/* DEV-ID: ia-dev-save-button */}
          <Button
            type="button"
            size="icon"
            variant="default"
            onClick={dev.iaDevSave}
            title="IA,Dev (snapshot + archivo temporal)"
            data-dev-id="ia-dev-save"
          >
            <Bot />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => dev.setEnabled(false)}
            title="Cerrar dock"
            data-dev-id="dev-dock-close"
          >
            <X />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <Tabs defaultValue="backend" className="h-full">
          <TabsList className="w-full" data-dev-id="dev-dock-tabs">
            <TabsTrigger value="backend" className="gap-2">
              <ListChecks />
              Backend
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-2">
              <Terminal />
              Log
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backend" className="h-[calc(100%-52px)]">
            <div className="h-full flex flex-col gap-3">
              {/* DEV-ID: last-interaction-panel */}
              <LastInteractionCard
                onAppend={(text) => {
                  if (!activeSnippetId) return;
                  const next = `${(activeSnippet?.body ?? "").trim()}\n\n${text.trim()}\n`.trim() + "\n";
                  dev.upsertSnippet({ id: activeSnippetId, body: next });
                  dev.logEvent("append_to_snippet", "Append to snippet", { snippetId: activeSnippetId });
                }}
              />

              <div
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Notas para backend</div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const id = `dev_snip_${Date.now().toString(36)}`;
                        dev.upsertSnippet({ id, title: "Backend Note", body: "" });
                        setActiveSnippetId(id);
                        dev.logEvent("snippet_add", "Snippet creado", { id });
                      }}
                      data-dev-id="dev-snippet-add"
                    >
                      <Plus />
                      Nuevo
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={!activeSnippet}
                      onClick={() => {
                        if (!activeSnippet) return;
                        dev.removeSnippet(activeSnippet.id);
                        dev.logEvent("snippet_remove", "Snippet eliminado", { id: activeSnippet.id });
                        setActiveSnippetId(null);
                      }}
                      data-dev-id="dev-snippet-delete"
                    >
                      <Trash2 />
                      Borrar
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="h-9 w-full rounded-md border px-3 text-sm"
                      style={{
                        backgroundColor: theme.colors.bgSecondary,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      }}
                      value={activeSnippetId ?? ""}
                      onChange={(e) => setActiveSnippetId(e.target.value)}
                      data-dev-id="dev-snippet-select"
                    >
                      {dev.snippets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    value={activeSnippet?.title ?? ""}
                    onChange={(e) => {
                      if (!activeSnippetId) return;
                      dev.upsertSnippet({ id: activeSnippetId, title: e.target.value });
                    }}
                    placeholder="Titulo"
                    style={{
                      backgroundColor: theme.colors.bgSecondary,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    }}
                    data-dev-id="dev-snippet-title"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {/* DEV-ID: snippet-history-panel */}
                <div
                  className="mb-2 rounded-xl border p-3"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                  data-dev-id="dev-snippet-history"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Historial del snippet
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!activeSnippetId || !(activeSnippet?.body ?? "").trim()}
                      onClick={() => {
                        if (!activeSnippetId) return;
                        dev.commitSnippetHistory(activeSnippetId);
                        dev.logEvent("snippet_history_commit", "Snippet version guardada", { snippetId: activeSnippetId });
                      }}
                      data-dev-id="dev-snippet-history-save"
                    >
                      Guardar version
                    </Button>
                  </div>
                  {activeSnippetHistory.length === 0 ? (
                    <div className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                      Aun no hay historial. Guarda una version para empezar.
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
                        Ultima guardada: {activeSnippetHistory[0].at}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!activeSnippetId) return;
                            const last = activeSnippetHistory[0];
                            dev.upsertSnippet({ id: activeSnippetId, body: last.body, title: last.title });
                            dev.logEvent("snippet_history_load", "Snippet history loaded", {
                              snippetId: activeSnippetId,
                              entryId: last.id,
                            });
                          }}
                          data-dev-id="dev-snippet-history-load-last"
                        >
                          Cargar ultima
                        </Button>
                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                          Tip: para escribir una nota nueva, solo haz click en el editor (si esta igual a la ultima guardada,
                          se limpia).
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Textarea
                  value={snippetEditorValue}
                  onFocus={() => {
                    if (!activeSnippetId) return;
                    const last = activeSnippetHistory[0];
                    const cur = snippetEditorValue ?? "";
                    // UX: si aun estas viendo la ultima version guardada, al click limpiar para escribir una nota nueva.
                    // Importante: NO persistimos el vacio hasta que el usuario empiece a escribir.
                    if (last && cur === last.body) {
                      setSnippetEditorValue("");
                      dev.logEvent("snippet_new_note", "Editor limpiado para nota nueva", { snippetId: activeSnippetId });
                    }
                  }}
                  onChange={(e) => {
                    if (!activeSnippetId) return;
                    const v = e.target.value;
                    setSnippetEditorValue(v);
                    dev.upsertSnippet({ id: activeSnippetId, body: v });
                  }}
                  placeholder={
                    "Escribe aqui instrucciones para el dev backend.\n\nRecomendado:\n- objetivo\n- endpoints\n- payload\n- reglas de validacion\n- errores esperados\n- ids relevantes"
                  }
                  className="h-full min-h-[260px] font-mono text-sm"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                  data-dev-id="dev-backend-textarea"
                />
                <div className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                  Tip: usa IDs estables en el texto (ej: `DEV-ID: network-scan-loop`) para que luego te lo ubique rapido.
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="log" className="h-[calc(100%-52px)]">
            <div
              className="h-full rounded-xl border p-3 overflow-auto"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
              }}
              data-dev-id="dev-event-log"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Eventos (solo en dev mode)</div>
                <Button size="sm" variant="secondary" onClick={dev.clearEvents}>
                  Limpiar
                </Button>
              </div>
              <div className="space-y-2">
                {dev.events.length === 0 ? (
                  <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Sin eventos aun.
                  </div>
                ) : (
                  dev.events.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-lg border px-3 py-2"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
                          {e.at}
                        </div>
                        <div className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
                          {e.type}
                        </div>
                      </div>
                      <div className="text-sm mt-1">{e.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="h-[calc(100%-52px)]">
            <div className="h-full flex flex-col gap-3">
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}
              >
                <div className="font-semibold">Dev Save</div>
                <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  Guarda solo las notas de backend en localStorage (persistente).
                </div>
                <div className="mt-3">
                  <Button variant="secondary" onClick={dev.devSave} data-dev-id="dev-save-cta">
                    <Save />
                    Dev Save
                  </Button>
                </div>
              </div>

              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}
              >
                <div className="font-semibold">IA,Dev</div>
                <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  Crea snapshot (notas + log) y descarga un archivo temporal `.json` para que luego me digas:
                  “revisa mis anotaciones IA,Dev”.
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button onClick={dev.iaDevSave} data-dev-id="ia-dev-save-cta">
                    <Bot />
                    IA,Dev
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => dev.logEvent("note", "Marca manual en el log")}
                    data-dev-id="dev-log-mark"
                  >
                    Marcar
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

function LastInteractionCard({ onAppend }: { onAppend: (text: string) => void }) {
  const { theme } = useTheme();
  const dev = useDevMode();
  // Prefer keyed interactions so the panel doesn't jump to clicks without IDs.
  const li = dev.lastKeyedInteraction ?? dev.lastInteraction;

  const key = dev.getInteractionKey(li);
  const draft = dev.getDraft(key);
  const history = dev.getHistory(key);

  const [backend, setBackend] = useState("");
  const [ia, setIa] = useState("");

  useEffect(() => {
    // Load persisted drafts when switching to a new last interaction.
    setBackend(draft?.backend ?? "");
    setIa(draft?.ia ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const idLabel = li?.elementDevId || li?.elementId || "(sin id)";
  const actionLabel = li?.action || "(sin funcion)";
  const backendPlaceholder = (li?.backendTemplate ?? "para rellenar").trim();
  const iaPlaceholder = (li?.iaTemplate ?? "para rellenar").trim();

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        backgroundColor: theme.colors.bg,
        borderColor: theme.colors.border,
      }}
      data-dev-id="dev-last-interaction"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Ultimo click</div>
          <div className="text-xs font-mono mt-1" style={{ color: theme.colors.textSecondary }}>
            id: {idLabel}
          </div>
          <div className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
            funcion: {actionLabel}
          </div>
        </div>
        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
          {li?.tag ? `${li.tag}` : ""} {li?.text ? `• ${li.text}` : ""}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {/* DEV-ID: last-backend-instruction */}
        <Textarea
          value={backend}
          onChange={(e) => {
            const v = e.target.value;
            setBackend(v);
            if (key) dev.setDraft(key, { backend: v });
          }}
          className="min-h-20 font-mono text-sm"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          }}
          placeholder={backendPlaceholder}
          data-dev-id="dev-last-backend"
        />

        {/* DEV-ID: last-ia-instruction */}
        <Textarea
          value={ia}
          onChange={(e) => {
            const v = e.target.value;
            setIa(v);
            if (key) dev.setDraft(key, { ia: v });
          }}
          className="min-h-20 font-mono text-sm"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          }}
          placeholder={iaPlaceholder}
          data-dev-id="dev-last-ia"
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const block =
                `# UI click\n` +
                `- id: ${idLabel}\n` +
                `- funcion: ${actionLabel}\n` +
                `- when: ${li?.at ?? ""}\n` +
                `\n## Backend\n${backend}\n\n## IA\n${ia}\n`;
              onAppend(block);
            }}
            disabled={!li}
            data-dev-id="dev-append-last"
          >
            <ClipboardPaste />
            Append al snippet
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (!li) return;
              dev.commitHistory(li, { backend, ia });
              dev.logEvent("interaction_save", "Notas guardadas (historial)", { key });
            }}
            disabled={!li || (!backend.trim() && !ia.trim())}
            data-dev-id="dev-save-last"
          >
            Guardar notas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => dev.logEvent("last_interaction", "Last interaction note", { id: idLabel, action: actionLabel })}
            disabled={!li}
            data-dev-id="dev-log-last"
          >
            Marcar en log
          </Button>
        </div>

        {/* DEV-ID: last-interaction-history */}
        <div className="mt-1">
          <div className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
            Historial (ultima guardada primero)
          </div>
          {history.length === 0 ? (
            <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Sin historial para este elemento.
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {history.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: theme.colors.border }}
                  data-dev-id={`dev-history-${h.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono" style={{ color: theme.colors.textSecondary }}>
                      {h.at}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBackend(h.backend);
                        setIa(h.ia);
                        if (key) dev.setDraft(key, { backend: h.backend, ia: h.ia });
                        dev.logEvent("history_load", "Historial cargado al draft", { entryId: h.id, key });
                      }}
                      data-dev-id={`dev-history-load-${h.id}`}
                    >
                      Cargar
                    </Button>
                  </div>
                  <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    backend: {h.backend.trim() ? "si" : "no"} • ia: {h.ia.trim() ? "si" : "no"}
                  </div>
                </div>
              ))}
              {history.length > 5 ? (
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  +{history.length - 5} mas...
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
