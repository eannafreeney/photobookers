import clsx from "clsx";
import PageHeader from "@/components/app/PageHeader";
import SectionTitle from "@/components/app/SectionTitle";
import Link from "@/components/app/Link";
import {
  issue01BookEntries,
  issue01BookPlacements,
  issue01EditorsLetter,
  issue01EssaySections,
  issue01Meta,
  type MagazineBookEntry,
} from "@/features/app/content/magazine/issue01OnTheSidewalk";
import type { MagazineBook } from "@/features/app/magazine/services";

type Props = {
  books: (MagazineBook | null)[];
};

const proseClass = "text-base leading-relaxed text-on-surface text-pretty";
const sectionNavClass =
  "rounded-full border border-outline px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent";

function buildBookLookup(books: (MagazineBook | null)[]) {
  const entryBySlug = new Map(
    issue01BookEntries.map((entry) => [entry.slug, entry]),
  );
  const bookBySlug = new Map<string, MagazineBook | null>();
  for (const [index, entry] of issue01BookEntries.entries()) {
    bookBySlug.set(entry.slug, books[index] ?? null);
  }

  const placementsBySection = new Map<
    string,
    Map<number, { entry: MagazineBookEntry; book: MagazineBook | null; number: number }[]>
  >();

  issue01BookPlacements.forEach((placement, index) => {
    const entry = entryBySlug.get(placement.slug);
    if (!entry) return;

    const sectionMap =
      placementsBySection.get(placement.afterSectionId) ?? new Map();
    const atParagraph =
      sectionMap.get(placement.afterParagraphIndex) ?? [];
    atParagraph.push({
      entry,
      book: bookBySlug.get(placement.slug) ?? null,
      number: index + 1,
    });
    sectionMap.set(placement.afterParagraphIndex, atParagraph);
    placementsBySection.set(placement.afterSectionId, sectionMap);
  });

  return placementsBySection;
}

const MagazineIssue01Page = ({ books }: Props) => {
  const placementsBySection = buildBookLookup(books);

  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <PageHeader
        kicker={issue01Meta.kicker}
        title={issue01Meta.title}
        intro={issue01Meta.subtitle}
      />

      <p class="text-sm text-on-surface">
        {issue01Meta.publishedLabel} · {issue01Meta.readingMinutes} min read
      </p>

      <nav
        aria-label="Issue sections"
        class="flex flex-wrap gap-2 border-y border-outline py-4"
      >
        <a href="#editors-letter" class={sectionNavClass}>
          Letter
        </a>
        {issue01EssaySections.map((section) => (
          <a href={`#${section.id}`} class={sectionNavClass}>
            {section.kicker ? `${section.kicker}. ` : ""}
            {section.title}
          </a>
        ))}
      </nav>

      <section
        id="editors-letter"
        class="scroll-mt-24 flex flex-col gap-4 border-t border-outline pt-8"
      >
        <SectionTitle className="mb-0 mt-0">
          {issue01EditorsLetter.title}
        </SectionTitle>
        {issue01EditorsLetter.paragraphs.map((paragraph) => (
          <p class={proseClass}>{paragraph}</p>
        ))}
      </section>

      <section class="flex flex-col gap-10 border-t border-outline pt-8">
        <SectionTitle className="mb-0 mt-0" kicker="Essay">
          The pavement as editing table
        </SectionTitle>
        {issue01EssaySections.map((section) => {
          const sectionPlacements = placementsBySection.get(section.id);

          return (
            <article
              id={section.id}
              class="scroll-mt-24 flex flex-col gap-4 border-t border-outline pt-8 first:border-t-0 first:pt-0"
            >
              <h3 class="font-display text-2xl font-medium text-on-surface-strong text-balance">
                {section.kicker ? (
                  <span class="text-accent not-italic">{section.kicker}. </span>
                ) : null}
                {section.title}
              </h3>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <>
                  <p class={proseClass}>{paragraph}</p>
                  {sectionPlacements
                    ?.get(paragraphIndex)
                    ?.map(({ entry, book, number }) => (
                      <MagazineBookCard
                        key={entry.slug}
                        number={number}
                        entry={entry}
                        book={book}
                        align={number % 2 === 1 ? "right" : "left"}
                      />
                    ))}
                </>
              ))}
            </article>
          );
        })}
      </section>
    </div>
  );
};

const MagazineBookCard = ({
  number,
  entry,
  book,
  align,
}: {
  number: number;
  entry: MagazineBookEntry;
  book: MagazineBook | null;
  align: "left" | "right";
}) => {
  const title = book?.title ?? entry.slug;
  const artistName = book?.artist?.displayName;
  const href = `/books/${entry.slug}`;
  const isRight = align === "right";

  return (
    <aside
      class={clsx(
        "my-6 w-full max-w-xs border border-outline bg-surface-alt/40 p-4",
        isRight ? "md:ml-auto" : "md:mr-auto",
      )}
    >
      <div
        class={clsx(
          "flex flex-col gap-4",
          isRight ? "md:items-end md:text-right" : "md:items-start md:text-left",
        )}
      >
        {book?.coverUrl ? (
          <Link href={href}>
            <img
              src={book.coverUrl}
              alt={`Cover of ${title}`}
              loading="lazy"
              class="aspect-square w-32 border border-outline bg-surface-alt object-cover"
            />
          </Link>
        ) : (
          <div class="flex aspect-square w-32 items-center justify-center border border-outline bg-surface-alt text-xs text-on-surface">
            No cover
          </div>
        )}
        <div class="flex flex-col gap-2">
          <p class="kicker text-accent">Book {number}</p>
          <h4 class="font-display text-xl font-medium text-on-surface-strong">
            <Link href={href} className="hover:text-accent no-underline">
              {title}
            </Link>
          </h4>
          {artistName ? (
            <p class="text-sm font-medium text-on-surface">
              {book?.artist?.slug ? (
                <Link
                  href={`/creators/${book.artist.slug}`}
                  className="hover:text-accent"
                >
                  {artistName}
                </Link>
              ) : (
                artistName
              )}
            </p>
          ) : null}
          <p class="text-sm leading-relaxed text-on-surface text-pretty">
            {entry.blurb}
          </p>
          {entry.artistPrompt ? (
            <blockquote
              class={clsx(
                "border-accent text-sm italic leading-relaxed text-on-surface",
                isRight ? "border-r-2 pr-4" : "border-l-2 pl-4",
              )}
            >
              <span class="not-italic font-medium text-on-surface-strong">
                For the artist:{" "}
              </span>
              {entry.artistPrompt}
            </blockquote>
          ) : null}
          <Link
            href={href}
            className="text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent"
          >
            View on photobookers →
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default MagazineIssue01Page;
