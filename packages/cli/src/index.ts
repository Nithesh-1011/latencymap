#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { ScanResult } from "./types";

const API_BASE = process.env.LATENCYMAP_API ?? "https://api.latencymap.dev";

const program = new Command();

program
    .name("latencymap")
    .description("Multi-region endpoint latency mapper")
    .version("1.0.0");

program
    .command("ping <url>")
    .description("Ping an endpoint from 22 AWS regions")
    .option("-m, --method <method>", "HTTP method", "GET")
    .option("-t, --timeout <ms>", "Timeout per region in ms", "10000")
    .option("--json", "Output raw JSON")
    .action(async (url: string, opts) => {

        const spinner = ora(`Scanning ${chalk.cyan(url)}...`).start();

        try {
            const res = await fetch(`${API_BASE}/scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                    method: opts.method,
                    timeout: parseInt(opts.timeout, 10),
                }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
                spinner.fail(`API error: ${errBody.error}`);
                process.exit(1);
            }

            const result = await res.json() as ScanResult;
            spinner.succeed(`Scan complete  ${chalk.dim(`scanId: ${result.scanId}`)}`);

            if (opts.json) {
                console.log(JSON.stringify(result, null, 2));
                return;
            }

            printTable(result);

        } catch (err) {
            spinner.fail(`Failed: ${err instanceof Error ? err.message : String(err)}`);
            process.exit(1);
        }
    });

function latencyColor(ms: number | null): string {
    if (ms === null) return chalk.red("timeout");
    if (ms < 100) return chalk.green(`${ms}ms`);
    if (ms < 250) return chalk.yellow(`${ms}ms`);
    if (ms < 500) return chalk.hex("#FF8800")(`${ms}ms`);
    return chalk.red(`${ms}ms`);
}

function bar(ms: number | null): string {
    if (ms === null) return chalk.red("████░░░░░░░░░░░░░░░░");
    const filled = Math.min(20, Math.round((ms / 600) * 20));
    const empty = 20 - filled;
    const color = ms < 100 ? chalk.green
        : ms < 250 ? chalk.yellow
            : ms < 500 ? chalk.hex("#FF8800")
                : chalk.red;
    return color("█".repeat(filled)) + chalk.dim("░".repeat(empty));
}

function printTable(result: ScanResult) {
    const { summary, results } = result;

    console.log();
    console.log(`  ${chalk.bold.cyan("LATENCYMAP")} — ${result.url}`);
    console.log(chalk.dim(`  Scanned at ${result.startedAt}`));
    console.log();
    console.log(
        `  ${chalk.dim("p50")} ${chalk.bold(summary.p50 + "ms")}   ` +
        `${chalk.dim("p95")} ${chalk.bold(summary.p95 + "ms")}   ` +
        `${chalk.dim("p99")} ${chalk.bold(summary.p99 + "ms")}   ` +
        `${chalk.green(summary.healthy + "/" + summary.total + " healthy")}`
    );
    console.log();
    console.log(chalk.dim(
        "  " + "   " +
        "REGION".padEnd(22) +
        "LOCATION".padEnd(18) +
        "LATENCY".padEnd(12) +
        "DISTRIBUTION".padEnd(22) +
        "STATUS"
    ));
    console.log(chalk.dim("  " + "─".repeat(82)));

    const sorted = [...results].sort((a, b) => {
        if (a.latency === null) return 1;
        if (b.latency === null) return -1;
        return a.latency - b.latency;
    });

    for (const r of sorted) {
        const status = r.statusCode
            ? r.statusCode < 400
                ? chalk.green(String(r.statusCode))
                : chalk.red(String(r.statusCode))
            : chalk.red("—");

        console.log(
            "  " +
            r.flag + " " +
            r.region.padEnd(22) +
            r.location.padEnd(18) +
            latencyColor(r.latency).padEnd(20) +
            bar(r.latency) + "  " +
            status
        );
    }

    console.log();
    console.log(chalk.dim(`  Best:  `) +
        `${result.summary.best.flag}  ${result.summary.best.location} ` +
        chalk.green(`${result.summary.best.latency}ms`));
    console.log(chalk.dim(`  Worst: `) +
        `${result.summary.worst.flag}  ${result.summary.worst.location} ` +
        chalk.red(`${result.summary.worst.latency}ms`));
    console.log();
}

program.parse();