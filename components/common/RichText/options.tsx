import Link from "next/link";
import type { ReactNode } from "react";
import {
  BLOCKS,
  INLINES,
  MARKS,
  type Block,
  type Inline,
} from "@contentful/rich-text-types";
import type { Options } from "@contentful/rich-text-react-renderer";
import type {
  AssetEntry,
  CtaEntry,
  ImageEntry,
  RichTextField,
  RichTextHyperlinkEntry,
  RichTextLinkEntry,
  VideoEntry,
} from "@/lib/contentful/common/types";
import { isExternalHref } from "@/lib/contentful/common/resolveCtaHref";
import { Cta } from "../Cta";
import { ResponsiveImage } from "../ResponsiveImage";
import { VideoPlayer } from "../VideoPlayer";

/**
 * Builds the renderNode/renderMark config for documentToReactComponents,
 * closing over the resolved `links` so embedded entries and assets can be
 * looked up by id. Embedded Cta / Image / Video entries dispatch to the same
 * reusable components used elsewhere.
 */

const linkClass =
  "text-[var(--brand-primary)] underline underline-offset-2 hover:text-[var(--brand-primary-hover)]";

const targetId = (node: Block | Inline): string | undefined =>
  (node.data?.target as { sys?: { id?: string } } | undefined)?.sys?.id;

function renderEmbeddedEntry(entry: RichTextLinkEntry | undefined): ReactNode {
  switch (entry?.__typename) {
    case "Cta":
      return <Cta cta={entry as CtaEntry} />;
    case "Image":
      return <ResponsiveImage image={entry as ImageEntry} />;
    case "Video":
      return <VideoPlayer video={entry as VideoEntry} />;
    default:
      return null;
  }
}

export function buildRichTextOptions(links: RichTextField["links"]): Options {
  const entries = new Map<string, RichTextLinkEntry>();
  for (const e of links?.entries?.block ?? []) if (e) entries.set(e.sys.id, e);
  for (const e of links?.entries?.inline ?? []) if (e) entries.set(e.sys.id, e);

  const hyperlinks = new Map<string, RichTextHyperlinkEntry>();
  for (const h of links?.entries?.hyperlink ?? []) if (h) hyperlinks.set(h.sys.id, h);

  const assets = new Map<string, AssetEntry & { sys: { id: string } }>();
  for (const a of links?.assets?.block ?? []) if (a) assets.set(a.sys.id, a);

  return {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
      [MARKS.CODE]: (text) => (
        <code className="rounded bg-[var(--bg-muted)] px-1 py-0.5 font-mono text-[0.9em]">
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node, children) => (
        <p className="mb-4 leading-relaxed text-[var(--text-default)]">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_node, children) => (
        <h1 className="mb-4 text-4xl font-bold text-[var(--text-default)]">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (_node, children) => (
        <h2 className="mb-3 mt-8 text-3xl font-bold text-[var(--text-default)]">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node, children) => (
        <h3 className="mb-3 mt-6 text-2xl font-semibold text-[var(--text-default)]">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (_node, children) => (
        <h4 className="mb-2 mt-4 text-xl font-semibold text-[var(--text-default)]">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (_node, children) => (
        <h5 className="mb-2 mt-4 text-lg font-semibold text-[var(--text-default)]">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (_node, children) => (
        <h6 className="mb-2 mt-4 text-base font-semibold text-[var(--text-default)]">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (_node, children) => (
        <ul className="mb-4 list-disc pl-6">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node, children) => (
        <ol className="mb-4 list-decimal pl-6">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_node, children) => <li className="mb-1">{children}</li>,
      [BLOCKS.QUOTE]: (_node, children) => (
        <blockquote className="my-4 border-l-4 border-[var(--brand-primary)] pl-4 italic text-[var(--text-muted)]">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-[var(--bg-muted)]" />,
      [INLINES.HYPERLINK]: (node, children) => {
        const uri = (node.data?.uri as string) ?? "#";
        if (isExternalHref(uri)) {
          return (
            <a href={uri} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {children}
            </a>
          );
        }
        return (
          <Link href={uri} className={linkClass}>
            {children}
          </Link>
        );
      },
      [INLINES.ENTRY_HYPERLINK]: (node, children) => {
        const id = targetId(node);
        const target = id ? hyperlinks.get(id) : undefined;
        const slug = target?.slug
          ? target.slug.startsWith("/")
            ? target.slug
            : `/${target.slug}`
          : "#";
        return (
          <Link href={slug} className={linkClass}>
            {children}
          </Link>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node) => {
        const id = targetId(node);
        const entry = id ? entries.get(id) : undefined;
        const rendered = renderEmbeddedEntry(entry);
        return rendered ? <div className="my-6">{rendered}</div> : null;
      },
      [INLINES.EMBEDDED_ENTRY]: (node) => {
        const id = targetId(node);
        return renderEmbeddedEntry(id ? entries.get(id) : undefined);
      },
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const id = targetId(node);
        const asset = id ? assets.get(id) : undefined;
        if (!asset?.url) return null;
        if ((asset.contentType ?? "").startsWith("image/")) {
          return (
            <ResponsiveImage
              className="my-6"
              image={{
                sys: asset.sys,
                desktop: asset,
                altText: asset.description ?? asset.title ?? "",
              }}
            />
          );
        }
        return (
          <a href={asset.url} className={linkClass} target="_blank" rel="noopener noreferrer">
            {asset.title ?? asset.url}
          </a>
        );
      },
    },
  };
}
