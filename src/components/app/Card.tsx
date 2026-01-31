import { ChildType } from "../../../types";
import { capitalize } from "../../utils";

type CardProps = {
  children: ChildType;
  className?: string;
};

const Card = ({ children }: CardProps) => (
  <div class="group flex rounded-radius max-w-sm flex-col overflow-hidden border border-outline bg-surface text-on-surface h-full">
    {children}
  </div>
);

const CardBanner = ({ children }: { children: ChildType }) => (
  <div class="flex flex-col gap-4 p-2">{children}</div>
);

const CardBody = ({ children }: { children: ChildType }) => (
  <div class="flex flex-col gap-4 p-6 flex-1">{children}</div>
);

const CardImage = ({ src, alt }: { src: string; alt: string }) => (
  <figure class="overflow-hidden">
    <img
      src={src}
      alt={alt}
      class="min-h-[175px] object-cover transition duration-700 ease-out group-hover:scale-105"
    />
  </figure>
);

const CardTitle = ({ children }: { children: ChildType }) => (
  <h3 class="text-balance text-xl font-bold text-on-surface-strong">
    {children}
  </h3>
);

const CardSubTitle = ({ children }: { children: ChildType }) => (
  <span class="text-sm font-medium">{children}</span>
);

const CardIntro = ({ children }: { children: ChildType }) => (
  <p class="text-pretty text-sm text-on-surface-weak whitespace-pre-wrap line-clamp-3">
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
Card.Banner = CardBanner;

export default Card;
