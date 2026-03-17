export interface ScanRequest {
  url: string;
  method?: "GET" | "HEAD";
  timeout?: number;
  headers?: Record<string, string>;
  probeCount?: 22 | 50 | 100;
  locations?: string[];
}

export interface RegionResult {
  region: string;
  provider: "aws";
  location: string;
  flag: string;
  latency: number | null;
  statusCode: number | null;
  error?: string;
  timestamp: string;
}

export interface ScanSummary {
  total: number;
  healthy: number;
  timedOut: number;
  p50: number;
  p95: number;
  p99: number;
  best: RegionResult;
  worst: RegionResult;
}

export interface ScanResult {
  scanId: string;
  url: string;
  startedAt: string;
  completedAt: string;
  results: RegionResult[];
  summary: ScanSummary;
}