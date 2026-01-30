import ButtonCircle from "./ButtonCircle";

type ShareButtonProps = {
  url?: string;
  title?: string;
  text?: string;
  isCircleButton?: boolean;
};

const ShareButton = ({
  url,
  title,
  text,
  isCircleButton = false,
}: ShareButtonProps) => {
  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareText = text || `Check out ${shareTitle}`;

  return (
    <ButtonCircle
      x-data={`shareButton({ 
        url: ${JSON.stringify(shareUrl)}, 
        title: ${JSON.stringify(shareTitle)}, 
        text: ${JSON.stringify(shareText)} 
      })`}
      x-on:click="share()"
    >
      {shareIcon}
    </ButtonCircle>
  );
};

export default ShareButton;

export const shareIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
    />
  </svg>
);
