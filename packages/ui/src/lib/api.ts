import { ScanResult } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function scanUrl(
  url: string,
  probeCount: 22 | 50 | 100 = 22,
  locations?: string[]
): Promise<ScanResult> {

  console.log("scan request →", { url, probeCount, locations });

  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, probeCount, locations }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Scan failed");
  }

  return res.json();
}