import { RichText } from "@/components/common/RichText";
import type { InfoSection } from "@/lib/sections/types";

/**
 * Info - Default. A simple article layout: an optional headline followed by a
 * Rich Text body. Used for content pages like the cookie policy. The RichText
 * renderer styles headings/paragraphs/lists/links with the theme tokens.
 */

type InfoDefaultProps = {
  section: InfoSection;
};

export function InfoDefault({ section }: InfoDefaultProps) {
  const { headline, body } = section;

  return (
    <section className="w-full bg-black lg:border-y lg:border-white/20">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-[80px] lg:px-10 lg:py-[120px] lg:border-x lg:border-white/20">
        {headline ? (
          <h1 className="mb-8 text-4xl font-medium tracking-tight text-white md:text-5xl">
            {headline}
          </h1>
        ) : null}
        {body ? <RichText content={body} /> : null}
      </div>
    </section>
  );
}

export default InfoDefault;
