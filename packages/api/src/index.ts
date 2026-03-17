import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { runScan } from "./orchestrator";
import { ScanRequest } from "./types";

const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------------------------
// Rate limiter — max 10 scans per IP per minute
// ------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const window = 60_000;
  const max = 10;

  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return next();
  }

  if (entry.count >= max) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
  }

  entry.count++;
  next();
}

// ------------------------------------------------
// URL validation
// ------------------------------------------------
function validateUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// ------------------------------------------------
// Routes
// ------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/scan", rateLimit, async (req: Request, res: Response) => {
  const { url, method, timeout, headers, probeCount, locations } =
    req.body as Partial<ScanRequest>;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }

  const validatedUrl = validateUrl(url);
  if (!validatedUrl) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (
    timeout !== undefined &&
    (typeof timeout !== "number" || timeout < 1000 || timeout > 30_000)
  ) {
    return res.status(400).json({
      error: "timeout must be between 1000 and 30000ms",
    });
  }

  const request: ScanRequest = {
    url: validatedUrl,
    method: method ?? "GET",
    timeout: timeout ?? 10_000,
    headers,
    probeCount: probeCount ?? 22,
    locations,
  };

  try {
    console.log(`[api] locations:`, locations);
    console.log(`[api] probeCount:`, probeCount);
    console.log(`[api] Starting scan → ${validatedUrl}`);
    const result = await runScan(request);
    console.log(`[api] Done → p50=${result.summary.p50}ms`);
    return res.json(result);
  } catch (err) {
    console.error("[api] Scan failed:", err);
    return res.status(500).json({ error: "Scan failed. Please try again." });
  }
});

// ------------------------------------------------
// Start server
// ------------------------------------------------
const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`latencymap API → http://localhost:${PORT}`);
});

export default app;
