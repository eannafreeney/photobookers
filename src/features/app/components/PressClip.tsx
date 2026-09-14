import Link from "../../../components/app/Link";
import { button } from "../../../components/app/Button";
import {
  formatPressPublishedAt,
  pressLinkHost,
  type PressClip as PressClipData,
  type PressClipCreator,
} from "../pressClips";

type Props = {
  clip: PressClipData;
};

const CreatorName = ({ creator }: { creator: PressClipCreator }) => (
  <Link
    href={`/creators/${creator.slug}`}
    className="hover:text-accent no-underline"
  >
    {creator.displayName}
  </Link>
);

const PressClip = ({ clip }: Props) => {
  const publishedLabel = formatPressPublishedAt(clip.link.publishedAt);
  const host = pressLinkHost(clip.link.url);
  const source = publishedLabel ? `${host} · ${publishedLabel}` : host;
  const { artist, publisher } = clip.book;

  return (
    <li class="flex flex-col gap-4 border-b border-outline pb-6 sm:flex-row sm:items-start sm:gap-6">
      {clip.book.coverUrl ? (
        <Link
          href={`/books/${clip.book.slug}`}
          className="shrink-0 no-underline"
        >
          <img
            src={clip.book.coverUrl}
            alt={clip.book.title}
            width={160}
            height={213}
            class="w-24 border border-outline object-cover sm:w-28"
          />
        </Link>
      ) : null}
      <div class="flex min-w-0 flex-col gap-2">
        <h2 class="font-display text-2xl font-medium leading-tight text-on-surface-strong md:text-3xl">
          <Link
            href={`/books/${clip.book.slug}`}
            className="hover:text-accent no-underline"
          >
            {clip.book.title}
          </Link>
        </h2>
        {artist || publisher ? (
          <p class="text-sm text-on-surface">
            {artist ? <CreatorName creator={artist} /> : null}
            {artist && publisher ? " · " : null}
            {publisher ? <CreatorName creator={publisher} /> : null}
          </p>
        ) : null}
        <p>
          {clip.link.title}

          <span class="text-xs text-on-surface/60"> · {source}</span>
        </p>
        {clip.link.quote ? (
          <blockquote class="border-l-2 border-outline pl-3 text-sm italic text-on-surface/80">
            {clip.link.quote}
          </blockquote>
        ) : null}
        <a
          href={clip.link.url}
          target="_blank"
          rel="noopener noreferrer"
          class={button({ variant: "outline", color: "primary", width: "fit" })}
        >
          Read review
        </a>
      </div>
    </li>
  );
};

export default PressClip;
