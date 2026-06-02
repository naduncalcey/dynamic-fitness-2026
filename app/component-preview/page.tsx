import type { Metadata } from "next";
import type { Document } from "@contentful/rich-text-types";
import { Cta } from "@/components/common/Cta";
import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { RichText } from "@/components/common/RichText";
import type {
  CtaEntry,
  ImageEntry,
  RichTextField,
  VideoEntry,
} from "@/lib/contentful/common/types";

/**
 * Dev-only showcase for the reusable common components. This static route takes
 * precedence over the `[[...slug]]` catch-all. All data here is hand-authored
 * sample data — nothing is fetched from Contentful — so it doubles as living
 * documentation and a build-time render check. Safe to delete.
 */

export const metadata: Metadata = {
  title: "Component Preview",
  robots: { index: false, follow: false },
};

const ctaSamples: CtaEntry[] = [
  {
    sys: { id: "p1" },
    label: "Red — with arrow",
    variant: "Red",
    size: "Medium",
    linkBehavior: "External",
    externalLink: "https://example.com",
    newTab: true,
    showArrow: true,
  },
  {
    sys: { id: "p2" },
    label: "Gray — secondary",
    variant: "Gray",
    size: "Medium",
    linkBehavior: "External",
    externalLink: "https://example.com",
  },
  { sys: { id: "p3" }, label: "Small", variant: "Red", size: "Small", externalLink: "#" },
  { sys: { id: "p4" }, label: "Large", variant: "Red", size: "Large", externalLink: "#" },
  {
    sys: { id: "p5" },
    label: "Full width",
    variant: "Gray",
    size: "Medium",
    fullWidth: true,
    externalLink: "#",
  },
];

const imageSample: ImageEntry = {
  sys: { id: "img1" },
  title: "Sample image",
  altText: "A sample landscape image",
  caption: "Desktop + art-directed mobile asset, optimized via next/image.",
  desktop: { url: "https://picsum.photos/seed/df-desktop/1200/675", width: 1200, height: 675 },
  mobile: { url: "https://picsum.photos/seed/df-mobile/600/800", width: 600, height: 800 },
};

const videoSample: VideoEntry = {
  sys: { id: "vid1" },
  title: "Sample YouTube video",
  altText: "Sample YouTube video",
  videoType: "YouTube",
  youtubeId: "aqz-KE-bpKQ",
  controls: true,
};

// Hand-built Rich Text document with marks, a list, a quote, a hyperlink, an
// embedded CTA (block), and an embedded image asset (block).
const richTextSample: RichTextField = {
  json: {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "heading-2",
        data: {},
        content: [{ nodeType: "text", value: "Rich Text renderer", marks: [], data: {} }],
      },
      {
        nodeType: "paragraph",
        data: {},
        content: [
          { nodeType: "text", value: "Supports ", marks: [], data: {} },
          { nodeType: "text", value: "bold", marks: [{ type: "bold" }], data: {} },
          { nodeType: "text", value: ", ", marks: [], data: {} },
          { nodeType: "text", value: "italic", marks: [{ type: "italic" }], data: {} },
          { nodeType: "text", value: ", ", marks: [], data: {} },
          { nodeType: "text", value: "code", marks: [{ type: "code" }], data: {} },
          { nodeType: "text", value: ", and ", marks: [], data: {} },
          {
            nodeType: "hyperlink",
            data: { uri: "https://example.com" },
            content: [{ nodeType: "text", value: "external links", marks: [], data: {} }],
          },
          { nodeType: "text", value: ".", marks: [], data: {} },
        ],
      },
      {
        nodeType: "unordered-list",
        data: {},
        content: [
          {
            nodeType: "list-item",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                data: {},
                content: [{ nodeType: "text", value: "List item one", marks: [], data: {} }],
              },
            ],
          },
          {
            nodeType: "list-item",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                data: {},
                content: [{ nodeType: "text", value: "List item two", marks: [], data: {} }],
              },
            ],
          },
        ],
      },
      {
        nodeType: "blockquote",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "An embedded CTA, rendered inline below.", marks: [], data: {} }],
          },
        ],
      },
      {
        nodeType: "embedded-entry-block",
        data: { target: { sys: { id: "embed-cta", type: "Link", linkType: "Entry" } } },
        content: [],
      },
      {
        nodeType: "embedded-asset-block",
        data: { target: { sys: { id: "embed-asset", type: "Link", linkType: "Asset" } } },
        content: [],
      },
    ],
  } as unknown as Document,
  links: {
    entries: {
      block: [
        {
          __typename: "Cta",
          sys: { id: "embed-cta" },
          label: "Embedded CTA",
          variant: "Red",
          size: "Medium",
          showArrow: true,
          externalLink: "https://example.com",
          linkBehavior: "External",
        },
      ],
      inline: [],
      hyperlink: [],
    },
    assets: {
      block: [
        {
          sys: { id: "embed-asset" },
          url: "https://picsum.photos/seed/df-richtext/1000/500",
          title: "Embedded asset image",
          description: "Embedded image asset",
          width: 1000,
          height: 500,
          contentType: "image/jpeg",
        },
      ],
    },
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="mb-6 text-2xl font-bold text-[var(--text-default)]">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentPreviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold text-[var(--text-default)]">Component Preview</h1>
      <p className="mb-12 text-[var(--text-muted)]">
        Reusable common components. Sample data only — not fetched from Contentful.
      </p>

      <Section title="CTA — variants & sizes">
        {/* CTAs are dark glassmorphism pills (ported from the old site); shown on a dark backdrop. */}
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-[#0d0d0d] p-8">
          {ctaSamples.map((cta) => (
            <Cta key={cta.sys.id} cta={cta} />
          ))}
        </div>
      </Section>

      <Section title="ResponsiveImage">
        <ResponsiveImage image={imageSample} sizes="(max-width: 768px) 100vw, 768px" />
      </Section>

      <Section title="VideoPlayer (YouTube)">
        <VideoPlayer video={videoSample} />
      </Section>

      <Section title="RichText (with embedded entry + asset)">
        <RichText content={richTextSample} />
      </Section>
    </main>
  );
}
