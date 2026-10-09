import type { ActivityRecord } from "@/lib/types";
import { REGISTRY_ADDRESS, VAULT_ADDRESS } from "@/lib/config";

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
  const stamped = {
    registryAddress: REGISTRY_ADDRESS,
    vaultAddress: VAULT_ADDRESS,
    ...record,
  };
  const next = [stamped, ...loadActivity().filter((item) => item.hash !== record.hash)].slice(0, 30);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function updateActivity(hash: string, patch: Partial<ActivityRecord>) {
  const current = loadActivity().find((item) => item.hash === hash);
  if (!current) return;
  rememberActivity({ ...current, ...patch, hash });
}
