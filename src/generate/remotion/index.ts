import path from "node:path";
import { copyFile, readFile } from "node:fs/promises";
import { loadBrand } from "../../profile/resolve.js";
import { write, writeJson, exists, ensureDir } from "../../util/fs.js";
import { firstSentence } from "../html.js";
import { log } from "../../util/log.js";

/**
 * Scaffold a Remotion project pre-wired with the brand's tokens, logo, fonts, screenshots
 * and captured product videos. Remotion is free for individuals and companies of ≤3 people;
 * larger companies need a Remotion company license (https://remotion.dev/license).
 */
export async function scaffoldRemotion(dir: string) {
  const b = await loadBrand(dir);
  const root = path.join(dir, "remotion");
  const pub = path.join(root, "public");
  await ensureDir(pub);

  // Assets
  const copy = async (from: string | undefined, to: string) => {
    if (from && (await exists(from))) {
      await copyFile(from, path.join(pub, to));
      return to;
    }
    return undefined;
  };
  const logo = (await copy(path.join(dir, "logo/svg/logo.svg"), "logo.svg")) ?? (await copy(b.logo.primary, `logo${path.extname(b.logo.primary ?? ".png")}`));
  const fonts: { family: string; file: string; weight: string; style: string }[] = [];
  for (const f of [b.fonts.display, b.fonts.body, b.fonts.mono]) {
    for (const file of f.files.slice(0, 4)) {
      const name = `font-${path.basename(file.path)}`;
      if (await copy(file.path, name)) fonts.push({ family: f.family, file: name, weight: file.weight, style: file.style });
    }
  }
  const shots: string[] = [];
  // The brand's own product story first: home, product, pricing… — never press/blog pages.
  const pageOrder = ["home", "product", "customers", "enterprise", "pricing", "about"];
  const kindOf = (url: string) => b.profile.source.pages.find((p) => p.url === url)?.kind ?? "other";
  const ownShots = b.profile.screenshots
    .filter((s) => !s.fullPage && s.viewport === "desktop" && pageOrder.includes(kindOf(s.page)))
    .sort((x, y) => pageOrder.indexOf(kindOf(x.page)) - pageOrder.indexOf(kindOf(y.page)));
  for (const s of ownShots.slice(0, 5)) {
    const n = `shot-${shots.length + 1}${path.extname(s.path)}`;
    if (await copy(path.join(dir, s.path), n)) shots.push(n);
  }
  const videos: string[] = [];
  for (const v of b.profile.media.videos.filter((v) => v.path).slice(0, 3)) {
    const n = `video-${videos.length + 1}.mp4`;
    if (await copy(path.join(dir, v.path!), n)) videos.push(n);
  }
  // The brand's real animated surface (captured canvas) wins over our recreation.
  const sig = b.profile.media.canvases.find((c) => c.poster && c.poster === b.signatureArt && c.recording);
  const gradientLoop = (sig && (await copy(path.join(dir, sig.recording!), "signature.mp4"))) ?? (await copy(path.join(dir, "motion/gradient-loop.mp4"), "gradient-loop.mp4"));

  const brand = {
    name: b.name,
    domain: b.domain,
    headline: firstSentence(b.copy.taglines[0] ?? b.copy.headline),
    subhead: b.copy.subhead,
    cta: b.copy.cta,
    colors: { background: b.roles.background, foreground: b.roles.foreground, primary: b.roles.primary, primaryForeground: b.roles.primaryForeground, muted: b.roles.muted, inverse: b.roles.inverseBackground, accent: b.roles.accent },
    gradient: b.gradient,
    fonts: { display: b.fonts.display.stack, body: b.fonts.body.stack, mono: b.fonts.mono.stack },
    type: { display: b.type.display, h1: b.type.h1, body: b.type.body },
    radius: b.radius.button,
    motion: b.motion,
    assets: { logo, shots, videos, gradientLoop, fonts },
    // Captured canvases are composited on the page background, so the headline sits on that.
    headlineScene: sig ? { bg: b.roles.background, fg: b.roles.foreground } : { bg: b.roles.inverseBackground, fg: "#ffffff" },
  };

  await writeJson(path.join(root, "package.json"), {
    name: `${b.domain.split(".")[0]}-motion`,
    private: true,
    type: "module",
    scripts: { studio: "remotion studio", render: "remotion render Sizzle out/sizzle.mp4", "render:all": "remotion render LogoReveal out/logo-reveal.mp4 && remotion render Headline out/headline.mp4 && remotion render Sizzle out/sizzle.mp4" },
    dependencies: { remotion: "4.0.534", "@remotion/cli": "4.0.534", react: "19.3.0", "react-dom": "19.3.0" },
    devDependencies: { typescript: "5.9.3", "@types/react": "19.2.2" },
  });
  await write(path.join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: true, skipLibCheck: true } }, null, 2));
  await write(path.join(root, "src/brand.json"), JSON.stringify(brand, null, 2));
  await write(path.join(root, "src/index.ts"), `import { registerRoot } from "remotion";\nimport { Root } from "./Root";\nregisterRoot(Root);\n`);
  await write(path.join(root, "src/Root.tsx"), ROOT);
  await write(path.join(root, "src/compositions.tsx"), COMPOSITIONS);
  await write(
    path.join(root, "README.md"),
    `# ${b.name} — motion (Remotion)\n\nScaffolded by watercolor. Brand values live in \`src/brand.json\`; assets in \`public/\`.\n\n\`\`\`bash\nnpm install\nnpm run studio      # edit live\nnpm run render:all  # render to out/\n\`\`\`\n\nCompositions: **LogoReveal** (1920×1080), **Headline** (1080×1920 vertical), **Sizzle** (1920×1080 — screenshots, product video and gradient with brand type).\n\n> Remotion license: free for individuals and companies with up to 3 employees; larger companies need a company license — https://remotion.dev/license\n`,
  );
  log.ok(`Remotion project scaffolded at ${root} — cd there, npm install, npm run studio`);
  void readFile;
}

const ROOT = `import { Composition } from "remotion";
import { LogoReveal, Headline, Sizzle } from "./compositions";

export const Root = () => (
  <>
    <Composition id="LogoReveal" component={LogoReveal} durationInFrames={120} fps={30} width={1920} height={1080} />
    <Composition id="Headline" component={Headline} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="Sizzle" component={Sizzle} durationInFrames={450} fps={30} width={1920} height={1080} />
  </>
);
`;

const COMPOSITIONS = `import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import brand from "./brand.json";

const bezier = (css: string) => {
  const m = /cubic-bezier\\(([^)]+)\\)/.exec(css);
  const [a, b, c, d] = m ? m[1].split(",").map(Number) : [0.16, 1, 0.3, 1];
  return Easing.bezier(a, b, c, d);
};
const ENTER = bezier(brand.motion.entrance);

const Fonts = () => (
  <style>{brand.assets.fonts.map((f) => \`@font-face{font-family:"\${f.family}";src:url(\${staticFile(f.file)});font-weight:\${f.weight};font-style:\${f.style}}\`).join("")}</style>
);

const Logo = ({ height }: { height: number }) =>
  brand.assets.logo ? <Img src={staticFile(brand.assets.logo)} style={{ height }} /> : <div style={{ fontFamily: brand.fonts.display, fontSize: height, fontWeight: 600 }}>{brand.name}</div>;

const rise = (frame: number, start: number, dur = 24) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ENTER }),
  transform: \`translateY(\${interpolate(frame, [start, start + dur], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ENTER })}px)\`,
});

export const LogoReveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: brand.colors.background, alignItems: "center", justifyContent: "center" }}>
      <Fonts />
      <div style={{ transform: \`scale(\${0.92 + s * 0.08})\`, opacity: s }}>
        <Logo height={150} />
      </div>
      <div style={{ position: "absolute", top: "62%", height: 4, width: 280 * interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ENTER }), background: \`linear-gradient(90deg, \${brand.gradient.join(",")})\`, borderRadius: 4 }} />
    </AbsoluteFill>
  );
};

export const Headline = () => {
  const frame = useCurrentFrame();
  const words = brand.headline.split(" ");
  return (
    <AbsoluteFill style={{ background: brand.headlineScene.bg, color: brand.headlineScene.fg, padding: 96, justifyContent: "flex-end" }}>
      <Fonts />
      {brand.assets.gradientLoop && <OffthreadVideo src={staticFile(brand.assets.gradientLoop)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} muted />}
      <div style={{ position: "relative", fontFamily: brand.fonts.display, fontWeight: brand.type.h1.weight, fontSize: 112, lineHeight: 1.04, letterSpacing: \`\${Math.min(brand.type.h1.letterSpacing, -0.02)}em\`, marginBottom: 280 }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", ...rise(frame, 10 + i * 4) }}>{w + " "}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Sizzle = () => {
  const frame = useCurrentFrame();
  const scenes = [...brand.assets.videos.map((v) => ({ kind: "video", src: v })), ...brand.assets.shots.map((s) => ({ kind: "image", src: s }))].slice(0, 4);
  const per = 90;
  return (
    <AbsoluteFill style={{ background: brand.colors.background, color: brand.colors.foreground, fontFamily: brand.fonts.body }}>
      <Fonts />
      <Sequence durationInFrames={75}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 160 }}>
          <div style={{ fontFamily: brand.fonts.display, fontSize: 96, fontWeight: brand.type.h1.weight, letterSpacing: \`\${brand.type.h1.letterSpacing}em\`, textAlign: "center", ...rise(frame, 6) }}>{brand.headline}</div>
        </AbsoluteFill>
      </Sequence>
      {scenes.map((sc, i) => (
        <Sequence key={i} from={75 + i * per} durationInFrames={per}>
          <AbsoluteFill style={{ padding: 96, alignItems: "center", justifyContent: "center", background: brand.colors.background }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 120px -40px rgba(0,0,0,.35)" }}>
              {sc.kind === "video" ? <OffthreadVideo src={staticFile(sc.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Img src={staticFile(sc.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={75 + scenes.length * per}>
        <AbsoluteFill style={{ background: brand.colors.inverse, alignItems: "center", justifyContent: "center", gap: 48, color: "#fff" }}>
          <Logo height={110} />
          <div style={{ background: brand.colors.primary, color: brand.colors.primaryForeground, padding: "24px 44px", borderRadius: brand.radius, fontSize: 32 }}>{brand.cta}</div>
          <div style={{ opacity: 0.7, fontSize: 28 }}>{brand.domain}</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
`;
