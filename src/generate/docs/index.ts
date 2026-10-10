import path from "node:path";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { TokenModel } from "../tokens/index.js";
import { write } from "../../util/fs.js";
import * as S from "./sections.js";

export type { AssetIndex } from "./sections.js";

const join = (...parts: string[]) => parts.filter(Boolean).join("\n\n").replace(/\n{3,}/g, "\n\n") + "\n";

/** Split docs live in brand/docs/, so relative links need one more level. */
const relink = (md: string) => md.replace(/\]\((?!https?:|#|\.\.\/)([^)]+)\)/g, "](../$1)");

export async function writeDocs(b: ResolvedBrand, t: TokenModel, assets: S.AssetIndex, outDir: string) {
  const files: string[] = [];
  const watercolor = join(
    S.frontmatter(b),
    S.intro(b),
    toc(),
    S.rulesSection(b),
    S.essenceSection(b),
    S.voiceSection(b),
    S.colorSection(b, t),
    S.typeSection(b),
    S.layoutSection(b),
    S.shapeSection(b),
    S.motionSection(b, assets),
    S.componentsSection(b),
    S.iconSection(b),
    S.imagerySection(b),
    S.logoSection(b, assets),
    S.assetsSection(b, assets),
    S.doDontSection(b),
    S.implementationSection(b),
    S.provenanceSection(b),
  );
  files.push(await write(path.join(outDir, "WATERCOLOR.md"), watercolor));

  const header = (title: string, blurb: string) => `# ${b.name} — ${title}\n\n> ${blurb} Part of the ${b.name} brand kit; the complete reference is [WATERCOLOR.md](../WATERCOLOR.md).`;
  const docs: [string, string][] = [
    ["BRAND.md", join(header("Brand", "Who we are, who it's for, and how it shows up."), S.essenceSection(b), S.logoSection(b, assets), S.imagerySection(b))],
    ["VOICE.md", join(header("Voice & copy", "How we sound — measured from our own words."), S.voiceSection(b), S.doDontSection(b))],
    ["DESIGN.md", join(header("Design system", "Everything needed to build UI that looks like us."), S.rulesSection(b), S.colorSection(b, t), S.typeSection(b), S.layoutSection(b), S.shapeSection(b), S.componentsSection(b), S.iconSection(b), S.implementationSection(b))],
    ["COLOR.md", join(header("Color", "Roles, proportions, contrast and scales."), S.colorSection(b, t))],
    ["TYPOGRAPHY.md", join(header("Typography", "Families, scale and rules."), S.typeSection(b))],
    ["LAYOUT.md", join(header("Layout, spacing & shape", "Grid, rhythm, radii and depth."), S.layoutSection(b), S.shapeSection(b))],
    ["MOTION.md", join(header("Motion", "Timing, curves and the brand's moving surfaces."), S.motionSection(b, assets))],
    ["COMPONENTS.md", join(header("Components", "Computed styles of the real UI, including hover states."), S.componentsSection(b))],
    ["ICONOGRAPHY.md", join(header("Iconography", "Icon style spec and the captured set."), S.iconSection(b))],
  ];
  for (const [name, md] of docs) files.push(await write(path.join(outDir, "docs", name), relink(md)));
  return files;
}

function toc() {
  const items = ["The rules", "Brand essence", "Voice & copy", "Color", "Typography", "Layout & spacing", "Shape & depth", "Motion", "Components", "Iconography", "Imagery & media", "Logo", "Asset index", "Do / Don't", "Implementation", "Provenance"];
  return items.map((t, i) => `${i}. [${t}](#${i}-${t.toLowerCase().replace(/&/g, "").replace(/\//g, "").replace(/'/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")})`).join(" · ");
}
