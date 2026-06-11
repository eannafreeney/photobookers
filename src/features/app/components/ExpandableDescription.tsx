const DEFAULT_MAX_WORDS = 75;

function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { preview: text.trim(), needsTruncate: false };
  }
  return {
    preview: `${words.slice(0, maxWords).join(" ")}…`,
    needsTruncate: true,
  };
}

type Props = {
  text: string;
  maxWords?: number;
};

const ExpandableDescription = ({
  text,
  maxWords = DEFAULT_MAX_WORDS,
}: Props) => {
  const { preview, needsTruncate } = truncateWords(text, maxWords);

  return (
    <div x-data="{ expanded: false }" class="flex flex-col gap-2">
      <p
        class="text-pretty text-base leading-relaxed text-on-surface whitespace-pre-wrap first-letter:font-display first-letter:text-5xl first-letter:font-medium first-letter:float-left first-letter:mr-2 first-letter:leading-[0.85] first-letter:text-on-surface-strong"
        x-show="!expanded"
      >
        {preview}
      </p>
      {needsTruncate ? (
        <p
          x-cloak
          x-show="expanded"
          class="text-pretty text-base leading-relaxed text-on-surface whitespace-pre-wrap first-letter:font-display first-letter:text-5xl first-letter:font-medium first-letter:float-left first-letter:mr-2 first-letter:leading-[0.85] first-letter:text-on-surface-strong"
        >
          {text}
        </p>
      ) : null}
      {needsTruncate ? (
        <button
          type="button"
          class="self-start kicker text-accent underline underline-offset-4 cursor-pointer"
          x-on:click="expanded = !expanded"
          x-text="expanded ? 'Show less' : 'See more'"
        />
      ) : null}
    </div>
  );
};

export default ExpandableDescription;
