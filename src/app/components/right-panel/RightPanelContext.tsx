import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";

// DEV-ID: right-panel-context
export type RightPanelId = "dev" | "ai" | "notifications";

type RightPanelContextValue = {
  aiOpen: boolean;
  setAiOpen: (v: boolean) => void;
  toggleAi: () => void;

  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  toggleNotifications: () => void;

  activePanel: RightPanelId | null;
  setActivePanel: (v: RightPanelId | null) => void;

  widthPx: number;
};

const RightPanelContext = createContext<RightPanelContextValue | null>(null);

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<RightPanelId | null>(null);

  const value = useMemo<RightPanelContextValue>(
    () => ({
      aiOpen,
      setAiOpen,
      toggleAi: () => setAiOpen((v) => !v),
      notificationsOpen,
      setNotificationsOpen,
      toggleNotifications: () => setNotificationsOpen((v) => !v),
      activePanel,
      setActivePanel,
      widthPx: 440,
    }),
    [aiOpen, notificationsOpen, activePanel],
  );

  return <RightPanelContext.Provider value={value}>{children}</RightPanelContext.Provider>;
}

export function useRightPanel() {
  const ctx = useContext(RightPanelContext);
  if (!ctx) throw new Error("useRightPanel must be used within RightPanelProvider");
  return ctx;
}
