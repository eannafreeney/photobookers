import clsx from "clsx";
import { capitalize } from "../../../utils";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../lib/horizontalSliderCardWidth";

type Props = {
  tag: string;
  href: string;
  coverUrl?: string | null;
  widthClass?: string;
};

const GroupCard = ({
  tag,
  href,
  coverUrl,
  widthClass = HORIZONTAL_SLIDER_CARD_CLASS,
}: Props) => (
  <div
    class={clsx("relative rounded-radius overflow-hidden shrink-0", widthClass)}
  >
    <a href={href} class="cursor-pointer block">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          width={800}
          height={256}
          loading="lazy"
          decoding="async"
          class="w-full h-64 object-cover rounded-radius"
        />
      ) : (
        <div class="h-64 rounded-radius border-2 border-on-surface-strong bg-surface-alt" />
      )}
      <div class="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-black/55 hover:bg-black/40 transition-all duration-300 p-4 text-white">
        <h3 class="font-display text-3xl font-medium leading-widest text-center text-balance">
          {capitalize(tag)}
        </h3>
      </div>
    </a>
  </div>
);

export default GroupCard;
