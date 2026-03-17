import { AgentResponse, ScanRequest } from "./types";

const USER_AGENT = "latencymap-agent/1.0";

// Cloudflare Worker environment bindings
export interface Env {
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse the scan request from body
    let scanRequest: ScanRequest;
    try {
      scanRequest = await request.json() as ScanRequest;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (!scanRequest.url) {
      return new Response("url is required", { status: 400 });
    }

    const colo = (request as unknown as { cf?: { colo?: string } }).cf?.colo ?? "unknown";
    const result = await measure(scanRequest, colo);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }
};

async function measure(event: ScanRequest, colo: string): Promise<AgentResponse> {
  const region = colo;
  const timeout = event.timeout ?? 10_000;
  const method = event.method ?? "GET";
  const timestamp = new Date().toISOString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const start = performance.now();

  try {
    const response = await fetch(event.url, {
      method,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        ...event.headers,
      },
      redirect: "manual",
    });

    const latency = Math.round(performance.now() - start);

    return {
      region,
      latency,
      statusCode: response.status,
      timestamp,
    };

  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start);
    const isTimeout = err instanceof Error && err.name === "AbortError";

    return {
      region,
      latency: isTimeout ? null : latency,
      statusCode: null,
      error: isTimeout ? "timeout" : (err instanceof Error ? err.message : "unknown error"),
      timestamp,
    };

  } finally {
    clearTimeout(timer);
  }
}