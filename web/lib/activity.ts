import type { ActivityRecord } from "@/lib/types";

const KEY = "vowmark.activity.v1";

export function loadActivity(): ActivityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? (value as ActivityRecord[]) : [];
  } catch {
    return [];
  }
}

export function rememberActivity(record: ActivityRecord) {
  if (typeof window === "undefined") return;
  const next = [record, ...loadActivity().filter((item) => item.hash !== record.hash)].slice(0, 30);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function updateActivity(hash: string, patch: Partial<ActivityRecord>) {
  const current = loadActivity().find((item) => item.hash === hash);
  if (!current) return;
  rememberActivity({ ...current, ...patch, hash });
}
