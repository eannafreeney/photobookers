import type { SpotlightBlurbStatus } from "../utils";

type Props = {
  status: SpotlightBlurbStatus;
  /** What to add a bio/description to when there is nothing to rewrite. */
  subject: "book" | "artist" | "publisher";
};

/** Phrased with its article so both strings below read as English. */
const SUBJECT_SOURCE = {
  book: "a book description",
  artist: "an artist bio",
  publisher: "a publisher bio",
} as const;

const LABEL: Record<SpotlightBlurbStatus, string> = {
  ready: "Blurb",
  missing: "No blurb",
  "no-source": "No blurb",
};

/**
 * Blurb state for one scheduled spotlight. `no-source` is the one worth
 * shouting about: nothing to rewrite means regenerating will silently do
 * nothing, and the block ships to /featured with an empty column.
 */
const SpotlightBlurbBadge = ({ status, subject }: Props) => {
  const detail =
    status === "ready"
      ? "Ready"
      : status === "missing"
        ? "Not generated"
        : `Add ${SUBJECT_SOURCE[subject]}`;

  return (
    <span
      title={
        status === "no-source"
          ? `Regenerating will do nothing without ${SUBJECT_SOURCE[subject]} — add one, or write the blurb by hand.`
          : detail
      }
      class={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_ICON[status]}
      <span>{LABEL[status]}</span>
      <span class="opacity-80">·</span>
      <span class="opacity-90">{detail}</span>
    </span>
  );
};

export default SpotlightBlurbBadge;

const STATUS_CLASSES: Record<SpotlightBlurbStatus, string> = {
  ready: "border-success bg-success/10 text-success",
  missing: "border-warning bg-warning/10 text-warning",
  "no-source": "border-danger bg-danger/10 text-danger",
};

const checkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-3.5 shrink-0"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
      clip-rule="evenodd"
    />
  </svg>
);

const warningIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-3.5 shrink-0"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clip-rule="evenodd"
    />
  </svg>
);

const STATUS_ICON = {
  ready: checkIcon,
  missing: warningIcon,
  "no-source": warningIcon,
} as const;
