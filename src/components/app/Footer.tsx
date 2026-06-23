import { SITE_APP, SITE_SOCIAL } from "../../constants/siteSocial";

type FooterColumnProps = {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
};

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <nav class="flex flex-col gap-3">
    <span class="kicker text-accent">{title}</span>
    <ul class="flex flex-col gap-2">
      {links.map((link) => (
        <li>
          <a
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            class="text-sm text-on-surface hover:text-on-surface-strong hover:underline underline-offset-4 decoration-accent"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const FooterSocialLinks = () => (
  <div class="flex items-center gap-3 pt-1">
    <a
      href={SITE_SOCIAL.instagram.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={SITE_SOCIAL.instagram.label}
      class="inline-flex size-9 items-center justify-center rounded-full border border-outline text-on-surface-strong transition hover:border-accent hover:text-accent"
    >
      <img
        src="/icons/social/instagram.png"
        alt=""
        width={18}
        height={18}
        class="size-[18px] opacity-80"
      />
    </a>
  </div>
);

const FooterAppLink = () => (
  <div class="flex flex-col gap-2 pt-2">
    <span class="kicker text-accent">App</span>
    <a
      href={SITE_APP.ios.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={SITE_APP.ios.label}
      class="inline-flex w-fit items-center gap-2 rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong transition hover:border-accent hover:text-accent"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13.25 3.5c.67-.8 1.12-1.92 1-3.04-1.01.04-2.24.67-2.97 1.47-.62.67-1.16 1.75-1.02 2.78 1.08.08 2.19-.55 2.99-1.21z" />
      </svg>
      Download for iPhone
    </a>
  </div>
);

const Footer = () => (
  <footer class="border-t-2 border-on-surface-strong bg-surface mt-16">
    <div class="mx-auto grid w-full max-w-[1680px] gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6">
      <div class="flex flex-col gap-3">
        <a
          href="/"
          class="font-logo text-3xl font-semibold text-on-surface-strong w-fit"
        >
          Photobookers
        </a>
        <p class="max-w-xs text-sm text-on-surface text-pretty">
          The home for photobook lovers. Discover books, follow artists and
          publishers, and keep up with the photobook world — all in one place.
        </p>
        <FooterSocialLinks />
        <FooterAppLink />
      </div>
      <FooterColumn
        title="Discover"
        links={[
          { href: "/books", label: "All Books" },
          { href: "/artists", label: "Artists" },
          { href: "/publishers", label: "Publishers" },
          { href: "/fairs", label: "Book Fairs" },
        ]}
      />
      <FooterColumn
        title="Editorial"
        links={[
          { href: "/book-of-the-day", label: "Book of the Day" },
          { href: "/artist-of-the-week", label: "Artist of the Week" },
          { href: "/publisher-of-the-week", label: "Publisher of the Week" },
          { href: "/this-week", label: "This Week" },
          { href: "/interviews", label: "Interviews" },
        ]}
      />
      <FooterColumn
        title="About"
        links={[
          { href: "/about", label: "About Us" },
          { href: "/newsletter", label: "Newsletter" },
          {
            href: SITE_APP.ios.href,
            label: "iOS App",
            external: true,
          },
          { href: "/contact", label: "Contact" },
          { href: "/terms", label: "Terms" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </div>
    <div class="border-t border-outline px-4 py-4 md:px-6">
      <div class="mx-auto flex w-full max-w-[1680px] flex-col items-center justify-between gap-2 md:flex-row">
        <p class="kicker text-on-surface-weak">
          © {new Date().getFullYear()} Photobookers
        </p>
        <p class="kicker text-on-surface-weak">
          Made for photobook lovers, everywhere
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
