import type { BookPressLink } from "../../../../db/schema";

type Props = {
  links: BookPressLink[] | null | undefined;
};

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const BookPressSection = ({ links }: Props) => {
  if (!links?.length) return null;

  return (
    <section class="space-y-3" aria-labelledby="book-press-heading">
      <h2
        id="book-press-heading"
        class="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface/70"
      >
        Press
      </h2>
      <ul class="space-y-4">
        {links.map((link) => (
          <li key={link.url} class="space-y-1">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-on-surface-strong underline-offset-2 hover:underline"
            >
              {link.title}
            </a>
            <p class="text-xs text-on-surface/60">{hostLabel(link.url)}</p>
            {link.quote ? (
              <blockquote class="border-l-2 border-outline pl-3 text-sm italic text-on-surface/80">
                {link.quote}
              </blockquote>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BookPressSection;
