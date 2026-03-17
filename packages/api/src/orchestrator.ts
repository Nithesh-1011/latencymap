import { randomUUID } from "crypto";
import { ScanRequest, ScanResult, RegionResult, ScanSummary } from "./types";

const GLOBALPING_API = "https://api.globalping.io/v1/measurements";

const LOCATIONS = [
  { magic: "us-east",      id: "us-east-1",      location: "N. Virginia",    flag: "🇺🇸" },
  { magic: "us-west",      id: "us-west-1",      location: "N. California",  flag: "🇺🇸" },
  { magic: "us-central",   id: "us-central-1",   location: "Chicago",        flag: "🇺🇸" },
  { magic: "CA",           id: "ca-central-1",   location: "Canada",         flag: "🇨🇦" },
  { magic: "BR",           id: "sa-east-1",      location: "São Paulo",      flag: "🇧🇷" },
  { magic: "GB",           id: "eu-west-2",      location: "London",         flag: "🇬🇧" },
  { magic: "FR",           id: "eu-west-3",      location: "Paris",          flag: "🇫🇷" },
  { magic: "DE",           id: "eu-central-1",   location: "Frankfurt",      flag: "🇩🇪" },
  { magic: "SE",           id: "eu-north-1",     location: "Stockholm",      flag: "🇸🇪" },
  { magic: "PL",           id: "eu-central-2",   location: "Warsaw",         flag: "🇵🇱" },
  { magic: "ZA",           id: "af-south-1",     location: "Cape Town",      flag: "🇿🇦" },
  { magic: "NG",           id: "af-west-1",      location: "Lagos",          flag: "🇳🇬" },
  { magic: "IN",           id: "ap-south-1",     location: "Mumbai",         flag: "🇮🇳" },
  { magic: "SG",           id: "ap-southeast-1", location: "Singapore",      flag: "🇸🇬" },
  { magic: "AU",           id: "ap-southeast-2", location: "Sydney",         flag: "🇦🇺" },
  { magic: "JP",           id: "ap-northeast-1", location: "Tokyo",          flag: "🇯🇵" },
  { magic: "KR",           id: "ap-northeast-2", location: "Seoul",          flag: "🇰🇷" },
  { magic: "HK",           id: "ap-east-1",      location: "Hong Kong",      flag: "🇭🇰" },
  { magic: "ID",           id: "ap-southeast-3", location: "Jakarta",        flag: "🇮🇩" },
  { magic: "AE",           id: "me-south-1",     location: "Dubai",          flag: "🇦🇪" },
  { magic: "IL",           id: "me-central-1",   location: "Tel Aviv",       flag: "🇮🇱" },
  { magic: "MX",           id: "na-south-1",     location: "Mexico City",    flag: "🇲🇽" },
];

// Step 1 — create measurement
async function createMeasurement(request: ScanRequest): Promise<string> {
  const target = new URL(request.url).hostname;
  const limit = request.probeCount ?? 22;

  // if user picked specific locations use those
  // otherwise use our default LOCATIONS list
  const selectedLocations = request.locations
    ? request.locations.map(l => ({ country: l }))
    : LOCATIONS.slice(0, limit).map(l =>
        l.magic.length === 2
          ? { country: l.magic }
          : { magic: l.magic }
      );

  const res = await fetch(GLOBALPING_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "http",
      target,
      limit: request.locations ? request.locations.length : limit,
      locations: selectedLocations,
      measurementOptions: {
        request: {
          method: request.method ?? "GET",
          path: new URL(request.url).pathname || "/",
        }
      }
    }),
  });

  const data = await res.json() as { id: string };
  return data.id;
}


// Step 2 — poll until finished
async function pollResults(id: string): Promise<any> {
  const maxAttempts = 10;
  const delay = 1500;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, delay));

    const res = await fetch(`${GLOBALPING_API}/${id}`);
    const data = await res.json() as any;

    if (data.status === "finished") return data;
  }

  throw new Error("Measurement timed out");
}

// Step 3 — map results to our RegionResult format
function mapResults(data: any): RegionResult[] {
  return data.results.map((r: any, i: number) => {
    const location = LOCATIONS[i] ?? {
      id: r.probe.country,
      location: r.probe.city,
      flag: "🌍"
    };

    const latency = r.result?.timings?.total ?? null;
    const statusCode = r.result?.statusCode ?? null;

    return {
      region: location.id,
      provider: "globalping" as any,
      location: `${r.probe.city}, ${r.probe.country}`,
      flag: location.flag,
      latency,
      statusCode,
      error: r.result?.status !== "finished" ? "failed" : undefined,
      timestamp: new Date().toISOString(),
    };
  });
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function summarize(results: RegionResult[]): ScanSummary {
  const latencies = results
    .filter(r => r.latency !== null)
    .map(r => r.latency as number)
    .sort((a, b) => a - b);

  const healthy = results.filter(
    r => r.statusCode !== null && r.statusCode < 400
  ).length;

  const timedOut = results.filter(r => r.error === "timeout").length;
  const withLatency = results.filter(r => r.latency !== null);

  const best  = withLatency.reduce((a, b) => (a.latency! < b.latency! ? a : b));
  const worst = withLatency.reduce((a, b) => (a.latency! > b.latency! ? a : b));

  return {
    total: results.length,
    healthy,
    timedOut,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    best,
    worst,
  };
}

export async function runScan(request: ScanRequest): Promise<ScanResult> {
  const scanId = randomUUID();
  const startedAt = new Date().toISOString();

  console.log(`[globalping] Creating measurement for ${request.url}`);
  const id = await createMeasurement(request);

  console.log(`[globalping] Polling results for ${id}`);
  const data = await pollResults(id);

  const completedAt = new Date().toISOString();
  const results = mapResults(data);
  const summary = summarize(results);

  return { scanId, url: request.url, startedAt, completedAt, results, summary };
}