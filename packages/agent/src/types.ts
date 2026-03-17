export interface ScanRequest {
  url: string;
  method?: "GET" | "HEAD";
  timeout?: number;
  headers?: Record<string, string>;
  probeCount?: 22 | 50 | 100;
  locations?: string[];
}

export interface AgentResponse {
  region: string;
  latency: number | null;
  statusCode: number | null;
  error?: string;
  timestamp: string;
}
