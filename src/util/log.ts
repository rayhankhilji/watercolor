import pc from "picocolors";

let quiet = false;
let verbose = false;

export function configureLog(opts: { quiet?: boolean; verbose?: boolean }) {
  quiet = !!opts.quiet;
  verbose = !!opts.verbose;
}

const start = Date.now();
const elapsed = () => pc.dim(`${((Date.now() - start) / 1000).toFixed(1)}s`.padStart(6));

export const log = {
  banner(text: string) {
    if (quiet) return;
    console.log(`\n  ${pc.bold(pc.magenta("◐ watercolor"))} ${pc.dim(text)}\n`);
  },
  step(text: string) {
    if (!quiet) console.log(`${elapsed()} ${pc.cyan("›")} ${text}`);
  },
  ok(text: string) {
    if (!quiet) console.log(`${elapsed()} ${pc.green("✓")} ${text}`);
  },
  info(text: string) {
    if (!quiet) console.log(`${elapsed()}   ${pc.dim(text)}`);
  },
  warn(text: string) {
    console.warn(`${elapsed()} ${pc.yellow("!")} ${pc.yellow(text)}`);
  },
  error(text: string) {
    console.error(`${elapsed()} ${pc.red("✗")} ${pc.red(text)}`);
  },
  debug(text: string) {
    if (verbose) console.log(`${elapsed()}   ${pc.gray(text)}`);
  },
};
