import Link from "../../../components/app/Link";
import { button } from "../../../components/app/Button";
import {
  formatPressPublishedAt,
  pressLinkHost,
  type PressClip as PressClipData,
  type PressClipCreator,
} from "../pressClips";
import Card from "@/components/app/Card";

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
    <Card>
      {clip.book.coverUrl ? (
        <Link
          href={`/books/${clip.book.slug}`}
          className="shrink-0 no-underline"
        >
          <Card.Image
            src={clip.book.coverUrl}
            alt={clip.book.title}
            href={`/books/${clip.book.slug}`}
          />
        </Link>
      ) : null}
      <Card.Body>
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
      </Card.Body>
    </Card>
  );
};

export default PressClip;
