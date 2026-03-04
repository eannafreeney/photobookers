import clsx from "clsx";
import { ChildType } from "../../../types";
import { capitalize } from "../../utils";
import Link from "./Link";

type CardProps = {
  children: ChildType;
  className?: string;
};

const Card = ({ children, className }: CardProps) => (
  <div
    class={clsx(
      "group flex flex-col rounded-radius overflow-hidden border border-outline bg-surface text-on-surface",
      className,
    )}
  >
    {children}
  </div>
);

type HeaderProps = {
  children: ChildType;
};

const CardHeader = ({ children }: HeaderProps) => (
  <div class="flex items-center justify-between gap-2 p-2">{children}</div>
);

type BodyProps = {
  children: ChildType;
  gap?: string;
};

const CardBody = ({ children, gap = "2" }: BodyProps) => (
  <div class={`flex flex-col gap-${gap} p-4`}>{children}</div>
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
      />
    </Link>
  </figure>
);

type TitleProps = {
  children: ChildType;
};

const CardTitle = ({ children }: TitleProps) => (
  <h3 class="text-balance text-md font-semibold text-on-surface-strong">
    {children}
  </h3>
);

type SubTitleProps = {
  children: ChildType;
};

const CardSubTitle = ({ children }: SubTitleProps) => (
  <span class="text-sm font-medium">{children}</span>
);

type IntroProps = {
  children: ChildType;
};

const CardIntro = ({ children }: IntroProps) => (
  <p class="text-pretty text-sm text-on-surface-weak whitespace-pre-wrap line-clamp-7">
    {children}
  </p>
);

type DescriptionProps = {
  children: ChildType;
};

const CardDescription = ({ children }: DescriptionProps) => (
  <p class="text-pretty text-sm text-on-surface-weak whitespace-pre-wrap">
    {children}
  </p>
);

type TextProps = {
  children: ChildType;
};

const CardText = ({ children }: TextProps) => (
  <span class="text-xs text-on-surface-weak whitespace-pre-wrap line-clamp-2">
    {children}
  </span>
);

type TagsProps = {
  tags: string[];
};

const CardTags = ({ tags }: TagsProps) => {
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
