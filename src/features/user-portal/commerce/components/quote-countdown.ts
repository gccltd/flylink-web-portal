import { useEffect, useState } from "react";

/**
 * Shared quote-countdown helpers for the legacy and wallet-first
 * purchase dialogs. The countdown is display-only: it is anchored at
 * the server-issued `expiresAt` and never gates the confirm/reserve
 * action — quote validity is decided by the server (`quote_expired` /
 * `quote_stale`), never by this tick.
 */
export function formatQuoteCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const twoDigits = (value: number) => String(value).padStart(2, "0");
  if (hours > 0) {
    return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
  }
  return `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

export function useQuoteCountdown(expiresAt: string) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  const remainingMs = Date.parse(expiresAt) - nowMs;
  return {
    remainingMs,
    expired: Number.isFinite(remainingMs) && remainingMs <= 0
  };
}
