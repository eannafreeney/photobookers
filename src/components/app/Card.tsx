import { ChildType } from "../../../types";
import { capitalize } from "../../utils";
import Link from "./Link";

type CardProps = {
  children: ChildType;
  className?: string;
};

const Card = ({ children }: CardProps) => (
  <div class="group flex flex-col rounded-radius overflow-hidden border border-outline bg-surface text-on-surface">
    {children}
  </div>
);

const CardHeader = ({ children }: { children: ChildType }) => (
  <div class="flex items-center justify-between gap-2 p-2">{children}</div>
);

const CardBody = ({ children }: { children: ChildType }) => (
  <div class="flex flex-col gap-2 p-4">{children}</div>
);

type CardImageProps = {
  src: string;
  alt: string;
  href: string;
  aspectSquare?: boolean;
  objectCover?: boolean;
};

const CardImage = ({
  src,
  alt,
  href,
  aspectSquare = false,
  objectCover = false,
}: CardImageProps) => (
  <figure
    class={`w-full bg-white ${aspectSquare ? "aspect-square overflow-hidden" : ""}`}
    x-data="imageOrientation"
  >
    <Link href={href}>
      <img
        src={src}
        alt={alt}
        decoding="async"
        class={
          aspectSquare && objectCover
            ? "h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105 z-10"
            : "h-auto w-full transition duration-700 ease-out group-hover:scale-105 z-10"
        }
        {...(!(aspectSquare && objectCover)
          ? { "x-bind:class": "objectFitClass + ' object-contain'" }
          : {})}
      />
    </Link>
  </figure>
);

const CardTitle = ({ children }: { children: ChildType }) => (
  <h3 class="text-balance text-md font-semibold text-on-surface-strong">
    {children}
  </h3>
);

const CardSubTitle = ({ children }: { children: ChildType }) => (
  <span class="text-sm font-medium">{children}</span>
);

const CardIntro = ({ children }: { children: ChildType }) => (
  <p class="text-pretty text-sm text-on-surface-weak whitespace-pre-wrap">
    {children}
  </p>
);

const CardDescription = ({ children }: { children: ChildType }) => (
  <p class="text-pretty text-sm text-on-surface-weak whitespace-pre-wrap">
    {children}
  </p>
);

const CardText = ({ children }: { children: ChildType }) => (
  <span class="text-xs text-on-surface-weak whitespace-pre-wrap line-clamp-2">
    {children}
  </span>
);

const CardTags = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) return <></>;
  return (
    <div class="flex items-center flex-wrap gap-2">
      {tags.slice(0, 3).map((tag) => (
        <span class="w-fit inline-flex overflow-hidden rounded-radius border border-outline bg-surface text-xs font-medium text-on-surface px-2 py-1">
          {capitalize(tag)}
        </span>
      ))}
    </div>
  );
};

Card.Body = CardBody;
Card.Image = CardImage;
Card.Title = CardTitle;
Card.SubTitle = CardSubTitle;
Card.Description = CardDescription;
Card.Intro = CardIntro;
Card.Text = CardText;
Card.Tags = CardTags;
Card.Header = CardHeader;

export default Card;
