type FooterColumnProps = {
  title: string;
  links: { href: string; label: string }[];
};

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <nav class="flex flex-col gap-3">
    <span class="kicker text-accent">{title}</span>
    <ul class="flex flex-col gap-2">
      {links.map((link) => (
        <li>
          <a
            href={link.href}
            class="text-sm text-on-surface hover:text-on-surface-strong hover:underline underline-offset-4 decoration-accent"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const Footer = () => (
  <footer class="border-t-2 border-on-surface-strong bg-surface mt-16">
    <div class="mx-auto grid w-full gap-10 px-6 py-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
      <div class="flex flex-col gap-3">
        <a href="/" class="font-logo text-3xl font-semibold text-on-surface-strong w-fit">
          Photobookers
        </a>
        <p class="max-w-xs text-sm text-on-surface text-pretty">
          The home for photobook lovers. Discover books, follow artists and
          publishers, and keep up with the photobook world — all in one place.
        </p>
      </div>
      <FooterColumn
        title="Discover"
        links={[
          { href: "/books", label: "All Books" },
          { href: "/artists", label: "Artists" },
          { href: "/publishers", label: "Publishers" },
          { href: "/search", label: "Search" },
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
          { href: "/contact", label: "Contact" },
          { href: "/terms", label: "Terms" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </div>
    <div class="border-t border-outline px-6 py-4 md:px-8">
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
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
