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
        class="text-pretty text-base leading-relaxed text-on-surface whitespace-pre-wrap "
        x-show="!expanded"
      >
        {preview}
      </p>
      {needsTruncate ? (
        <p
          x-cloak
          x-show="expanded"
          class="text-pretty text-base leading-relaxed text-on-surface whitespace-pre-wrap "
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
