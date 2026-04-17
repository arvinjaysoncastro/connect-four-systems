"use client";

import { useCallback, useEffect, useState } from "react";
import { getConnectFourApiBaseUrl } from "@/features/connect-four/config/env";

const HEALTH_PATH = "/health";
const POLL_INTERVAL_MS = 30000;

export function useConnectivity() {
  const [actualIsOnline, setActualIsOnline] = useState(true);
  const [manualOffline, setManualOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isOnline = manualOffline ? false : actualIsOnline;

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    const apiBaseUrl = getConnectFourApiBaseUrl();

    if (!apiBaseUrl) {
      setActualIsOnline(false);
      setIsChecking(false);
      return false;
    }

    try {
      const response = await fetch(`${apiBaseUrl}${HEALTH_PATH}`, {
        method: "GET",
        cache: "no-store",
      });

      const success = response.ok;
      setActualIsOnline(success);
      return success;
    } catch {
      setActualIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const goOffline = useCallback(() => {
    setManualOffline(true);
  }, []);

  const goOnline = useCallback(async (): Promise<boolean> => {
    setManualOffline(false);
    return checkConnectivity();
  }, [checkConnectivity]);

  useEffect(() => {
    let cancelled = false;

    void checkConnectivity().then(() => {
      if (cancelled) {
        return;
      }
    });

    const intervalId = window.setInterval(() => {
      void checkConnectivity();
    }, POLL_INTERVAL_MS);

    const handleFocus = () => {
      void checkConnectivity();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, [checkConnectivity]);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    document.title = isOnline ? "🟢 Connect Four" : "⚠️ Offline - Connect Four";
  }, [isChecking, isOnline]);

  return {
    isOnline,
    isChecking,
    refreshConnectivity: checkConnectivity,
    goOffline,
    goOnline,
    isManualOffline: manualOffline,
  };
}
