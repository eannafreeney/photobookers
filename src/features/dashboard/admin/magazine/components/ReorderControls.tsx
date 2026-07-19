import FormPost from "@/components/forms/FormPost";

type Props = {
  bookId: string;
  action: string;
  isFirst: boolean;
  isLast: boolean;
};

const chevronUp = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    class="size-4"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

const chevronDown = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    class="size-4"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

// Up/down nudges for a book's slot in the issue. A move reorders two rows at
// once, so on success the whole selected-books list is swapped in place.
const ReorderControls = ({ bookId, action, isFirst, isLast }: Props) => {
  const alpineAttrs = { "x-target": "magazine-books toast" };
  const buttonClass =
    "text-on-surface-weak hover:text-on-surface-strong disabled:pointer-events-none disabled:opacity-30";
  return (
    <div class="flex items-center gap-1">
      <FormPost action={`${action}/move-book`} {...alpineAttrs}>
        <input type="hidden" name="bookId" value={bookId} />
        <input type="hidden" name="direction" value="up" />
        <button type="submit" disabled={isFirst} class={buttonClass} title="Move up">
          {chevronUp}
        </button>
      </FormPost>
      <FormPost action={`${action}/move-book`} {...alpineAttrs}>
        <input type="hidden" name="bookId" value={bookId} />
        <input type="hidden" name="direction" value="down" />
        <button type="submit" disabled={isLast} class={buttonClass} title="Move down">
          {chevronDown}
        </button>
      </FormPost>
    </div>
  );
};

export default ReorderControls;
