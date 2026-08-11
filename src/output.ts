import { sanitizeForOutputWithCount } from "./sanitize.js";

export function printResult(data: unknown, raw?: boolean): void {
  // Neutralize any attacker-controlled metadata (token name/symbol/description/
  // social links, on-chain URIs, etc.) before it is emitted and read by an AI
  // agent. Defends against indirect prompt injection via token metadata.
  const { data: safe, changed } = sanitizeForOutputWithCount(data);
  if (changed > 0) {
    // Surface that filtering occurred so a human/agent knows the response
    // contained suspicious metadata. Extra detail is gated behind GMGN_DEBUG.
    console.error(
      `[gmgn-cli] Notice: neutralized ${changed} suspicious metadata value(s) in this response (possible prompt-injection attempt).`
    );
    if (process.env.GMGN_DEBUG) {
      console.error(
        `[gmgn-cli] sanitized ${changed} field(s); replaced injection framing with "[filtered]" and removed hidden characters.`
      );
    }
  }
  if (raw) {
    console.log(JSON.stringify(safe));
  } else {
    console.log(JSON.stringify(safe, null, 2));
  }
}

export function exitOnError(err: Error): never {
  console.error(`[gmgn-cli] ${err.message}`);
  if (process.env.GMGN_DEBUG) {
    if ((err as NodeJS.ErrnoException).code) {
      console.error(`[gmgn-cli] code: ${(err as NodeJS.ErrnoException).code}`);
    }
    if ((err as { cause?: unknown }).cause) {
      console.error(`[gmgn-cli] cause: ${(err as { cause?: unknown }).cause}`);
    }
    console.error(err.stack ?? "");
  }
  process.exit(1);
}
