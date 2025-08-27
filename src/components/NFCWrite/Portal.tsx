import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// TypeScript types for visualViewport API
interface VisualViewportLike {
  height: number;
  width: number;
  scale: number;
  offsetLeft: number;
  offsetTop: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export const Portal: React.FC<PortalProps> = ({
  children,
  containerId = "portal-root",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Create portal container if it doesn't exist
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;

      // Enhanced mobile viewport handling
      container.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        min-height: 100vh !important;
        min-width: 100vw !important;
        z-index: 9999 !important;
        pointer-events: auto !important;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        /* Handle mobile safe areas */
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
        /* Ensure proper stacking context */
        isolation: isolate;
      `;

      // Add mobile-specific meta viewport handling
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
        );
      }

      document.body.appendChild(container);
    }

    // Handle dynamic viewport height changes (mobile keyboard, etc.)
    const handleViewportChange = () => {
      if (container) {
        // Use dynamic viewport units if supported, fallback to regular viewport
        const visualViewport = (window as any).visualViewport as
          | VisualViewportLike
          | undefined;
        const height = visualViewport?.height || window.innerHeight;
        container.style.height = `${height}px`;
        container.style.minHeight = `${height}px`;
      }
    };

    // Listen for viewport changes
    const visualViewport = (window as any).visualViewport as
      | VisualViewportLike
      | undefined;
    if (visualViewport) {
      visualViewport.addEventListener("resize", handleViewportChange);
    } else {
      window.addEventListener("resize", handleViewportChange);
    }

    // Initial call
    handleViewportChange();

    return () => {
      // Clean up event listeners
      if (visualViewport) {
        visualViewport.removeEventListener("resize", handleViewportChange);
      } else {
        window.removeEventListener("resize", handleViewportChange);
      }

      // Clean up container if it's empty
      if (container && container.children.length === 0) {
        container.remove();
      }
    };
  }, [containerId]);

  if (!mounted) return null;

  const container = document.getElementById(containerId);
  if (!container) return null;

  return createPortal(children, container);
};
