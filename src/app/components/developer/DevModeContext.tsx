import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// DEV-ID: dev-mode-types
export type DevSnippet = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type DevEvent = {
  id: string;
  at: string;
  type: string;
  message: string;
  data?: unknown;
};

// DEV-ID: dev-mode-snippet-history
export type DevSnippetHistoryEntry = {
  id: string;
  at: string;
  snippetId: string;
  title: string;
  body: string;
};

// DEV-ID: dev-mode-interaction
export type DevInteraction = {
  id: string;
  at: string;
  elementDevId?: string;
  elementId?: string;
  tag?: string;
  text?: string;
  action?: string; // "funcion actual" (hint) via data-dev-action
  backendTemplate?: string;
  iaTemplate?: string;
};

type DevSnapshot = {
  id: string;
  at: string;
  kind: "ia_dev_snapshot_v1";
  snippets: DevSnippet[];
  events: DevEvent[];
  lastInteraction?: DevInteraction | null;
};

// DEV-ID: dev-mode-drafts
export type DevInteractionDraft = {
  key: string;
  backend: string;
  ia: string;
  updatedAt: string;
};

export type DevInteractionHistoryEntry = {
  id: string;
  at: string;
  key: string;
  elementDevId?: string;
  elementId?: string;
  action?: string;
  backend: string;
  ia: string;
};

type DevInteractionMeta = {
  key: string;
  elementDevId?: string;
  elementId?: string;
  action?: string;
  lastSeenAt: string;
};

type DevModeContextValue = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;

  snippets: DevSnippet[];
  upsertSnippet: (snippet: Pick<DevSnippet, "id"> & Partial<Omit<DevSnippet, "id">>) => void;
  removeSnippet: (id: string) => void;
  ensureOneSnippet: () => string;
  snippetHistory: Record<string, DevSnippetHistoryEntry[]>;
  commitSnippetHistory: (snippetId: string) => void;
  getSnippetHistory: (snippetId: string | null) => DevSnippetHistoryEntry[];

  events: DevEvent[];
  logEvent: (type: string, message: string, data?: unknown) => void;
  clearEvents: () => void;

  lastInteraction: DevInteraction | null;
  setLastInteraction: (i: DevInteraction | null) => void;
  lastKeyedInteraction: DevInteraction | null;

  getInteractionKey: (i: DevInteraction | null) => string | null;
  getDraft: (key: string | null) => DevInteractionDraft | null;
  setDraft: (key: string, patch: Partial<Pick<DevInteractionDraft, "backend" | "ia">>) => void;
  getHistory: (key: string | null) => DevInteractionHistoryEntry[];
  commitHistory: (i: DevInteraction, draft: { backend: string; ia: string }) => void;

  devSave: () => void; // long-term snippets
  iaDevSave: () => void; // snapshot + temp file
};

const STORAGE = {
  enabled: "nexus_dev_mode_enabled_v1",
  snippets: "nexus_dev_backend_snippets_v1",
  lastSnapshot: "nexus_ia_dev_last_snapshot_v1",
  drafts: "nexus_dev_interaction_drafts_v1",
  history: "nexus_dev_interaction_history_v1",
  meta: "nexus_dev_interaction_meta_v1",
  lastInteraction: "nexus_dev_last_interaction_v1",
  lastKeyedInteraction: "nexus_dev_last_keyed_interaction_v1",
  snippetHistory: "nexus_dev_snippet_history_v1",
  lastAiExportAt: "nexus_ia_dev_last_export_at_v1",
};

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function keyFromText(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const slug = t
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 _-]/g, "")
    .replace(/\s/g, "-")
    .slice(0, 48);
  return slug ? `text:${slug}` : null;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

const DevModeContext = createContext<DevModeContextValue | null>(null);

// DEV-ID: dev-mode-provider
export function DevModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [snippets, setSnippets] = useState<DevSnippet[]>([]);
  const [snippetHistory, setSnippetHistory] = useState<Record<string, DevSnippetHistoryEntry[]>>({});
  const [events, setEvents] = useState<DevEvent[]>([]);
  const [lastInteraction, setLastInteraction] = useState<DevInteraction | null>(null);
  const [lastKeyedInteraction, setLastKeyedInteraction] = useState<DevInteraction | null>(null);
  const [drafts, setDraftsState] = useState<Record<string, DevInteractionDraft>>({});
  const [history, setHistoryState] = useState<Record<string, DevInteractionHistoryEntry[]>>({});
  const [meta, setMetaState] = useState<Record<string, DevInteractionMeta>>({});

  useEffect(() => {
    const savedEnabled = safeParseJson<boolean>(localStorage.getItem(STORAGE.enabled));
    const savedSnippets = safeParseJson<DevSnippet[]>(localStorage.getItem(STORAGE.snippets));
    const savedSnippetHistory = safeParseJson<Record<string, DevSnippetHistoryEntry[]>>(
      localStorage.getItem(STORAGE.snippetHistory),
    );
    const savedDrafts = safeParseJson<Record<string, DevInteractionDraft>>(localStorage.getItem(STORAGE.drafts));
    const savedHistory = safeParseJson<Record<string, DevInteractionHistoryEntry[]>>(localStorage.getItem(STORAGE.history));
    const savedMeta = safeParseJson<Record<string, DevInteractionMeta>>(localStorage.getItem(STORAGE.meta));
    const savedLastInteraction = safeParseJson<DevInteraction>(localStorage.getItem(STORAGE.lastInteraction));
    const savedLastKeyedInteraction = safeParseJson<DevInteraction>(localStorage.getItem(STORAGE.lastKeyedInteraction));

    if (typeof savedEnabled === "boolean") setEnabledState(savedEnabled);
    if (Array.isArray(savedSnippets)) setSnippets(savedSnippets);
    if (savedSnippetHistory && typeof savedSnippetHistory === "object") setSnippetHistory(savedSnippetHistory);
    if (savedDrafts && typeof savedDrafts === "object") setDraftsState(savedDrafts);
    if (savedHistory && typeof savedHistory === "object") setHistoryState(savedHistory);
    if (savedMeta && typeof savedMeta === "object") setMetaState(savedMeta);
    if (savedLastInteraction && typeof savedLastInteraction === "object") setLastInteraction(savedLastInteraction);
    if (savedLastKeyedInteraction && typeof savedLastKeyedInteraction === "object") {
      setLastKeyedInteraction(savedLastKeyedInteraction);
    }
  }, []);

  const setEnabled = (v: boolean) => {
    setEnabledState(v);
    localStorage.setItem(STORAGE.enabled, JSON.stringify(v));
  };

  const logEvent = (type: string, message: string, data?: unknown) => {
    if (!enabled) return;
    const e: DevEvent = { id: makeId("dev_evt"), at: nowIso(), type, message, data };
    setEvents((prev) => [e, ...prev].slice(0, 250));
  };

  const clearEvents = () => setEvents([]);

  const getInteractionKey = (i: DevInteraction | null) => {
    if (!i) return null;
    return i.elementDevId || i.elementId || keyFromText(i.text ?? "") || null;
  };

  const getDraft = (key: string | null) => {
    if (!key) return null;
    return drafts[key] ?? null;
  };

  const setDraft: DevModeContextValue["setDraft"] = (key, patch) => {
    setDraftsState((prev) => {
      const cur = prev[key] ?? { key, backend: "", ia: "", updatedAt: nowIso() };
      const next: DevInteractionDraft = {
        ...cur,
        ...patch,
        updatedAt: nowIso(),
      };
      const merged = { ...prev, [key]: next };
      localStorage.setItem(STORAGE.drafts, JSON.stringify(merged));
      return merged;
    });
  };

  const getHistory = (key: string | null) => {
    if (!key) return [];
    return history[key] ?? [];
  };

  const commitHistory: DevModeContextValue["commitHistory"] = (i, draft) => {
    const key = getInteractionKey(i);
    if (!key) return;

    const entry: DevInteractionHistoryEntry = {
      id: makeId("dev_hist"),
      at: nowIso(),
      key,
      elementDevId: i.elementDevId,
      elementId: i.elementId,
      action: i.action,
      backend: draft.backend,
      ia: draft.ia,
    };

    setHistoryState((prev) => {
      const nextList = [entry, ...(prev[key] ?? [])].slice(0, 50);
      const merged = { ...prev, [key]: nextList };
      localStorage.setItem(STORAGE.history, JSON.stringify(merged));
      return merged;
    });
  };

  // Track meta for stable export (so IA export can show identifiers even if draft exists)
  useEffect(() => {
    if (!enabled) return;
    const key = getInteractionKey(lastInteraction);
    if (!key || !lastInteraction) return;
    setMetaState((prev) => {
      const next: DevInteractionMeta = {
        key,
        elementDevId: lastInteraction.elementDevId,
        elementId: lastInteraction.elementId,
        action: lastInteraction.action,
        lastSeenAt: nowIso(),
      };
      const merged = { ...prev, [key]: next };
      localStorage.setItem(STORAGE.meta, JSON.stringify(merged));
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, lastInteraction?.id]);

  const upsertSnippet: DevModeContextValue["upsertSnippet"] = (patch) => {
    setSnippets((prev) => {
      const at = nowIso();
      const idx = prev.findIndex((s) => s.id === patch.id);
      if (idx === -1) {
        const next: DevSnippet = {
          id: patch.id,
          title: patch.title ?? "Backend Note",
          body: patch.body ?? "",
          createdAt: at,
          updatedAt: at,
        };
        const merged = [next, ...prev];
        // Autosave: mantener persistente sin depender de Dev Save.
        localStorage.setItem(STORAGE.snippets, JSON.stringify(merged));
        return merged;
      }
      const cur = prev[idx];
      const next: DevSnippet = {
        ...cur,
        ...patch,
        updatedAt: at,
      };
      const copy = prev.slice();
      copy[idx] = next;
      localStorage.setItem(STORAGE.snippets, JSON.stringify(copy));
      return copy;
    });
  };

  const removeSnippet = (id: string) => {
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE.snippets, JSON.stringify(next));
      return next;
    });
  };

  const getSnippetHistory = (snippetId: string | null) => {
    if (!snippetId) return [];
    return snippetHistory[snippetId] ?? [];
  };

  const commitSnippetHistory = (snippetId: string) => {
    const snip = snippets.find((s) => s.id === snippetId);
    if (!snip) return;
    const body = snip.body ?? "";
    if (!body.trim()) return;

    setSnippetHistory((prev) => {
      const prevList = prev[snippetId] ?? [];
      const last = prevList[0];
      // Avoid duplicates when nothing changed.
      if (last && last.body === body && last.title === snip.title) return prev;

      const entry: DevSnippetHistoryEntry = {
        id: makeId("dev_snip_hist"),
        at: nowIso(),
        snippetId,
        title: snip.title,
        body,
      };
      const nextList = [entry, ...prevList].slice(0, 50);
      const merged = { ...prev, [snippetId]: nextList };
      localStorage.setItem(STORAGE.snippetHistory, JSON.stringify(merged));
      return merged;
    });
  };

  const ensureOneSnippet = () => {
    if (snippets.length > 0) return snippets[0].id;
    const id = makeId("dev_snip");
    upsertSnippet({ id, title: "Backend Instructions", body: "" });
    return id;
  };

  const devSave = () => {
    // DEV-ID: dev-save
    localStorage.setItem(STORAGE.snippets, JSON.stringify(snippets));
    localStorage.setItem(STORAGE.snippetHistory, JSON.stringify(snippetHistory));
    // Also persist drafts/history/meta (future reloads)
    localStorage.setItem(STORAGE.drafts, JSON.stringify(drafts));
    localStorage.setItem(STORAGE.history, JSON.stringify(history));
    localStorage.setItem(STORAGE.meta, JSON.stringify(meta));

    // Commit snippet history entries for changed snippets
    snippets.forEach((s) => commitSnippetHistory(s.id));

    // Commit the current "last interaction" draft into history (if any meaningful text).
    const key = getInteractionKey(lastInteraction);
    const d = key ? drafts[key] : null;
    if (lastInteraction && d && (d.backend.trim() || d.ia.trim())) {
      commitHistory(lastInteraction, { backend: d.backend, ia: d.ia });
      logEvent("dev_save", "Dev Save: notas + historial guardados", { key });
    } else {
      logEvent("dev_save", "Dev Save: estado persistido", { count: snippets.length });
    }
  };

  const iaDevSave = () => {
    // DEV-ID: ia-dev-save
    const snapshotId = makeId("ia_dev");
    const snapshot: DevSnapshot = {
      id: snapshotId,
      at: nowIso(),
      kind: "ia_dev_snapshot_v1",
      snippets,
      events,
      lastInteraction,
    };

    localStorage.setItem(STORAGE.lastSnapshot, JSON.stringify(snapshot));
    logEvent("ia_dev_save", "IA,Dev export generado", { snapshotId });

    const lastExportAt = safeParseJson<string>(localStorage.getItem(STORAGE.lastAiExportAt));
    const sinceIso = typeof lastExportAt === "string" ? lastExportAt : null;
    const sinceMs = sinceIso ? Date.parse(sinceIso) : null;

    // Export "IA friendly": solo IDs + comentarios/notas relevantes (sin el spam del event log).
    const items = Object.keys({ ...drafts, ...history, ...meta })
      .map((key) => {
        const m = meta[key];
        const d = drafts[key];
        const hList = history[key] ?? [];
        const h0 = hList[0];
        const hNew = sinceMs ? hList.find((h) => Date.parse(h.at) > sinceMs) : null;
        const draftNew = d && sinceMs ? Date.parse(d.updatedAt) > sinceMs : Boolean(d);

        // "Solo cambios": incluir solo si cambió desde el último IA export.
        if (sinceMs) {
          if (!draftNew && !hNew) return null;
        }

        const backend = (d?.backend ?? h0?.backend ?? "").trim();
        const ia = (d?.ia ?? h0?.ia ?? "").trim();
        if (!backend && !ia && !(history[key]?.length)) return null;
        return {
          key,
          elementDevId: m?.elementDevId,
          elementId: m?.elementId,
          action: m?.action,
          backend,
          ia,
          lastSavedAt: h0?.at ?? null,
          historyCount: history[key]?.length ?? 0,
        };
      })
      .filter(Boolean);

    // Snippet changes (solo cambios desde el último export)
    const snippetChanges = Object.values(snippetHistory)
      .flat()
      .filter((e) => (sinceMs ? Date.parse(e.at) > sinceMs : true))
      .map((e) => ({
        snippetId: e.snippetId,
        at: e.at,
        title: e.title,
        body: e.body,
      }));

    const aiExport = {
      id: snapshotId,
      at: snapshot.at,
      kind: "ia_dev_export_v1",
      changesOnly: Boolean(sinceMs),
      since: sinceIso,
      // Prefer keyed interaction to avoid "key: null" when the last click was e.g. close/backdrop.
      lastInteraction: lastKeyedInteraction
        ? {
            key: getInteractionKey(lastKeyedInteraction),
            elementDevId: lastKeyedInteraction.elementDevId,
            elementId: lastKeyedInteraction.elementId,
            action: lastKeyedInteraction.action,
          }
        : null,
      items,
      snippetChanges,
    };

    downloadJson(`ia-dev-export-${snapshotId}.json`, aiExport);
    localStorage.setItem(STORAGE.lastAiExportAt, JSON.stringify(snapshot.at));
  };

  const setLastInteractionPersisted: DevModeContextValue["setLastInteraction"] = (i) => {
    setLastInteraction(i);
    localStorage.setItem(STORAGE.lastInteraction, JSON.stringify(i));

    const key = getInteractionKey(i);
    if (key && i) {
      setLastKeyedInteraction(i);
      localStorage.setItem(STORAGE.lastKeyedInteraction, JSON.stringify(i));
    }
  };

  const value = useMemo<DevModeContextValue>(
    () => ({
      enabled,
      setEnabled,
      snippets,
      upsertSnippet,
      removeSnippet,
      ensureOneSnippet,
      snippetHistory,
      commitSnippetHistory,
      getSnippetHistory,
      events,
      logEvent,
      clearEvents,
      lastInteraction,
      setLastInteraction: setLastInteractionPersisted,
      lastKeyedInteraction,
      getInteractionKey,
      getDraft,
      setDraft,
      getHistory,
      commitHistory,
      devSave,
      iaDevSave,
    }),
    [enabled, snippets, snippetHistory, events, lastInteraction, lastKeyedInteraction, drafts, history, meta],
  );

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used within DevModeProvider");
  return ctx;
}
