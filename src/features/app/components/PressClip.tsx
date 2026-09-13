import Link from "../../../components/app/Link";
import {
  formatPressPublishedAt,
  pressLinkHost,
  type PressClip as PressClipData,
} from "../pressClips";

type Props = {
  clip: PressClipData;
  showCredit?: boolean;
};

const PressClip = ({ clip, showCredit = true }: Props) => {
  const publishedLabel = formatPressPublishedAt(clip.link.publishedAt);
  const host = pressLinkHost(clip.link.url);
  const kicker = publishedLabel ? `${host} · ${publishedLabel}` : host;

  return (
    <li class="flex flex-col gap-4 border-b border-outline pb-6 sm:flex-row sm:items-start sm:gap-6">
      {clip.book.coverUrl ? (
        <Link href={`/books/${clip.book.slug}`} className="shrink-0 no-underline">
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
        <p class="kicker text-accent">{kicker}</p>
        <h2 class="font-display text-2xl font-medium text-on-surface-strong">
          <a
            href={clip.link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-accent"
          >
            {clip.link.title}
          </a>
        </h2>
        {clip.link.quote ? (
          <blockquote class="border-l-2 border-outline pl-3 text-sm italic text-on-surface/80">
            {clip.link.quote}
          </blockquote>
        ) : null}
        <p class="text-sm text-on-surface">
          <Link
            href={`/books/${clip.book.slug}`}
            className="hover:text-accent no-underline"
          >
            {clip.book.title}
          </Link>
          {showCredit && clip.book.credit ? ` · ${clip.book.credit}` : ""}
        </p>
      </div>
    </li>
  );
};

export default PressClip;
