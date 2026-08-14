/** Project config, safe to reach the browser bundle.
 *
 * These MUST be read as static `process.env.NEXT_PUBLIC_*` member expressions.
 * Next inlines them by literal text substitution at build time, so a computed
 * lookup like `process.env[name]` is left as-is and reads undefined in the
 * browser — where `process` does not exist. */
function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local locally and in your host's environment variables (see .env.example).`,
    );
  }
  return value;
}

export const projectId = required(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset = required(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET",
);

export const apiVersion = "2026-08-14";
