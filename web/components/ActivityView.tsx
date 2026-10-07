"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadActivity } from "@/lib/activity";
import type { ActivityRecord } from "@/lib/types";
import { explorerTx, shortHash } from "@/lib/config";

export function ActivityView() {
  const [items, setItems] = useState<ActivityRecord[]>([]);
  useEffect(() => setItems(loadActivity()), []);
  return <div className="page"><section className="form-intro"><p className="eyebrow">Activity / recovery</p><h1>Keep the hash. Read the chain.</h1><p className="lede">This page remembers transaction hashes in your browser only as a convenience after submission. It never decides whether a commitment exists, whether a review is final, or who receives a bond.</p></section><section style={{ paddingTop: 42 }}><div className="inline-actions" style={{ justifyContent: "space-between" }}><h2 style={{ marginBottom: 0 }}>Submitted transactions</h2><Link className="secondary-button" href="/">Open the public board</Link></div><div className="activity-list" style={{ marginTop: 24 }}>{items.length ? items.map((item) => <div className="activity-row" key={item.hash}><div><strong>{item.label}</strong><small>{new Date(item.createdAt).toLocaleString()} {item.commitmentId ? ` / commitment #${item.commitmentId}` : ""}</small></div><a href={explorerTx(item.hash)} target="_blank" rel="noreferrer">{shortHash(item.hash)}</a></div>) : <p className="empty-state">No locally remembered submissions. You can still open any canonical commitment directly.</p>}</div></section></div>;
}
