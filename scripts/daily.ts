/**
 * Daily orchestrator: fetch signals → generate cards.
 *
 * Run: npx tsx scripts/daily.ts
 * Requires: GEMINI_API_KEY environment variable
 */

import { execSync } from "node:child_process";
import { resolve } from "node:path";

function log(msg: string) {
  process.stderr.write(`[daily] ${msg}\n`);
}

function run(script: string) {
  const scriptPath = resolve(new URL(".", import.meta.url).pathname, script);
  log(`Running ${script}...`);
  execSync(`npx tsx ${scriptPath}`, { stdio: "inherit" });
}

async function main() {
  const start = Date.now();
  log(`Starting daily pipeline at ${new Date().toISOString()}\n`);

  run("fetch-signals.ts");
  log("");
  run("generate-cards.ts");

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  log(`\nDaily pipeline completed in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
