import clsx from "clsx";
import PageHeader from "@/components/app/PageHeader";
import SectionTitle from "@/components/app/SectionTitle";
import Link from "@/components/app/Link";
import {
  issue02BookEntries,
  issue02EditorsLetter,
  issue02Meta,
  issue02Movements,
  issue02OrderedSlugs,
  type MagazineBookEntry,
} from "@/features/app/content/magazine/issue02AfterMidnight";
import type { MagazineBook } from "@/features/app/magazine/services";

type Props = {
  books: (MagazineBook | null)[];
};

const proseClass =
  "text-lg leading-relaxed text-balance text-on-surface text-pretty font-display";
const navChipClass =
  "rounded-full border border-outline px-3 py-1 text-xs font-semibold text-on-surface transition-colors hover:border-accent hover:text-accent";

const MagazineIssue02Page = ({ books }: Props) => {
  const entryBySlug = new Map(
    issue02BookEntries.map((entry) => [entry.slug, entry]),
  );
  const bookBySlug = new Map<string, MagazineBook | null>();
  issue02OrderedSlugs.forEach((slug, index) => {
    bookBySlug.set(slug, books[index] ?? null);
  });
  const numberBySlug = new Map(
    issue02OrderedSlugs.map((slug, index) => [slug, index + 1]),
  );

  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-10">
      {/* Big banner */}
      <figure class="flex flex-col gap-2">
        <img
          src={issue02Meta.bannerUrl}
          alt={`${issue02Meta.kicker}: ${issue02Meta.title} — a night skyline`}
          width={1600}
          height={560}
          class="h-56 w-full border border-outline object-cover md:h-80"
        />
      </figure>

      <PageHeader
        kicker={issue02Meta.kicker}
        title={issue02Meta.title}
        intro={issue02Meta.subtitle}
      />

      <p class="text-sm text-on-surface">
        {issue02Meta.publishedLabel} · {issue02Meta.readingMinutes} min read ·{" "}
        {issue02OrderedSlugs.length} books
      </p>

      <nav
        aria-label="Issue sections"
        class="flex flex-wrap gap-2 border-y border-outline py-4"
      >
        <a href="#editors-letter" class={navChipClass}>
          Letter
        </a>
        {issue02Movements.map((movement) => (
          <a href={`#${movement.id}`} class={navChipClass}>
            {movement.kicker.replace("Movement ", "")} · {movement.lead}
          </a>
        ))}
      </nav>

      {/* Editor's letter */}
      <section
        id="editors-letter"
        class="scroll-mt-24 max-w-xl flex flex-col mx-auto gap-4 border-t border-outline pt-8"
      >
        <SectionTitle className="mb-0 mt-0" kicker="Editor's letter">
          {issue02EditorsLetter.title}
        </SectionTitle>
        {issue02EditorsLetter.paragraphs.map((paragraph) => (
          <p class={proseClass}>{paragraph}</p>
        ))}
        <p class="font-display text-lg italic text-on-surface-weak">
          — The editors, Photobookers
        </p>
      </section>

      {/* Movements */}
      {issue02Movements.map((movement) => (
        <section
          id={movement.id}
          class="scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8"
        >
          <div class="flex flex-col gap-1">
            <span class="kicker text-accent">{movement.kicker}</span>
            <h2 class="font-display text-2xl font-medium text-on-surface-strong text-balance md:text-3xl">
              <span class="italic text-accent">{movement.lead} </span>
              {movement.title}
            </h2>
          </div>
          {movement.paragraphs.map((paragraph) => (
            <p class={proseClass}>{paragraph}</p>
          ))}
          <div class="flex flex-col">
            {movement.bookSlugs.map((slug) => {
              const entry = entryBySlug.get(slug);
              const number = numberBySlug.get(slug) ?? 0;
              if (!entry) return null;
              return (
                <MagazineBookPlate
                  key={slug}
                  number={number}
                  entry={entry}
                  book={bookBySlug.get(slug) ?? null}
                  align={number % 2 === 1 ? "left" : "right"}
                />
              );
            })}
          </div>
        </section>
      ))}

      {/* Contributors + share */}
      <ContributorsAndShare bookBySlug={bookBySlug} />
    </div>
  );
};

const MagazineBookPlate = ({
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
  const artist = book?.artist;
  const isVerified = artist?.status === "verified";
  const href = `/books/${entry.slug}`;
  const isRight = align === "right";

  return (
    <aside
      class={clsx(
        "my-8 w-full border border-outline bg-surface-alt/50 p-5 md:w-4/5",
        isRight ? "md:ml-auto" : "md:mr-auto",
      )}
    >
      <div
        class={clsx(
          "flex flex-col gap-5 sm:flex-row sm:items-stretch",
          isRight && "sm:flex-row-reverse sm:text-right",
        )}
      >
        {book?.coverUrl ? (
          <Link
            href={href}
            className="block w-full shrink-0 overflow-hidden border border-outline bg-surface no-underline sm:w-2/5"
          >
            <img
              src={book.coverUrl}
              alt={`Cover of ${title}`}
              loading="lazy"
              class="h-full min-h-64 w-full object-cover"
            />
          </Link>
        ) : (
          <div class="flex min-h-64 w-full shrink-0 items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak sm:w-2/5">
            No cover
          </div>
        )}
        <div class="flex min-w-0 flex-col justify-center gap-2">
          <div
            class={clsx(
              "flex items-center gap-2",
              isRight && "sm:flex-row-reverse",
            )}
          >
            <span class="h-px w-6 bg-accent" />
            <span class="kicker text-accent">Book {number}</span>
          </div>
          <h3 class="font-display text-xl font-medium text-on-surface-strong text-balance">
            <Link href={href} className="hover:text-accent no-underline">
              {title}
            </Link>
          </h3>
          <div
            class={clsx(
              "flex flex-wrap items-center gap-2",
              isRight && "sm:justify-end",
            )}
          >
            {artist?.displayName ? (
              artist.slug ? (
                <Link
                  href={`/creators/${artist.slug}`}
                  className="text-sm font-semibold text-on-surface-strong hover:text-accent no-underline"
                >
                  {artist.displayName}
                </Link>
              ) : (
                <span class="text-sm font-semibold text-on-surface-strong">
                  {artist.displayName}
                </span>
              )
            ) : null}
            {isVerified ? (
              <span class="inline-flex items-center gap-1 rounded-full border border-[#4f7a4a]/40 bg-[#4f7a4a]/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[#4f7a4a]">
                ✦ Verified
              </span>
            ) : (
              <span class="inline-flex items-center gap-1 rounded-full border border-dashed border-on-surface-weak px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-on-surface-weak">
                Unclaimed ·{" "}
                <Link href={href} className="text-accent no-underline">
                  invite
                </Link>
              </span>
            )}
          </div>
          <p class="text-sm leading-relaxed text-on-surface text-pretty">
            {entry.blurb}
          </p>
          {entry.artistQuote ? (
            <blockquote
              class={clsx(
                "text-sm italic leading-relaxed text-on-surface",
                isRight
                  ? "border-r-2 border-accent pr-4"
                  : "border-l-2 border-accent pl-4",
              )}
            >
              <span class="not-italic font-semibold text-accent">
                From the artist:{" "}
              </span>
              {entry.artistQuote}
            </blockquote>
          ) : entry.artistPrompt ? (
            <blockquote
              class={clsx(
                "text-sm italic leading-relaxed text-on-surface",
                isRight
                  ? "border-r-2 border-accent pr-4"
                  : "border-l-2 border-accent pl-4",
              )}
            >
              <span class="not-italic font-semibold text-on-surface-strong">
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

const ContributorsAndShare = ({
  bookBySlug,
}: {
  bookBySlug: Map<string, MagazineBook | null>;
}) => (
  <section
    id="artists"
    class="scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8"
  >
    <SectionTitle className="mb-0 mt-0" kicker="The artists">
      Ten photographers, one night
    </SectionTitle>
    <p class={proseClass}>
      Every book in this issue belongs to a photographer on photobookers. Two
      have verified their profiles; the other eight have an open invitation
      waiting — being featured here is the reason to accept it.
    </p>

    <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {issue02OrderedSlugs.map((slug) => {
        const artist = bookBySlug.get(slug)?.artist;
        const verified = artist?.status === "verified";
        return (
          <li class="flex flex-col gap-0.5 border border-outline bg-surface-alt/50 p-3">
            <span class="font-display text-base font-medium text-on-surface-strong">
              {artist?.displayName ?? "—"}
            </span>
            <span
              class={clsx(
                "text-[0.6rem] font-semibold uppercase tracking-wider",
                verified ? "text-[#4f7a4a]" : "text-on-surface-weak",
              )}
            >
              {verified ? "✦ Verified" : "Invited"}
            </span>
          </li>
        );
      })}
    </ul>

    <div
      class="flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-6"
      x-data="{ copied: false }"
    >
      <span class="kicker text-accent">Featured? Take it with you.</span>
      <h3 class="font-display text-xl font-medium text-on-surface-strong">
        Share the issue — or your page in it
      </h3>
      <p class="text-sm text-on-surface text-pretty">
        Every featured artist gets a direct link to their book and a ready-made
        share card. One tap, no design work. This is how an issue travels.
      </p>
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          class="border border-on-surface-strong px-4 py-2 text-sm font-semibold text-on-surface-strong transition-colors hover:border-accent hover:text-accent"
          x-on:click="navigator.clipboard?.writeText(window.location.href); copied = true; setTimeout(() => copied = false, 1800)"
        >
          Copy issue link
        </button>
        <span
          x-show="copied"
          x-cloak
          class="text-sm font-medium text-[#4f7a4a]"
        >
          Link copied ✦
        </span>
      </div>
    </div>
  </section>
);

export default MagazineIssue02Page;
