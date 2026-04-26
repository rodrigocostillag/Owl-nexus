import { useEffect } from "react";
import { useDevMode } from "../developer/DevModeContext";
import DeveloperDock from "../developer/DeveloperDock";
import AiOverlayPanel from "./AiOverlayPanel";
import { useRightPanel } from "./RightPanelContext";

// DEV-ID: right-panel-host
export default function RightPanelHost() {
  const dev = useDevMode();
  const rp = useRightPanel();

  // Decide which panel is active when states change.
  useEffect(() => {
    if (rp.aiOpen) {
      rp.setActivePanel("ai");
      return;
    }
    if (dev.enabled) {
      rp.setActivePanel("dev");
      return;
    }
    rp.setActivePanel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rp.aiOpen, dev.enabled]);

  if (rp.activePanel === "ai") return <AiOverlayPanel />;
  if (rp.activePanel === "dev") return <DeveloperDock />;
  return null;
}

