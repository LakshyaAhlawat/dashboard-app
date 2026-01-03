"use client";

import { useEffect } from "react";

// Small client-side heartbeat that periodically asks the backend
// to generate a synthetic order. This runs whenever any /dashboard
// page is open, so the overview and analytics stay live without
// manual refresh.
export default function OrderGeneratorHeartbeat() {
  useEffect(() => {
    let isCancelled = false;

    async function generateOnce() {
      try {
        // Check config before generating to respect user limits/settings.
        const configRes = await fetch("/api/orders/config");
        const config = await configRes.json();
        if (!config.generationEnabled) {
          return;
        }

        await fetch("/api/orders/generate", {
          method: "POST",
        });
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to trigger order generation", error);
        }
      }
    }

    // Kick off immediately, then every 10 seconds.
    generateOnce();
    const id = setInterval(generateOnce, 10000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
}
