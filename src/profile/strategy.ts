/**
 * `strategy.json` — the judgment layer.
 *
 * Extraction measures what a brand *is*. Strategy explains *why* and *how to use it*.
 * It is written by the agent (or by `watercolor synthesize` when an API key is present)
 * after reading `brand/.watercolor/brief.md`, the screenshots, and the reference library
 * in `skills/watercolor/references/`.
 *
 * Every field is optional: generators fall back to heuristics derived from brand.json.
 */

import type { Hex } from "./schema.js";

export type BrandMode = "extract" | "extend" | "evolve" | "reimagine";

export interface BrandStrategy {
  version: "1";
  mode: BrandMode;
  /** Free-form note about what the agent changed and why (evolve / reimagine). */
  rationale?: string;

  company?: {
    name?: string;
    oneLiner?: string;
    description?: string;
    category?: string;
    businessModel?: "B2B" | "B2C" | "B2B2C" | "Prosumer" | string;
    stage?: string;
    audience?: { primary?: string; secondary?: string; buyer?: string; user?: string };
    jobsToBeDone?: string[];
    competitors?: string[];
    differentiators?: string[];
  };

  positioning?: {
    statement?: string;
    promise?: string;
    pillars?: { name: string; description: string }[];
  };

  personality?: {
    summary?: string;
    archetype?: string;
    /** e.g. { trait: "Precise", notThis: "Pedantic" } */
    traits?: { trait: string; notThis: string; description?: string }[];
    /** 0 = left pole, 1 = right pole. */
    spectrum?: {
      formalCasual?: number;
      seriousPlayful?: number;
      technicalAccessible?: number;
      restrainedExpressive?: number;
      classicModern?: number;
      quietLoud?: number;
    };
  };

  voice?: {
    summary?: string;
    principles?: { name: string; description: string; do?: string; dont?: string }[];
    vocabulary?: { use?: string[]; avoid?: string[] };
    mechanics?: string[];
    examples?: { context: string; onBrand: string; offBrand?: string }[];
    taglines?: string[];
  };

  visual?: {
    summary?: string;
    principles?: { name: string; description: string }[];
    colorUsage?: string;
    colorRatio?: { name: string; hex?: Hex; percent: number }[];
    typography?: string;
    layout?: string;
    imagery?: string;
    iconography?: string;
    shape?: string;
    do?: string[];
    dont?: string[];
  };

  motion?: {
    summary?: string;
    principles?: { name: string; description: string }[];
    signature?: string;
  };

  logo?: {
    clearspace?: string;
    minSize?: string;
    misuse?: string[];
    notes?: string;
  };

  /** Evocative names for palette colors, keyed by hex. */
  colorNames?: Record<Hex, string>;

  /** Copy used by social / OG / motion templates. */
  copy?: {
    headlines?: string[];
    taglines?: string[];
    announcement?: string;
  };

  /**
   * Overrides applied on top of extracted values for `evolve` / `reimagine` / `extend`.
   * Anything set here wins over brand.json during `watercolor build`.
   */
  overrides?: {
    roles?: Partial<Record<"background" | "surface" | "foreground" | "muted" | "border" | "primary" | "primaryForeground" | "link", Hex>> & { accent?: Hex[] };
    fonts?: { display?: string; body?: string; mono?: string };
    radius?: string;
    gradient?: Hex[];
  };

  /** Agent-designed additions (extend mode): extra icons, patterns or motion ideas to render. */
  extensions?: {
    icons?: { name: string; svg: string }[];
    patterns?: { name: string; svg: string }[];
    notes?: string[];
  };
}

export const EMPTY_STRATEGY: BrandStrategy = { version: "1", mode: "extract" };
