#!/usr/bin/env node
/**
 * One-command bootstrap.
 *
 * Idempotent: safe to run repeatedly. From a fresh `git clone` this is the only
 * thing standing between the repo and a working platform — it is wired to run
 * automatically as `predev`, `prebuild` and `prestart`, so `npm run dev` alone
 * brings the whole stack up.
 *
 * Steps (each skipped if already satisfied):
 *   1. install dependencies        (if node_modules is missing)
 *   2. create env files            (server/.env, web/.env.local from .example)
 *   3. generate the Prisma client
 *   4. apply database migrations   (creates server/prisma/dev.db)
 *   5. seed reference data         (subjects, achievements, admin user)
 *
 * Uses only Node built-ins so it runs before dependencies are installed.
 */
import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const server = resolve(root, "server");
const web = resolve(root, "web");

const step = (msg) => console.log(`\n[36m▶ ${msg}[0m`);
const ok = (msg) => console.log(`[32m✓ ${msg}[0m`);
const run = (cmd, cwd = root) =>
  execSync(cmd, { cwd, stdio: "inherit", env: process.env });

// 1. Dependencies (npm workspaces install server + web in one shot).
if (!existsSync(resolve(root, "node_modules"))) {
  step("Installing dependencies (this only happens once)…");
  run("npm install");
} else {
  ok("Dependencies already installed");
}

// 2. Env files — copy from the committed .example templates if absent.
function ensureEnv(label, from, to) {
  if (existsSync(to)) {
    ok(`${label} env already present`);
  } else {
    copyFileSync(from, to);
    ok(`Created ${label} env from example`);
  }
}
step("Configuring environment…");
ensureEnv("server", resolve(server, ".env.example"), resolve(server, ".env"));
ensureEnv("web", resolve(web, ".env.example"), resolve(web, ".env.local"));

// 3. Prisma client — required before the server (or seed) can import it.
step("Generating Prisma client…");
run("npm run db:generate -w server");

// 4. Migrations — creates server/prisma/dev.db and brings the schema up to date.
step("Applying database migrations…");
run("npm run db:deploy -w server");

// 5. Seed — idempotent (upserts + count guards), so re-running is harmless.
step("Seeding reference data…");
run("npm run db:seed -w server");

console.log(
  "\n[32m[1m✓ Platform ready.[0m " +
    "Web → http://localhost:3000   API → http://localhost:4000\n",
);
