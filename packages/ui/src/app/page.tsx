"use client";

import { useState } from "react";
import { ScanResult } from "../types";
import { scanUrl } from "../lib/api";

const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "UK" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "CN", flag: "🇨🇳", name: "China" },
  { code: "TW", flag: "🇹🇼", name: "Taiwan" },
  { code: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "NP", flag: "🇳🇵", name: "Nepal" },
  { code: "MM", flag: "🇲🇲", name: "Myanmar" },
  { code: "KH", flag: "🇰🇭", name: "Cambodia" },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "PA", flag: "🇵🇦", name: "Panama" },
  { code: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "CU", flag: "🇨🇺", name: "Cuba" },
  { code: "DO", flag: "🇩🇴", name: "Dominican Rep." },
  { code: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "CZ", flag: "🇨🇿", name: "Czech Rep." },
  { code: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "RO", flag: "🇷🇴", name: "Romania" },
  { code: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "QA", flag: "🇶🇦", name: "Qatar" },
  { code: "KW", flag: "🇰🇼", name: "Kuwait" },
  { code: "BH", flag: "🇧🇭", name: "Bahrain" },
  { code: "OM", flag: "🇴🇲", name: "Oman" },
  { code: "JO", flag: "🇯🇴", name: "Jordan" },
  { code: "LB", flag: "🇱🇧", name: "Lebanon" },
  { code: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia" },
  { code: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania" },
  { code: "UG", flag: "🇺🇬", name: "Uganda" },
  { code: "CI", flag: "🇨🇮", name: "Ivory Coast" },
  { code: "CM", flag: "🇨🇲", name: "Cameroon" },
  { code: "SN", flag: "🇸🇳", name: "Senegal" },
  { code: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "DZ", flag: "🇩🇿", name: "Algeria" },
  { code: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "LY", flag: "🇱🇾", name: "Libya" },
  { code: "SD", flag: "🇸🇩", name: "Sudan" },
  { code: "AO", flag: "🇦🇴", name: "Angola" },
  { code: "MZ", flag: "🇲🇿", name: "Mozambique" },
  { code: "ZW", flag: "🇿🇼", name: "Zimbabwe" },
  { code: "BG", flag: "🇧🇬", name: "Bulgaria" },
  { code: "HR", flag: "🇭🇷", name: "Croatia" },
  { code: "SK", flag: "🇸🇰", name: "Slovakia" },
  { code: "SI", flag: "🇸🇮", name: "Slovenia" },
  { code: "RS", flag: "🇷🇸", name: "Serbia" },
  { code: "BY", flag: "🇧🇾", name: "Belarus" },
  { code: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "GE", flag: "🇬🇪", name: "Georgia" },
  { code: "AM", flag: "🇦🇲", name: "Armenia" },
  { code: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
];

function latencyColor(ms: number | null): string {
  if (ms === null) return "text-red-500";
  if (ms < 100) return "text-green-400";
  if (ms < 300) return "text-yellow-400";
  return "text-red-400";
}

function latencyBg(ms: number | null): string {
  if (ms === null) return "bg-red-500";
  if (ms < 100) return "bg-green-400";
  if (ms < 300) return "bg-yellow-400";
  return "bg-red-400";
}

function BarChart({ ms }: { ms: number | null }) {
  const pct = ms === null ? 100 : Math.min(100, (ms / 600) * 100);
  return (
    <div className="w-24 h-1.5 bg-gray-700 rounded overflow-hidden">
      <div
        className={`h-full rounded ${latencyBg(ms)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${color ?? "text-white"}`}>
        {value}
        {unit && <span className="text-sm text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("https://");
  const [probeCount, setProbeCount] = useState<22 | 50 | 100>(22);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().startsWith(search.toLowerCase()) ||
      c.code.toLowerCase().startsWith(search.toLowerCase())
  );

  async function handleScan() {
    if (!url || url === "https://") return;
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const data = await scanUrl(
        url,
        probeCount,
        selectedLocations.length > 0 ? selectedLocations : undefined
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  const sorted = result
    ? [...result.results].sort((a, b) => {
      if (a.latency === null) return 1;
      if (b.latency === null) return -1;
      return a.latency - b.latency;
    })
    : [];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🌍</span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            LATENCY<span className="text-cyan-400">MAP</span>
          </h1>
          <p className="text-xs text-gray-500">
            Multi-region endpoint latency analyzer
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* URL Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleScan()}
            placeholder="https://your-api.com/health"
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-cyan-500 placeholder:text-gray-600"
          />
          <button
            onClick={handleScan}
            disabled={scanning}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold px-6 py-3 rounded-lg transition-colors"
          >
            {scanning ? "Scanning..." : "▶ Run Scan"}
          </button>
        </div>

        {/* Coverage + Location picker */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">

          {/* Coverage buttons */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-widest w-24 shrink-0">
              Coverage
            </span>
            <div className="flex gap-2">
              {([22, 50, 100] as const).map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setProbeCount(n);
                    setSelectedLocations([]); // clear locations when coverage clicked
                  }}
                  className={`px-4 py-1.5 rounded text-sm font-mono transition-colors ${selectedLocations.length === 0 && probeCount === n
                    ? "bg-cyan-500 text-black font-bold"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                >
                  {n === 22
                    ? "22 — Standard"
                    : n === 50
                      ? "50 — Detailed"
                      : "100 — Full"}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700" />

          {/* Location search */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-widest w-24 shrink-0 pt-2">
              Locations
            </span>
            <div className="flex gap-4 items-start flex-1">

              {/* Search box + dropdown */}
              <div className="relative w-64">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 placeholder:text-gray-600"
                />

                {/* Dropdown results */}
                {search.length > 0 && (
                  <div className="absolute top-10 left-0 w-full bg-gray-900 border border-gray-600 rounded-lg overflow-y-auto max-h-48 z-10 shadow-xl">
                    {filtered.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No countries found
                      </div>
                    ) : (
                      filtered.map(c => (
                        <button
                          key={c.code}
                          onClick={() => {
                            if (!selectedLocations.includes(c.code)) {
                              setSelectedLocations(prev => [...prev, c.code]);
                            }
                            setSearch("");
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${selectedLocations.includes(c.code)
                            ? "text-cyan-400"
                            : "text-gray-300"
                            }`}
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                          {selectedLocations.includes(c.code) && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-600 mt-1">
                  Search and pick locations. Empty = all regions.
                </p>
              </div>

              {/* Selected tags */}
              {selectedLocations.length > 0 && (
                <div className="flex flex-col gap-2 flex-1">
                  <div className="text-xs text-gray-400">
                    {selectedLocations.length} selected:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocations.map(code => {
                      const c = COUNTRIES.find(c => c.code === code);
                      return (
                        <button
                          key={code}
                          onClick={() =>
                            setSelectedLocations(prev =>
                              prev.filter(l => l !== code)
                            )
                          }
                          className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-xs hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        >
                          {c?.flag} {c?.name} ✕
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setSelectedLocations([])}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors text-left"
                  >
                    ✕ Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Scanning state */}
        {scanning && (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl animate-pulse">🌍</div>
            <p className="text-gray-400">
              Pinging{" "}
              {selectedLocations.length > 0
                ? selectedLocations.length
                : probeCount}{" "}
              locations worldwide...
            </p>
            <p className="text-xs text-gray-600">
              This takes about 10-15 seconds
            </p>
          </div>
        )}

        {/* Results */}
        {result && !scanning && (
          <div className="space-y-6">

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="p50" value={result.summary.p50} unit="ms" />
              <StatCard label="p95" value={result.summary.p95} unit="ms" />
              <StatCard
                label="p99"
                value={result.summary.p99}
                unit="ms"
                color="text-red-400"
              />
              <StatCard
                label="Healthy"
                value={`${result.summary.healthy}/${result.summary.total}`}
                color="text-green-400"
              />
            </div>

            {/* Best / Worst */}
            <div className={`grid gap-3 ${result.results.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              <div className="bg-gray-800 border border-green-800 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Best
                </div>
                <div className="text-lg">
                  {result.summary.best.flag} {result.summary.best.location}
                </div>
                <div className="text-green-400 font-bold text-xl">
                  {result.summary.best.latency}ms
                </div>
              </div>

              {result.results.length > 1 && (
                <div className="bg-gray-800 border border-red-800 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Worst
                  </div>
                  <div className="text-lg">
                    {result.summary.worst.flag} {result.summary.worst.location}
                  </div>
                  <div className="text-red-400 font-bold text-xl">
                    {result.summary.worst.latency}ms
                  </div>
                </div>
              )}
            </div>

            {/* Results table */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest">
                  Region Breakdown
                </h2>
                <span className="text-xs text-gray-600 font-mono">
                  sorted by latency asc
                </span>
              </div>
              <div className="divide-y divide-gray-700/50">
                {sorted.map(r => (
                  <div
                    key={r.region}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-700/30 transition-colors"
                  >
                    <span className="text-xl w-8">{r.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200">{r.location}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {r.region}
                      </div>
                    </div>
                    <BarChart ms={r.latency} />
                    <div
                      className={`font-mono font-bold w-20 text-right text-sm ${latencyColor(r.latency)}`}
                    >
                      {r.latency === null ? "timeout" : `${r.latency}ms`}
                    </div>
                    <div
                      className={`text-xs w-10 text-right font-mono ${r.statusCode && r.statusCode < 400
                        ? "text-green-400"
                        : "text-red-400"
                        }`}
                    >
                      {r.statusCode ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan metadata */}
            <div className="text-xs text-gray-600 font-mono text-center">
              scanId: {result.scanId} · scanned at {result.startedAt}
            </div>

          </div>
        )}
      </div>
    </main >
  );
}