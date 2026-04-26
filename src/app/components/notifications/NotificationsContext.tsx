import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// DEV-ID: notifications-types
export type NotificationType = "info" | "warning" | "critical";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  source: string;
  message: string;
  timestamp: string;
  read: boolean;
  deviceId?: string;
  action?: string;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  push: (n: Omit<NotificationItem, "id" | "timestamp" | "read"> & Partial<Pick<NotificationItem, "read">>) => void;
  markRead: (id: string, read: boolean) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const STORAGE_KEY = "nexus_notifications_v1";

function safeParse<T>(raw: string | null): T | null {
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

function makeId() {
  return `notif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// DEV-ID: notifications-provider
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const saved = safeParse<NotificationItem[]>(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) setNotifications(saved);
  }, []);

  const persist = (next: NotificationItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNotifications(next);
  };

  const push: NotificationsContextValue["push"] = (n) => {
    const item: NotificationItem = {
      id: makeId(),
      timestamp: nowIso(),
      read: n.read ?? false,
      type: n.type,
      source: n.source,
      message: n.message,
      deviceId: n.deviceId,
      action: n.action,
    };
    const next = [item, ...notifications].slice(0, 200);
    persist(next);
  };

  const markRead = (id: string, read: boolean) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read } : n));
    persist(next);
  };

  const markAllRead = () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    persist(next);
  };

  const clearAll = () => persist([]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      push,
      markRead,
      markAllRead,
      clearAll,
    }),
    [notifications],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

