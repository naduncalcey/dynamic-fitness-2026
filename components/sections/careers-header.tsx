import type { CareersContent } from "@/lib/content-types";
import { careersDefaults } from "@/lib/content-defaults";

const CareersHeader = ({ content }: { content?: CareersContent }) => {
  const c = content ?? careersDefaults;

  return (
    <section className="w-full border-t border-white/20">
      <div className="container lg:border-x lg:border-white/20 py-[80px] md:py-[120px] lg:py-[160px]">
        <h1 className="text-white text-[32px] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
          {c.headline}
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-400 leading-relaxed max-w-lg">
          {c.description}
        </p>
      </div>
    </section>
  );
};

export default CareersHeader;
