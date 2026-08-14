import { Fragment } from "react";
import type { CSSProperties } from "react";

/** Splits a registered-trademark glyph into its own token so it can carry the
 * accent colour without a space in front of it. */
function tokenize(word: string): string[] {
  return word.split(/(®)/).filter(Boolean);
}

type Props = {
  /** Authored heading. Newlines become line breaks. */
  text: string | null | undefined;
  /** Class applied to every word span — carries the reveal animation. */
  wordClass: string;
  /** Optional accent class for the first line and any ® glyph. */
  accentClass?: string;
  accentFirstLine?: boolean;
  /** Per-word stagger, matching the source's 50ms cascade. */
  staggerMs?: number;
};

/** Renders a heading as individually revealed word spans. The stagger index
 * runs continuously across lines, so the cascade never restarts mid-heading. */
export default function HeadingWords({
  text,
  wordClass,
  accentClass,
  accentFirstLine = false,
  staggerMs = 50,
}: Props) {
  if (!text) return null;

  const lines = text.split("\n");
  let index = 0;

  return (
    <>
      {lines.map((line, lineIndex) => {
        const words = line.split(" ").filter(Boolean);

        return (
          <Fragment key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {words.map((word, wordIndex) => (
              <Fragment key={wordIndex}>
                {wordIndex > 0 ? " " : null}
                {tokenize(word).map((token, tokenIndex) => {
                  const accent =
                    accentClass &&
                    (token === "®" || (accentFirstLine && lineIndex === 0));

                  return (
                    <span
                      key={tokenIndex}
                      className={
                        accent ? `${wordClass} ${accentClass}` : wordClass
                      }
                      style={
                        { "--wd": `${index++ * staggerMs}ms` } as CSSProperties
                      }
                    >
                      {token}
                    </span>
                  );
                })}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
