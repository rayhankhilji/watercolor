import path from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { loadBrand } from "../profile/resolve.js";
import { Renderer } from "../render/renderer.js";
import { writeTokens } from "./tokens/index.js";
import { fontFaces, brandVars } from "./html.js";
import { buildLogoKit } from "./assets/logo.js";
import { buildPatterns, renderPatterns } from "./assets/patterns.js";
import { renderSocial, SOCIAL_SPECS, type SocialContext } from "./assets/social.js";
import { renderStationery } from "./assets/stationery.js";
import { renderMotion } from "./motion/index.js";
import { writeDocs, type AssetIndex } from "./docs/index.js";
import { buildGuidelines } from "./guidelines/index.js";
import { writeJson } from "../util/fs.js";
import { log } from "../util/log.js";

export interface BuildOptions {
  dir: string;
  motion?: boolean;
  guidelines?: boolean;
  fps?: number;
  fast?: boolean;
}

export async function build(o: BuildOptions) {
  const dir = path.resolve(o.dir);
  const b = await loadBrand(dir);
  log.step(`Building ${b.name} brand kit (${b.strategy.mode} mode)`);
  const r = await Renderer.create(path.join(dir, ".watercolor", "render"));
  const files: string[] = [];
  try {
    log.step("Writing design tokens");
    const { model, files: tf } = await writeTokens(b, dir);
    files.push(...tf);

    log.step("Building logo kit, favicons & app icons");
    const kit = await buildLogoKit(b, r, dir);
    files.push(...kit.files);
    if (kit.markSvg) b.logo.markSvg = kit.markSvg;

    const fontCss = fontFaces(b);
    const vars = brandVars(b, model);

    log.step("Generating patterns");
    const patterns = [...buildPatterns(b, kit.markSvg), ...(b.strategy.extensions?.patterns ?? []).map((p) => ({ name: p.name, title: p.name, description: "Agent-designed extension", svg: p.svg, derived: true }))];
    files.push(...(await renderPatterns(b, r, dir, patterns, fontCss)));

    const render: SocialContext = {
      fontCss,
      vars,
      asset: (rel) => pathToFileURL(path.join(dir, rel)).href,
      hasPattern: (n) => existsSync(path.join(dir, "patterns", `${n}.png`)),
    };
    const editable: SocialContext = {
      fontCss: fontFaces(b, "relative", path.join(dir, "social", "templates")),
      vars,
      asset: (rel) => `../../${rel}`,
      hasPattern: render.hasPattern,
    };

    log.step("Rendering social & OG templates");
    files.push(...(await renderSocial(b, r, dir, render, editable)));

    log.step("Rendering stationery, slides, palette & type specimen");
    files.push(...(await renderStationery(b, r, dir, render, editable)));

    let motion: { name: string; title: string; description: string }[] = [];
    if (o.motion !== false) {
      const m = await renderMotion(b, r, dir, fontCss, vars, { fps: o.fps ?? (o.fast ? 24 : 30), fast: !!o.fast });
      files.push(...m.files);
      motion = m.rendered;
    }

    const assets: AssetIndex = {
      logo: kit.files,
      favicon: kit.files.filter((f) => f.includes("favicon")),
      patterns: patterns.map((p) => ({ name: p.name, title: p.title, description: p.description, derived: p.derived })),
      social: SOCIAL_SPECS.map((s) => ({ name: s.name, title: s.title, use: s.use })),
      motion,
      templates: [],
      markSource: kit.markSource,
    };

    log.step("Writing WATERCOLOR.md and docs");
    files.push(...(await writeDocs(b, model, assets, dir)));

    if (o.guidelines !== false) {
      log.step("Composing brand guidelines (HTML + PDF)");
      files.push(...(await buildGuidelines(b, model, assets, r, dir)));
    }

    await writeJson(path.join(dir, ".watercolor", "build.json"), { builtAt: new Date().toISOString(), mode: b.strategy.mode, files: files.map((f) => path.relative(dir, f)) });
    log.ok(`Built ${files.length} files → ${path.relative(process.cwd(), dir) || "."}`);
    return { files, brand: b };
  } finally {
    await r.close();
  }
}
