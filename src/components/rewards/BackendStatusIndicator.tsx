"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function BackendStatusIndicator() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        // Use environment variable or fallback to localhost for development
        // Remove trailing slash to prevent double slashes
        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
        const response = await fetch(`${backendUrl}/`, {
          method: "GET",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setStatus("online");
        } else {
          setStatus("offline");
        }
      } catch (error) {
        setStatus("offline");
      }
    };

    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === "online") {
    return null; // Don't show anything if backend is online
  }

  return (
    <div
      className={`mb-4 p-3 rounded-lg border ${
        status === "offline"
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        {status === "checking" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking backend connection...</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>
              Backend server is offline. Rewards may not update. Start it with:{" "}
              <code className="bg-zinc-800 px-2 py-0.5 rounded text-xs">npm run backend</code>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

