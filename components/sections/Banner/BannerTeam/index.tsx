import { RichText } from "@/components/common/RichText";
import { SkeletonImage } from "@/components/common/SkeletonImage";
import type { BannerSection } from "@/lib/sections/types";
import { authorAvatarUrl, type AuthorEntry } from "@/lib/contentful/blog/types";

/**
 * Banner / Team. A grid of team-member cards over the site's black canvas,
 * inside the thin white border frame. Each card shows a portrait, name, and
 * role. Members are Author entries (reused content type) so the same person
 * can also be credited as a blog author.
 *
 * Each avatar resolves via authorAvatarUrl() — an uploaded Author.avatarImage
 * asset if set, otherwise the external Author.avatarUrl. Either way it's a plain
 * <img> (like the blog byline) to skip next/image's remote-host allow-list; when
 * a member has neither we fall back to their initials.
 */

type BannerTeamProps = {
  section: BannerSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

function initials(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function TeamCard({ member, index }: { member: AuthorEntry; index: number }) {
  const avatar = authorAvatarUrl(member);
  return (
    <figure
      className="group animate-fade-up rounded-2xl border border-white/15 bg-white/[0.02] p-4 transition-colors hover:border-white/25"
      // Subtle stagger so the row resolves left-to-right, capped to stay snappy.
      style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white/[0.04]">
        {avatar ? (
          <SkeletonImage
            kind="plain"
            wrapperClassName="h-full w-full"
            src={avatar}
            alt={member.name ?? ""}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-2xl tracking-[0.15em] text-white/50">
            {initials(member.name)}
          </div>
        )}
      </div>

      <figcaption className="mt-4 px-1">
        {member.name ? (
          <p className="text-base font-medium tracking-tight text-white">{member.name}</p>
        ) : null}
        {member.role ? (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-red-400/90">
            {member.role}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function BannerTeam({ section }: BannerTeamProps) {
  const { headline, highlightWord, description, teamMembers } = section;

  return (
    <section id="team" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
      <div className={`py-[60px] md:py-[80px] lg:border-x lg:border-white/20 lg:py-[100px] ${CONTAINER}`}>
        {headline ? (
          <h2 className="max-w-2xl text-[28px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            {headline}
            {highlightWord ? (
              <>
                {" "}
                <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text font-serif italic text-transparent">
                  {highlightWord}
                </span>
              </>
            ) : null}
          </h2>
        ) : null}

        {description ? (
          <RichText
            content={description}
            className="mt-5 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base [&_a]:text-red-400 [&_a]:underline [&_p:last-child]:mb-0"
          />
        ) : null}

        {teamMembers.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {teamMembers.map((member, i) => (
              <TeamCard key={member.sys.id} member={member} index={i} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default BannerTeam;
