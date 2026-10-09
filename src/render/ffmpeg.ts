import { spawn, spawnSync } from "node:child_process";
import { log } from "../util/log.js";

let resolved: string | null | undefined;

/** Locate a full ffmpeg build: $WATERCOLOR_FFMPEG, then PATH, then the optional `ffmpeg-static` package. */
export async function findFfmpeg(): Promise<string | null> {
  if (resolved !== undefined) return resolved;
  const candidates = [process.env.WATERCOLOR_FFMPEG, "ffmpeg"].filter(Boolean) as string[];
  for (const c of candidates) {
    const r = spawnSync(c, ["-hide_banner", "-version"], { stdio: "pipe" });
    if (r.status === 0) return (resolved = c);
  }
  try {
    // Optional dependency — only used when present.
    const mod = (await import(/* @vite-ignore */ "ffmpeg-static" as string)) as { default?: string };
    if (mod.default) return (resolved = mod.default);
  } catch {
    /* not installed */
  }
  return (resolved = null);
}

export function runFfmpeg(bin: string, args: string[], timeoutMs = 180_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString()));
    const t = setTimeout(() => {
      p.kill("SIGKILL");
      reject(new Error("ffmpeg timed out"));
    }, timeoutMs);
    p.on("close", (code) => {
      clearTimeout(t);
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${err.slice(-600)}`));
    });
  });
}

export interface EncodeOptions {
  fps: number;
  /** printf-style input pattern, e.g. /tmp/frames/%05d.png */
  input: string;
  mp4?: string;
  webm?: string;
  gif?: string;
  gifWidth?: number;
  gifFps?: number;
  /** Encode WebM with alpha (input frames must be PNG with transparency). */
  alpha?: boolean;
}

export async function encodeFrames(o: EncodeOptions): Promise<string[]> {
  const bin = await findFfmpeg();
  if (!bin) {
    log.warn("ffmpeg not found — skipping video encode (install ffmpeg or `npm i ffmpeg-static`)");
    return [];
  }
  const out: string[] = [];
  if (o.mp4) {
    await runFfmpeg(bin, ["-framerate", String(o.fps), "-i", o.input, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", o.mp4]);
    out.push(o.mp4);
  }
  if (o.webm) {
    const pix = o.alpha ? ["-pix_fmt", "yuva420p", "-auto-alt-ref", "0"] : ["-pix_fmt", "yuv420p"];
    await runFfmpeg(bin, ["-framerate", String(o.fps), "-i", o.input, "-c:v", "libvpx-vp9", ...pix, "-b:v", "0", "-crf", "28", "-row-mt", "1", o.webm]).catch((e) => log.debug(`webm: ${e.message}`));
    out.push(o.webm);
  }
  if (o.gif) {
    const w = o.gifWidth ?? 640;
    const fps = o.gifFps ?? Math.min(o.fps, 24);
    await runFfmpeg(bin, [
      "-framerate", String(o.fps), "-i", o.input,
      "-vf", `fps=${fps},scale=${w}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=192:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
      "-loop", "0", o.gif,
    ]);
    out.push(o.gif);
  }
  return out;
}

export async function transcode(input: string, mp4: string, gif?: string, gifWidth = 720) {
  const bin = await findFfmpeg();
  if (!bin) return [];
  const out: string[] = [];
  await runFfmpeg(bin, ["-i", input, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-an", mp4]);
  out.push(mp4);
  if (gif) {
    await runFfmpeg(bin, ["-i", input, "-t", "8", "-vf", `fps=15,scale=${gifWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4`, "-loop", "0", gif]);
    out.push(gif);
  }
  return out;
}

/** Pull an HLS / DASH stream down to an mp4 (capped) — used for product demo videos. */
export async function downloadStream(url: string, out: string, maxSeconds = 45) {
  const bin = await findFfmpeg();
  if (!bin) return false;
  await runFfmpeg(bin, ["-t", String(maxSeconds), "-i", url, "-c", "copy", "-bsf:a", "aac_adtstoasc", out], 120_000);
  return true;
}

export async function extractFrame(input: string, out: string, at = 0.5) {
  const bin = await findFfmpeg();
  if (!bin) throw new Error("ffmpeg not found");
  await runFfmpeg(bin, ["-ss", String(at), "-i", input, "-frames:v", "1", out]);
  return out;
}
