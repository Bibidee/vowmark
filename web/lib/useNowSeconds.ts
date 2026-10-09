"use client";

import { useEffect, useState } from "react";

function currentUnixSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function useNowSeconds(refreshMs = 1_000) {
  const [now, setNow] = useState(currentUnixSeconds);

  useEffect(() => {
    const refresh = () => setNow(currentUnixSeconds());
    const timer = window.setInterval(refresh, refreshMs);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refreshMs]);

  return now;
}
