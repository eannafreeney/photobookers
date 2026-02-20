import Button from "./Button";

type ShareButtonProps = {
  isCircleButton?: boolean;
};

const ShareButton = ({ isCircleButton = false }: ShareButtonProps) => {
  const tooltipText = "Share";

  if (isCircleButton) {
    return (
      <div x-data="shareButton()">
        <button
          class="inline-flex justify-center items-center aspect-square whitespace-nowrap rounded-full bg-surface-alt p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          title={tooltipText}
          x-on:click="share()"
        >
          {shareIcon()}
        </button>
      </div>
    );
  }

  return (
    <div x-data="shareButton()" class="w-full hover:opacity-75">
      <Button
        type="button"
        variant="outline"
        color="secondary"
        width="full"
        tooltipText={tooltipText}
        onClick="share()"
        {...({ "x-on:click": "share()" } as any)}
      >
        <span class="flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
          Share {shareIcon(4)}
        </span>
      </Button>
    </div>
  );
};

export default ShareButton;

const shareIcon = (size: number = 5) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class={`size-${size}`}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
    />
  </svg>
);
