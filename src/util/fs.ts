import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function write(file: string, data: string | Uint8Array) {
  await ensureDir(path.dirname(file));
  await writeFile(file, data);
  return file;
}

export async function writeJson(file: string, data: unknown) {
  return write(file, JSON.stringify(data, null, 2) + "\n");
}

export async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

export async function exists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

export function hash(data: string | Uint8Array, len = 10) {
  return createHash("sha1").update(data).digest("hex").slice(0, len);
}

export function slug(input: string, max = 48) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, max)
      .replace(/^-|-$/g, "") || "item"
  );
}

/** Derive a stable, readable local filename from a remote URL. */
export function fileNameFromUrl(url: string, fallbackExt: string) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname) || "asset";
    const ext = path.extname(base) || fallbackExt;
    const stem = slug(base.replace(/\.[^.]+$/, ""), 40);
    return `${stem}-${hash(url, 6)}${ext.toLowerCase()}`;
  } catch {
    return `asset-${hash(url, 8)}${fallbackExt}`;
  }
}

/** Path relative to the brand dir, always with forward slashes (used inside generated docs). */
export function rel(from: string, to: string) {
  return path.relative(from, to).split(path.sep).join("/");
}
