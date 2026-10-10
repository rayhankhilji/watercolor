/**
 * The Watercolor brand profile.
 *
 * `brand.json` is the single source of truth produced by `watercolor extract`.
 * Every generator (tokens, docs, assets, motion, guidelines) reads from it, merged
 * with the agent-authored `strategy.json` (see ./strategy.ts).
 *
 * All colors are lowercase 6-digit hex. All lengths are CSS pixels unless noted.
 */

export const PROFILE_VERSION = "1";

export type Hex = string;

export interface BrandProfile {
  $schema?: string;
  version: typeof PROFILE_VERSION;
  generatedAt: string;
  source: SourceInfo;
  identity: Identity;
  company: CompanySignals;
  colors: ColorSystem;
  typography: TypographySystem;
  spacing: SpacingSystem;
  shape: ShapeSystem;
  layout: LayoutSystem;
  motion: MotionSystem;
  logo: LogoSet;
  icons: IconSet;
  imagery: ImagerySet;
  media: MediaSet;
  components: ComponentSet;
  voice: VoiceCorpus;
  stack: TechStack;
  cssVariables: CssVariable[];
  screenshots: Screenshot[];
  warnings: string[];
}

export interface SourceInfo {
  url: string;
  finalUrl: string;
  origin: string;
  pages: { url: string; title: string; kind: PageKind; screenshot?: string }[];
  tool: { name: "watercolor"; version: string };
}

export type PageKind =
  | "home"
  | "about"
  | "pricing"
  | "product"
  | "customers"
  | "careers"
  | "brand"
  | "blog"
  | "enterprise"
  | "docs"
  | "other";

export interface Identity {
  name: string;
  domain: string;
  title: string;
  tagline?: string;
  description?: string;
  themeColor?: Hex;
  social: Record<string, string>;
  organization?: Record<string, unknown>;
}

export interface CompanySignals {
  model: { guess: "B2B" | "B2C" | "B2B2C" | "Prosumer" | "Unknown"; confidence: number; reasons: string[] };
  categories: { name: CompanyCategory; score: number; reasons: string[] }[];
  motion: "product-led" | "sales-led" | "hybrid" | "unknown";
  ctas: { text: string; count: number }[];
  hasPricing: boolean;
  hasEnterprise: boolean;
  hasDocs: boolean;
  hasApi: boolean;
  hasCareers: boolean;
  customers: string[];
  stats: string[];
  keyPhrases: string[];
  pagesText: { url: string; kind: PageKind; excerpt: string }[];
}

export type CompanyCategory =
  | "ai"
  | "devtools"
  | "fintech"
  | "productivity"
  | "design"
  | "consumer"
  | "commerce"
  | "health"
  | "security"
  | "data"
  | "media"
  | "hardware"
  | "education"
  | "marketing"
  | "hr"
  | "web3";

/* ------------------------------------------------------------------ color */

export interface Swatch {
  hex: Hex;
  oklch: { l: number; c: number; h: number };
  /** Share of total weighted usage, 0..1. */
  share: number;
  weight: { background: number; text: number; border: number; svg: number; gradient: number; logo: number };
  contexts: string[];
  /** Human / agent friendly name, e.g. "Blurple 500". Filled by naming heuristics or strategy. */
  name: string;
  /** Original CSS variable names that resolve to this color, if any. */
  variables: string[];
}

export interface ColorRoles {
  background: Hex;
  surface: Hex;
  surfaceAlt: Hex;
  foreground: Hex;
  muted: Hex;
  subtle: Hex;
  border: Hex;
  primary: Hex;
  primaryForeground: Hex;
  accent: Hex[];
  link: Hex;
  inverseBackground: Hex;
  inverseForeground: Hex;
  success?: Hex;
  warning?: Hex;
  danger?: Hex;
}

export interface Gradient {
  css: string;
  type: "linear" | "radial" | "conic" | "mesh" | "shader";
  colors: Hex[];
  angle?: number;
  weight: number;
  source: string;
}

export interface ContrastPair {
  fg: Hex;
  bg: Hex;
  ratio: number;
  apca: number;
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
}

export interface ColorSystem {
  scheme: "light" | "dark" | "mixed";
  palette: Swatch[];
  roles: ColorRoles;
  /** 50..950 OKLCH ramps keyed by role / hue name. The source color is pinned at its nearest step. */
  ramps: Record<string, { pinned: string; steps: Record<string, Hex> }>;
  gradients: Gradient[];
  contrast: ContrastPair[];
}

/* ------------------------------------------------------------- typography */

export type FontRole = "display" | "heading" | "body" | "ui" | "mono" | "accent";

export interface FontFile {
  path: string;
  url: string;
  weight: string;
  style: string;
  format: string;
}

export interface FontFamily {
  /** Human-readable family name ("Söhne"). */
  family: string;
  /** The exact font-family name the site declares in CSS ("sohne-var"). */
  cssFamily: string;
  stack: string;
  roles: FontRole[];
  weights: number[];
  usage: number;
  source: "self-hosted" | "google" | "adobe" | "system" | "unknown";
  variable: boolean;
  files: FontFile[];
  /** Open-license families that read similarly, for when the original is proprietary. */
  alternatives: string[];
  classification: "sans" | "serif" | "mono" | "display" | "script" | "unknown";
}

export interface TypeStyle {
  name: string;
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: string;
  fontStyle: string;
  features: string;
  usage: number;
  tags: string[];
  sample: string;
  color?: Hex;
}

export interface TypographySystem {
  families: FontFamily[];
  styles: TypeStyle[];
  scale: { sizes: number[]; base: number; ratio: number; ratioName: string };
  features: string[];
  /** Typical measure of body copy in characters. */
  measure?: number;
  /** Headline set in two colors (e.g. statement in ink, continuation in slate). */
  twoTone?: { primary: Hex; secondary: Hex; examples: string[] };
}

/* ------------------------------------------------------- spacing & shape */

export interface SpacingSystem {
  base: number;
  scale: number[];
  sectionPadding: number[];
  raw: { value: number; count: number }[];
}

export interface NamedValue {
  name: string;
  value: string;
  count: number;
}

export interface ShapeSystem {
  radii: NamedValue[];
  shadows: NamedValue[];
  borders: { width: number; style: string; color: Hex; count: number }[];
  /** Overall shape language derived from radii. */
  language: "sharp" | "subtle" | "rounded" | "pill" | "mixed";
}

/* ---------------------------------------------------------------- layout */

export interface LayoutSystem {
  containers: { value: number; count: number }[];
  maxWidth: number;
  breakpoints: number[];
  gridColumns: number[];
  gutter: number;
  sectionSpacing: number[];
  density: "airy" | "balanced" | "dense";
  alignment: "centered" | "left" | "mixed";
}

/* ---------------------------------------------------------------- motion */

export interface Easing {
  value: string;
  name: string;
  count: number;
  character: string;
}

export interface Keyframes {
  name: string;
  css: string;
  count: number;
  summary: string;
  properties: string[];
}

export interface MotionSystem {
  durations: { ms: number; count: number }[];
  easings: Easing[];
  keyframes: Keyframes[];
  transitions: { property: string; duration: number; easing: string; count: number }[];
  libraries: string[];
  smoothScroll: boolean;
  intensity: "still" | "subtle" | "expressive" | "cinematic";
  scrollEffects: string[];
}

/* ------------------------------------------------------------------ logo */

export interface LogoAsset {
  path: string;
  source: string;
  format: "svg" | "png" | "jpg" | "webp" | "ico" | "gif" | "other";
  width: number;
  height: number;
  aspect: number;
  colors: Hex[];
  type: "wordmark" | "mark" | "lockup" | "unknown";
  context: "header" | "footer" | "favicon" | "apple-touch" | "mask-icon" | "manifest" | "og" | "brand-kit" | "other";
  score: number;
  reasons: string[];
}

export interface LogoSet {
  primary?: LogoAsset;
  mark?: LogoAsset;
  candidates: LogoAsset[];
  favicons: LogoAsset[];
  ogImage?: string;
  brandKit: { url: string; path?: string; kind: string }[];
}

/* ----------------------------------------------------------------- icons */

export interface IconAsset {
  path: string;
  hash: string;
  viewBox: string;
  size: number;
  style: "stroke" | "fill" | "duotone" | "mixed";
  strokeWidth?: number;
  context: string;
  label?: string;
}

export interface IconSet {
  items: IconAsset[];
  library?: string;
  style: {
    dominant: "stroke" | "fill" | "mixed" | "none";
    strokeWidth?: number;
    linecap?: string;
    linejoin?: string;
    grid?: number;
    cornerStyle?: "sharp" | "rounded";
  };
}

/* --------------------------------------------------------------- imagery */

export interface ImageAsset {
  path?: string;
  url: string;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  alt: string;
  kind: "photo" | "illustration" | "screenshot" | "logo" | "avatar" | "icon" | "unknown";
  format: string;
  context: string;
  /** Kind of page it appeared on (home, product, brand, blog…). */
  page?: string;
}

export interface ImagerySet {
  images: ImageAsset[];
  customerLogos: { name: string; path?: string; url: string }[];
  summary: { photo: number; illustration: number; screenshot: number; other: number };
}

/* ----------------------------------------------------------------- media */

export interface MediaSet {
  videos: { path?: string; url: string; poster?: string; width: number; height: number; context: string; autoplay: boolean; loop: boolean }[];
  gifs: { path: string; url: string; width: number; height: number }[];
  lotties: { path: string; url: string; width: number; height: number; frames: number; fps: number; name?: string }[];
  rive: { path: string; url: string }[];
  shaders: { path: string; type: "vertex" | "fragment" | "unknown"; length: number; uniforms: string[]; page: string }[];
  canvases: { kind: string; width: number; height: number; recording?: string; gif?: string; poster?: string; page: string; cssVariables: Record<string, string> }[];
  recordings: { path: string; kind: "scroll" | "mobile-scroll"; page: string }[];
}

/* ------------------------------------------------------------ components */

export interface ComponentSample {
  kind: "button" | "link" | "input" | "card" | "nav" | "badge" | "footer" | "hero";
  variant: string;
  text: string;
  styles: Record<string, string>;
  hover?: Record<string, string>;
  screenshot?: string;
  count: number;
}

export interface ComponentSet {
  buttons: ComponentSample[];
  inputs: ComponentSample[];
  cards: ComponentSample[];
  badges: ComponentSample[];
  nav?: ComponentSample;
  footer?: ComponentSample;
  hero?: ComponentSample;
  links: ComponentSample[];
}

/* ----------------------------------------------------------------- voice */

export interface VoiceCorpus {
  headlines: string[];
  subheadlines: string[];
  ctas: string[];
  navigation: string[];
  paragraphs: string[];
  microcopy: string[];
  stats: {
    avgSentenceLength: number;
    avgHeadlineWords: number;
    headingCase: "sentence" | "title" | "upper" | "lower" | "mixed";
    secondPerson: number;
    firstPersonPlural: number;
    exclamationRate: number;
    questionRate: number;
    emojiRate: number;
    readingGrade: number;
    emDash: boolean;
    oxfordComma: "yes" | "no" | "unknown";
    periodsInHeadlines: number;
    numerals: number;
  };
  topTerms: { term: string; count: number }[];
}

/* ----------------------------------------------------------------- stack */

export interface TechStack {
  frameworks: string[];
  styling: string[];
  animation: string[];
  platform: string[];
}

export interface CssVariable {
  name: string;
  value: string;
  resolved?: string;
  kind: "color" | "length" | "font" | "shadow" | "easing" | "duration" | "other";
  count: number;
}

export interface Screenshot {
  path: string;
  page: string;
  viewport: "desktop" | "mobile";
  fullPage: boolean;
}
