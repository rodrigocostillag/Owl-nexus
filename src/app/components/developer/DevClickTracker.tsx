import { useEffect, useRef } from "react";
import { useDevMode, type DevInteraction } from "./DevModeContext";

function getClosest(el: Element | null, selector: string): HTMLElement | null {
  if (!el) return null;
  return (el as HTMLElement).closest(selector) as HTMLElement | null;
}

function getTextHint(el: HTMLElement) {
  const t = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim();
  return t.length > 120 ? `${t.slice(0, 117)}...` : t;
}

function makeInteractionFromTarget(target: EventTarget | null): DevInteraction | null {
  const el = target instanceof Element ? target : null;
  if (!el) return null;

  // Ignore clicks inside the dev dock itself.
  if (getClosest(el, '[data-dev-id="dev-right-dock"]')) return null;

  // Prefer explicitly tagged dev ids, then fall back to common interactives.
  const tagged =
    getClosest(el, "[data-dev-id]") ||
    getClosest(el, "button") ||
    getClosest(el, "a") ||
    getClosest(el, "input") ||
    getClosest(el, "select") ||
    getClosest(el, "textarea") ||
    getClosest(el, '[role="button"]');

  if (!tagged) return null;

  const elementDevId = tagged.getAttribute("data-dev-id") || undefined;
  const elementId = tagged.id || undefined;
  const action = tagged.getAttribute("data-dev-action") || undefined;
  const backendTemplate = tagged.getAttribute("data-dev-backend") || undefined;
  const iaTemplate = tagged.getAttribute("data-dev-ia") || undefined;

  return {
    id: `click_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    elementDevId,
    elementId,
    action,
    backendTemplate,
    iaTemplate,
    tag: tagged.tagName.toLowerCase(),
    text: getTextHint(tagged),
  };
}

// DEV-ID: dev-click-tracker
export default function DevClickTracker() {
  const dev = useDevMode();
  const setLastInteractionRef = useRef(dev.setLastInteraction);
  const logEventRef = useRef(dev.logEvent);
  const enabledRef = useRef(dev.enabled);

  useEffect(() => {
    setLastInteractionRef.current = dev.setLastInteraction;
    logEventRef.current = dev.logEvent;
    enabledRef.current = dev.enabled;
  }, [dev.setLastInteraction, dev.logEvent, dev.enabled]);

  useEffect(() => {
    if (!dev.enabled) {
      dev.setLastInteraction(null);
      return;
    }

    const onClickCapture = (ev: MouseEvent) => {
      if (!enabledRef.current) return;
      const interaction = makeInteractionFromTarget(ev.target);
      if (!interaction) return;
      setLastInteractionRef.current(interaction);
      logEventRef.current("ui_click", "UI click", interaction);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [dev.enabled]);

  return null;
}
