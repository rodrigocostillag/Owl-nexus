import { useMemo, useState } from "react";
import { useTheme } from "../ThemeContext";
import { Button } from "../ui/button";
import { useNotifications, type NotificationType } from "../notifications/NotificationsContext";
import { X, Bell, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { useRightPanel } from "./RightPanelContext";

function typeIcon(t: NotificationType) {
  if (t === "critical") return CircleAlert;
  if (t === "warning") return TriangleAlert;
  return Info;
}

function typeColor(t: NotificationType, theme: ReturnType<typeof useTheme>["theme"]) {
  if (t === "critical") return theme.colors.error;
  if (t === "warning") return theme.colors.warning;
  return theme.colors.primary;
}

// DEV-ID: notifications-panel
export default function NotificationsPanel() {
  const { theme } = useTheme();
  const rp = useRightPanel();
  const notif = useNotifications();
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const items = useMemo(() => {
    if (filter === "all") return notif.notifications;
    return notif.notifications.filter((n) => n.type === filter);
  }, [filter, notif.notifications]);

  return (
    <aside
      className="fixed right-0 top-0 h-screen w-[440px] z-50 border-l flex flex-col"
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }}
      data-right-panel="true"
      data-dev-id="notifications-right-panel"
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
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Notificaciones</div>
            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
              {notif.unreadCount} sin leer
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            rp.setNotificationsOpen(false);
            rp.setActivePanel(null);
          }}
          title="Cerrar"
          data-dev-id="notifications-close"
        >
          <X />
        </Button>
      </div>

      <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {(["all", "info", "warning", "critical"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className="px-3 py-1.5 rounded-lg text-xs border transition-all"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: filter === k ? `${theme.colors.primary}20` : theme.colors.bg,
                  color: filter === k ? theme.colors.primary : theme.colors.textSecondary,
                }}
                data-dev-id={`notifications-filter-${k}`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={notif.markAllRead} data-dev-id="notifications-readall">
              Marcar leidas
            </Button>
            <Button size="sm" variant="destructive" onClick={notif.clearAll} data-dev-id="notifications-clear">
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4" data-dev-id="notifications-list">
        {items.length === 0 ? (
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Sin notificaciones.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const Icon = typeIcon(n.type);
              const color = typeColor(n.type, theme);
              return (
                <button
                  key={n.id}
                  className="w-full text-left rounded-xl border p-3 transition-all"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: n.read ? theme.colors.bg : `${color}10`,
                  }}
                  onClick={() => notif.markRead(n.id, true)}
                  data-dev-id={`notification-${n.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                          {n.source}
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: theme.colors.textSecondary }}>
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                        {n.message}
                      </div>
                      {!n.read ? (
                        <div className="text-[11px] mt-2" style={{ color }}>
                          Sin leer
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

