/**
 * confirm.ts — code-enforced human-in-the-loop gate for financial writes.
 *
 * Commands that move real funds (swap, multi-swap, token creation, strategy
 * order creation) must not execute on the say-so of an AI agent alone. A hijacked
 * agent — e.g. one that read a prompt-injection payload out of token metadata — can
 * emit any command line it wants, so a plain `--yes` flag is not a real barrier:
 * the injected instructions can just tell the agent to pass `--yes`.
 *
 * This gate enforces confirmation in CODE, not in a SKILL.md instruction:
 *
 *   1. Interactive terminal (default): we read a typed "yes" directly from the
 *      controlling TTY (/dev/tty), NOT from stdin. An autonomous agent driving the
 *      CLI over a pipe cannot answer this prompt, and no text in the agent's
 *      context can satisfy it — a real human must be present at the keyboard.
 *
 *   2. Intentional automation: to run headless, the operator must BOTH pass
 *      `--yes` AND set the environment variable GMGN_ALLOW_AUTOMATED_TRADES=1 in
 *      their own shell, out of band. Requiring the env var (which the CLI never
 *      sets and an injected instruction should not know to set) plus the flag makes
 *      autonomous execution a deliberate, two-factor human decision.
 *
 * If neither path is satisfied, the trade is refused before any signature is made.
 */

import { openSync, readSync, closeSync, existsSync } from "node:fs";

const AUTOMATION_ENV = "GMGN_ALLOW_AUTOMATED_TRADES";

export interface TradeSummary {
  action: string; // e.g. "Swap", "Create token", "Create strategy order"
  lines: string[]; // human-readable "Field: value" details
}

/**
 * Enforce human confirmation for a financial write. Prints a summary, then either
 * reads an interactive "yes" from the TTY or verifies the explicit automation
 * opt-in. Aborts the process if confirmation is not obtained.
 */
export function confirmTrade(summary: TradeSummary, assumeYes: boolean): void {
  printSummary(summary);

  const automationOptIn = process.env[AUTOMATION_ENV] === "1";

  if (assumeYes) {
    if (automationOptIn) {
      console.error(
        `[gmgn-cli] Proceeding non-interactively (--yes + ${AUTOMATION_ENV}=1).`
      );
      return;
    }
    // --yes alone is deliberately NOT enough: an injected agent can pass it.
    abort(
      `--yes was supplied but ${AUTOMATION_ENV}=1 is not set in the environment. ` +
        `Non-interactive trade execution is disabled by default. If you truly intend ` +
        `to allow automated trades, set ${AUTOMATION_ENV}=1 in your own shell first.`
    );
  }

  const answer = readFromTty(
    `\nType "yes" to confirm this ${summary.action.toLowerCase()}, anything else to cancel: `
  );

  if (answer == null) {
    abort(
      `No interactive terminal available to confirm this ${summary.action.toLowerCase()}. ` +
        `Refusing to execute a financial transaction without human confirmation. ` +
        `For intentional automation, set ${AUTOMATION_ENV}=1 and pass --yes.`
    );
  }

  if (answer.trim().toLowerCase() !== "yes") {
    abort("Confirmation not received. Transaction cancelled.");
  }
}

function printSummary(summary: TradeSummary): void {
  const header = `⚠️  ${summary.action} — confirmation required`;
  console.error(`\n${header}`);
  console.error("-".repeat(header.length));
  for (const line of summary.lines) {
    console.error(`  ${line}`);
  }
}

/**
 * Read a single line from the controlling terminal (/dev/tty), bypassing stdin so
 * a piped/automated caller cannot supply the answer. Returns null if no TTY is
 * available (e.g. headless CI, agent driving the CLI over a pipe).
 */
function readFromTty(prompt: string): string | null {
  const ttyPath = process.platform === "win32" ? "CONIN$" : "/dev/tty";
  if (process.platform !== "win32" && !existsSync(ttyPath)) {
    return null;
  }

  let fd: number;
  try {
    fd = openSync(ttyPath, "r");
  } catch {
    return null;
  }

  try {
    process.stderr.write(prompt);
    const buf = Buffer.alloc(1);
    let line = "";
    while (true) {
      let bytes = 0;
      try {
        bytes = readSync(fd, buf, 0, 1, null);
      } catch {
        return null;
      }
      if (bytes === 0) break; // EOF
      const ch = buf.toString("utf8", 0, 1);
      if (ch === "\n") break;
      if (ch === "\r") continue;
      line += ch;
    }
    return line;
  } finally {
    closeSync(fd);
  }
}

function abort(msg: string): never {
  console.error(`[gmgn-cli] ${msg}`);
  process.exit(1);
}
