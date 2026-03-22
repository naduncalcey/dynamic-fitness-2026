import Image from "next/image";
import SpotlightButton from "../ui/spotlight-button";

const linkGroups = [
  {
    title: "Services",
    links: [
      { label: "Personal Training", href: "#" },
      { label: "HIIT Classes", href: "#" },
      { label: "Nutrition Plans", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FitConnect App", href: "#" },
      { label: "Class Schedule", href: "#" },
      { label: "Member Portal", href: "#" },
      { label: "FAQs", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/20">
      {/* Top section */}
      <div className="container lg:border-x lg:border-white/20 pt-[60px] md:pt-[80px] pb-10 md:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-12 lg:gap-8">
          {/* Brand column */}
          <div>
            <Image
              src="/logo.svg"
              alt="Dynamic Fitness"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-[280px]">
              Nawinna&apos;s premier fitness destination. State-of-the-art
              equipment and expert trainers for your transformation.
            </p>
            <a
              href="https://ebadge.bestweb.lk/api/v1/clicked/dynamicfitness.lk/BestWeb/2025/Rate_Us"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://ebadge.bestweb.lk/eBadgeSystem/domainNames/dynamicfitness.lk/BestWeb/2025/Rate_Us/image.png"
                alt="BestWeb 2025"
                width={60}
                height={60}
              />
            </a>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-medium text-white/50 uppercase tracking-[0.2em] mb-5">
                {group.title}
              </p>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <SpotlightButton onClick={() => window.open("https://calendly.com/nadun-n-dynamicfitness/30min", "_blank")}>
            <span className="flex items-center gap-3">
              <span className="text-red-400 text-xs tracking-[0.15em]">
                START NOW //
              </span>
              Book a Free Consultation
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </SpotlightButton>
        </div>
      </div>

      {/* Large brand text */}
      <div className="container lg:border-x lg:border-white/20 border-t border-white/10 overflow-hidden py-8 md:py-10">
        <p
          className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-bold leading-none tracking-tighter text-center select-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.03) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          DYNAMIC
        </p>
      </div>

      {/* Bottom bar */}
      <div className="container lg:border-x lg:border-white/20 border-t border-white/10 py-5 md:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.15em]">
              Open 6 AM – 10 PM
            </span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-mono text-white/40 uppercase tracking-[0.1em]">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <span>&copy; 2026 Dynamic Fitness</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
