import {
  bookIcon,
  booksIcon,
  libraryIcon,
  mailIcon,
  updatesIcon,
  usersIcon,
} from "../../../lib/icons";
import type { ChildType } from "../../../../types";
import Button from "../../../components/app/Button";

const REGISTER_HREF = "/auth/accounts";

export const tickerItems = [
  {
    title: "Browse photobooks by artist, publisher, and tag",
    icon: booksIcon,
    href: "/books",
  },
  {
    title: "Explore our Book of the Day and weekly picks",
    icon: bookIcon,
    href: "/this-week",
  },
  {
    title: "Get updates from artists and publishers you follow",
    icon: updatesIcon,
    href: "/feed",
  },
  {
    title: "Follow your favorite artists and publishers",
    icon: usersIcon(5),
    href: REGISTER_HREF,
  },
  {
    title: "Add your favorite books to your collection",
    icon: libraryIcon(5),
    href: REGISTER_HREF,
  },
  {
    title: "Join the Newsletter and be updated about new books",
    icon: mailIcon(5),
    href: "/newsletter",
  },
] as const;

const SiteFeatures = () => {
  return (
    <div class="flex flex-col gap-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 mx-auto w-full">
        {tickerItems.map((item, index) => (
          <FeatureCard key={item.title} item={item} index={index} />
        ))}
      </div>
      <div class="flex justify-center border-t border-outline pt-6">
        <a href={REGISTER_HREF}>
          <Button variant="solid" color="primary" width="auto">
            Create a free account
          </Button>
        </a>
      </div>
    </div>
  );
};

export default SiteFeatures;

type FeatureCardProps = {
  item: { title: string; icon: ChildType; href: string };
  index: number;
};

const FeatureCard = ({ item, index }: FeatureCardProps) => (
  <a
    href={item.href}
    class="border-t-2 border-on-surface-strong pt-3 flex items-center gap-4 transition hover:opacity-80"
  >
    <span class="kicker text-accent shrink-0 pt-1">
      {String(index + 1).padStart(2, "0")}
    </span>
    <div class="flex items-center gap-3 min-w-0">
      <span class="w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-strong">
        {item.icon}
      </span>
      <span class="text-sm font-medium text-on-surface-strong min-w-0 text-pretty hover:underline decoration-accent underline-offset-4">
        {item.title}
      </span>
    </div>
  </a>
);
