# 🌍 latencymap

> Ping your API from 22 real global locations and see exactly where it's slow — in seconds.

![latencymap CLI demo](https://img.shields.io/badge/built%20with-TypeScript-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## What is it?

Most developers only know how their API performs from one location — wherever they're sitting. **latencymap** changes that.

Paste a URL, get back real latency measurements from 22 probe locations across North America, Europe, Asia, Africa and the Middle East. See p50/p95/p99 percentiles, best and worst regions, and exactly where your API is slow — before your users notice.

## Demo
```
$ latencymap ping https://api.example.com

  LATENCYMAP — https://api.example.com
  Scanned at 2026-03-17T10:22:40Z

  p50 42ms   p95 133ms   p99 143ms   22/22 healthy

     REGION           LOCATION          LATENCY     DISTRIBUTION
  ──────────────────────────────────────────────────────────────
  🇭🇰 ap-east-1        Hong Kong, HK     24ms       █░░░░░░░░░░░
  🇸🇬 ap-southeast-1   Singapore, SG     25ms       █░░░░░░░░░░░
  🇬🇧 eu-west-2        London, GB        29ms       █░░░░░░░░░░░
  🇮🇳 ap-south-1       Mumbai, IN        32ms       █░░░░░░░░░░░
  🇩🇪 eu-central-1     Frankfurt, DE     48ms       ██░░░░░░░░░░
  🇿🇦 af-south-1       Cape Town, ZA     91ms       ███░░░░░░░░░
  🇳🇬 af-west-1        Lagos, NG         133ms      ████░░░░░░░░

  Best:  🇭🇰 Hong Kong, HK 24ms
  Worst: 🇳🇬 Lagos, NG 143ms
```

## Use it when

- You're about to launch and want to know if your API is globally fast
- You just set up a CDN and want to verify it actually helped
- Users in a specific region are complaining about slowness
- You want to compare latency before and after a deployment
- You're testing a local API via ngrok before deploying

## Quick start

### Web UI

Visit the web dashboard, paste your URL and hit scan.

### CLI
```bash
npx latencymap ping https://your-api.com/health
```

With options:
```bash
# Test specific countries only
npx latencymap ping https://your-api.com --locations IN,SG,DE,US

# Output raw JSON (useful for CI)
npx latencymap ping https://your-api.com --json

# Use HEAD instead of GET (faster)
npx latencymap ping https://your-api.com --method HEAD
```

### API
```bash
curl -X POST http://localhost:3001/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-api.com/health"}'
```

Response:
```json
{
  "scanId": "uuid",
  "summary": {
    "p50": 42,
    "p95": 133,
    "p99": 143,
    "healthy": 22,
    "total": 22,
    "best": { "location": "Hong Kong, HK", "latency": 24 },
    "worst": { "location": "Lagos, NG", "latency": 143 }
  },
  "results": [...]
}
```

## Testing a local API

Use [ngrok](https://ngrok.com) to expose your local server:
```bash
ngrok http 3000
# → https://abc123.ngrok.io

npx latencymap ping https://abc123.ngrok.io
```

This measures real latency from 22 global locations to your laptop — before you deploy.

## How it works
```
Your URL
   ↓
latencymap API (Express)
   ↓
Globalping API → 22 real probe locations worldwide
   ↓
Each probe fires a real HTTP request to your URL
   ↓
Results aggregated → p50/p95/p99 calculated
   ↓
Response returned to CLI or UI
```

Powered by the [Globalping](https://globalping.io) probe network — 600+ real servers worldwide.

## Architecture
```
packages/
├── agent/    Cloudflare Worker probe
├── api/      Express REST API + Globalping integration
├── cli/      latencymap npm CLI
└── ui/       Next.js + Tailwind dashboard

infra/
└── main.tf   Terraform (optional AWS Lambda deployment)
```

## Tech stack

- **TypeScript** — end to end
- **Cloudflare Workers** — edge agent
- **Express.js** — REST API
- **Globalping API** — real global probes
- **Next.js + Tailwind** — web dashboard
- **npm workspaces** — monorepo

## Self hosting

### 1. Clone
```bash
git clone https://github.com/Nithesh-1011/latencymap
cd latencymap
npm install
```

### 2. Run the API
```bash
cd packages/api
npm run dev
# → http://localhost:3001
```

### 3. Run the UI
```bash
cd packages/ui
npm run dev
# → http://localhost:3000
```

### 4. Deploy the Cloudflare Worker
```bash
cd packages/agent
wrangler deploy
```

## Environment variables
```env
# packages/api
PORT=3001
WORKER_URL=https://latencymap-agent.latencymap.workers.dev

# packages/ui
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## License

MIT © [Nithesh](https://github.com/Nithesh-1011)
