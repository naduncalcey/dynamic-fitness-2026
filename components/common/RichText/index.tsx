import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { RichTextField } from "@/lib/contentful/common/types";
import { buildRichTextOptions } from "./options";

/**
 * Renders a Contentful Rich Text field (`{ json, links }`) to React, resolving
 * embedded entries (Cta / Image / Video), embedded assets, and entry
 * hyperlinks from the `links` payload. Query rich text fields with
 * `richTextField()` from lib/contentful/graphql/fragments/richText.ts.
 */

type RichTextProps = {
  content?: RichTextField | null;
  className?: string;
};

export function RichText({ content, className }: RichTextProps) {
  if (!content?.json) return null;
  const options = buildRichTextOptions(content.links);
  return <div className={className}>{documentToReactComponents(content.json, options)}</div>;
}

export default RichText;
