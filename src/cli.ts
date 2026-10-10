#!/usr/bin/env node
import { Command } from "commander";
import path from "node:path";
import pc from "picocolors";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { extract } from "./pipeline.js";
import { build } from "./generate/build.js";
import { writeBrief } from "./synth/brief.js";
import { readJson, exists, writeJson } from "./util/fs.js";
import { configureLog, log } from "./util/log.js";
import { findFfmpeg } from "./render/ffmpeg.js";
import { VERSION } from "./version.js";
import type { BrandProfile } from "./profile/schema.js";
import type { BrandMode, BrandStrategy } from "./profile/strategy.js";

const program = new Command();
const MODES = ["extract", "extend", "evolve", "reimagine"];

program
  .name("watercolor")
  .description("Turn any URL into a complete brand identity toolkit.")
  .version(VERSION)
  .option("-q, --quiet", "only print warnings and errors")
  .option("-v, --verbose", "debug logging")
  .hook("preAction", (cmd) => configureLog(cmd.opts()));

const captureOpts = (c: Command) =>
  c
    .option("-o, --out <dir>", "output directory", "brand")
    .option("-p, --pages <n>", "extra pages to crawl beyond the homepage", (v) => parseInt(v, 10), 6)
    .option("-m, --mode <mode>", `extract | extend | evolve | reimagine`, "extract")
    .option("--include <urls...>", "additional same-site URLs to crawl")
    .option("--no-recording", "skip the scroll-through recording")
    .option("--no-mobile", "skip the mobile capture")
    .option("--no-canvas", "skip recording animated canvases")
    .option("--no-videos", "skip downloading videos")
    .option("--max-video-mb <n>", "max size per downloaded video", (v) => parseInt(v, 10), 60)
    .option("--headed", "show the browser")
    .option("--user-agent <ua>", "custom user agent");

captureOpts(
  program
    .command("run", { isDefault: true })
    .argument("<url>", "website to turn into a brand kit")
    .description("extract + build in one go (strategy layer: run your agent on .watercolor/brief.md, then `watercolor build`)")
    .option("--no-motion", "skip rendering motion")
    .option("--fast", "smaller, faster motion renders")
    .option("--no-guidelines", "skip the brand book"),
).action(async (url: string, o) => {
  banner();
  const mode = checkMode(o.mode);
  await extract(url, o.out, toCapture(o, mode));
  await build({ dir: o.out, motion: o.motion, fast: o.fast, guidelines: o.guidelines });
  done(o.out);
});

captureOpts(program.command("extract").argument("<url>").description("capture the site and write brand.json + the agent brief")).action(async (url: string, o) => {
  banner();
  const mode = checkMode(o.mode);
  await extract(url, o.out, toCapture(o, mode));
  console.log(`\n  Next: have your agent read ${pc.cyan(path.join(o.out, ".watercolor/brief.md"))} and write ${pc.cyan(path.join(o.out, "strategy.json"))}, then run ${pc.cyan(`watercolor build ${o.out}`)}\n`);
});

program
  .command("build")
  .argument("[dir]", "brand directory", "brand")
  .description("generate tokens, docs, assets, motion and guidelines from brand.json + strategy.json")
  .option("--no-motion", "skip rendering motion")
  .option("--fast", "smaller, faster motion renders")
  .option("--fps <n>", "motion frame rate", (v) => parseInt(v, 10))
  .option("--no-guidelines", "skip the brand book")
  .option("--only <parts>", "comma-separated: tokens,logo,patterns,social,stationery,motion,docs,guidelines")
  .action(async (dir: string, o) => {
    banner();
    await requireProfile(dir);
    await build({ dir, motion: o.motion, fast: o.fast, fps: o.fps, guidelines: o.guidelines, only: o.only ? String(o.only).split(",").map((s: string) => s.trim()) : undefined });
    done(dir);
  });

program
  .command("profile")
  .argument("[dir]", "brand directory", "brand")
  .description("rebuild brand.json from the saved capture (no re-crawl) — use after upgrading watercolor")
  .action(async (dir: string) => {
    const { buildProfile } = await import("./extract/index.js");
    const capFile = path.join(dir, ".watercolor", "capture.json");
    if (!(await exists(capFile))) {
      log.error(`No capture in ${dir}. Run \`watercolor extract <url> -o ${dir}\` first.`);
      process.exit(1);
    }
    const p = await buildProfile(await readJson(capFile), path.resolve(dir));
    await writeJson(path.join(dir, "brand.json"), p);
    const sp = path.join(dir, "strategy.json");
    const mode = (await exists(sp)) ? (await readJson<BrandStrategy>(sp)).mode : "extract";
    await writeBrief(p, dir, mode);
    log.ok("brand.json and brief rebuilt");
  });

program
  .command("brief")
  .argument("[dir]", "brand directory", "brand")
  .option("-m, --mode <mode>", "extract | extend | evolve | reimagine")
  .description("(re)write .watercolor/brief.md — the evidence pack an agent uses to write strategy.json")
  .action(async (dir: string, o) => {
    const p = await requireProfile(dir);
    const sp = path.join(dir, "strategy.json");
    const current = (await exists(sp)) ? await readJson<BrandStrategy>(sp) : ({ version: "1", mode: "extract" } as BrandStrategy);
    const mode = o.mode ? checkMode(o.mode) : current.mode;
    if (mode !== current.mode) await writeJson(sp, { ...current, mode });
    const f = await writeBrief(p, dir, mode);
    log.ok(`Brief written: ${f}`);
  });

program
  .command("mode")
  .argument("<mode>", "extract | extend | evolve | reimagine")
  .argument("[dir]", "brand directory", "brand")
  .description("switch the kit's mode (then have your agent update strategy.json and rebuild)")
  .action(async (m: string, dir: string) => {
    const mode = checkMode(m);
    const sp = path.join(dir, "strategy.json");
    const current = (await exists(sp)) ? await readJson<BrandStrategy>(sp) : ({ version: "1" } as BrandStrategy);
    await writeJson(sp, { ...current, mode });
    await writeBrief(await requireProfile(dir), dir, mode);
    log.ok(`Mode set to ${mode}. Brief refreshed at ${path.join(dir, ".watercolor/brief.md")}`);
  });

program
  .command("synthesize")
  .argument("[dir]", "brand directory", "brand")
  .description("write strategy.json with Claude via the Anthropic API (needs ANTHROPIC_API_KEY) — skip this when an agent runs the skill")
  .option("--model <id>", "Claude model id")
  .action(async (dir: string, o) => {
    const { synthesize } = await import("./synth/llm.js");
    await requireProfile(dir);
    await synthesize(dir, { model: o.model });
  });

program
  .command("imagine")
  .argument("[dir]", "brand directory", "brand")
  .description("optional: generate on-brand imagery with an image model (OPENAI_API_KEY or FAL_KEY)")
  .option("-n, --count <n>", "images per prompt", (v) => parseInt(v, 10), 1)
  .option("--prompt <text>", "extra art direction")
  .action(async (dir: string, o) => {
    const { imagine } = await import("./imagine/index.js");
    await requireProfile(dir);
    await imagine(dir, { count: o.count, prompt: o.prompt });
  });

program
  .command("remotion")
  .argument("[dir]", "brand directory", "brand")
  .description("scaffold a Remotion project wired to the brand (optional; see license note)")
  .action(async (dir: string) => {
    const { scaffoldRemotion } = await import("./generate/remotion/index.js");
    await requireProfile(dir);
    await scaffoldRemotion(dir);
  });

program
  .command("doctor")
  .description("check that Chromium and ffmpeg are available")
  .action(async () => {
    banner();
    let ok = true;
    try {
      const b = await chromium.launch();
      log.ok(`Chromium ${b.version()}`);
      await b.close();
    } catch {
      ok = false;
      log.error("Chromium missing — run: npx playwright install chromium");
    }
    const ff = await findFfmpeg();
    if (ff) log.ok(`ffmpeg: ${ff}`);
    else log.warn("ffmpeg not found — motion & recordings will be skipped. Install it (brew install ffmpeg) or `npm i ffmpeg-static`.");
    const unzip = spawnSync("unzip", ["-v"], { stdio: "ignore" }).status === 0;
    if (unzip) log.ok("unzip available (brand-kit archives are expanded)");
    log.info(`ANTHROPIC_API_KEY ${process.env.ANTHROPIC_API_KEY ? "set" : "not set"} (only needed for \`watercolor synthesize\`)`);
    log.info(`OPENAI_API_KEY / FAL_KEY ${process.env.OPENAI_API_KEY || process.env.FAL_KEY ? "set" : "not set"} (only needed for \`watercolor imagine\`)`);
    process.exitCode = ok ? 0 : 1;
  });

function toCapture(o: Record<string, unknown>, mode: BrandMode) {
  return {
    maxPages: o.pages as number,
    include: o.include as string[] | undefined,
    recordScroll: o.recording as boolean,
    mobile: o.mobile as boolean,
    canvas: o.canvas as boolean,
    videos: o.videos as boolean,
    maxVideoMB: o.maxVideoMb as number,
    headed: o.headed as boolean,
    userAgent: o.userAgent as string | undefined,
    mode,
  };
}

function checkMode(m: string): BrandMode {
  if (!MODES.includes(m)) {
    log.error(`Unknown mode "${m}". Use one of: ${MODES.join(", ")}`);
    process.exit(2);
  }
  return m as BrandMode;
}

async function requireProfile(dir: string) {
  const f = path.join(dir, "brand.json");
  if (!(await exists(f))) {
    log.error(`No brand.json in ${dir}. Run \`watercolor extract <url> -o ${dir}\` first.`);
    process.exit(1);
  }
  return readJson<BrandProfile>(f);
}

function banner() {
  log.banner(`v${VERSION} · url → brand`);
}

function done(dir: string) {
  console.log(`
  ${pc.bold("Your brand kit is ready.")}
    ${pc.cyan(path.join(dir, "WATERCOLOR.md"))}            the brand file for agents & humans
    ${pc.cyan(path.join(dir, "guidelines/index.html"))}    the brand book
    ${pc.cyan(path.join(dir, "tokens/"))}                  CSS · Tailwind · DTCG · Figma
`);
}

program.parseAsync().catch((e) => {
  log.error(e instanceof Error ? e.message : String(e));
  if (process.env.DEBUG) console.error(e);
  process.exit(1);
});
