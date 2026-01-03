"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function ChatHeartbeat() {
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/chat/generate", { method: "POST" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.created || cancelled) return;

        const id = data.message?.customerId || "new";
        showToast({
          title: "New chat waiting",
          description: `Customer #${id} just sent a message.
Open the Chat tab to respond.`,
          variant: "default",
        });
      } catch (error) {
        // Silent fail; this is best-effort demo traffic
        console.error("Chat heartbeat failed", error);
      }
    }

    const interval = setInterval(tick, 15000);
    tick();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showToast]);

  return null;
}
