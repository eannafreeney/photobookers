import { PropsWithChildren } from "hono/jsx";
import { ChildType } from "../../../../types";
import { feedIcon, lightbulbIcon, mailIcon, usersIcon } from "../../../lib/icons";

// Static onboarding guide for collectors. Each section links to the screen it
// describes so a collector can act on the advice immediately.
const CollectorGuide = () => {
  return (
    <div class="flex flex-col gap-8">
      <p class="max-w-2xl text-sm md:text-base text-on-surface text-pretty">
        Your collector profile is how other people discover your taste. Make
        your shelf public, favourite the books you love, and post updates so
        others can follow along. Here's how to get set up.
      </p>

      <GuideSection
        step={1}
        icon={usersIcon(5)}
        title="Make your shelf public"
        cta={{ label: "Manage sharing settings", href: "/shelf" }}
      >
        <p>
          Your shelf is your public profile. Turn on sharing and pick a URL so
          people can find you in search and follow you. It stays private until
          you opt in.
        </p>
        <TipList
          tips={[
            "Add a profile photo so your shelf feels personal.",
            "Choose a short, memorable URL.",
          ]}
        />
      </GuideSection>

      <GuideSection
        step={2}
        icon={feedIcon}
        title="Favourite the books you love"
        cta={{ label: "Browse books", href: "/books" }}
      >
        <p>
          Tap the heart on any book to add it to your shelf. Your favourites are
          what visitors see first, so build a shelf that shows your taste.
        </p>
      </GuideSection>

      <GuideSection
        step={3}
        icon={mailIcon(5)}
        title="Post updates"
        cta={{ label: "Write a post", href: "/dashboard" }}
      >
        <p>
          Share a recent find, a favourite spread, or what you're hunting for.
          Posts appear on your shelf and in the feed of everyone who follows
          you.
        </p>
        <TipList
          tips={[
            "Keep it short and specific.",
            "Add an image to make it stand out.",
          ]}
        />
      </GuideSection>

      <GuideSection
        step={4}
        icon={usersIcon(5)}
        title="Follow other collectors"
        cta={{ label: "Find collectors", href: "/collectors" }}
      >
        <p>
          Follow collectors whose taste you admire. Their posts show up in your
          feed, and following is a great way to discover new books.
        </p>
      </GuideSection>
    </div>
  );
};

export default CollectorGuide;

type CtaLink = { label: string; href: string };

type GuideSectionProps = PropsWithChildren<{
  step: number;
  icon: ChildType;
  title: string;
  cta?: CtaLink;
}>;

const GuideSection = ({
  step,
  icon,
  title,
  cta,
  children,
}: GuideSectionProps) => (
  <section class="flex flex-col gap-3 border border-outline bg-surface-alt p-5 md:p-6">
    <div class="flex items-center gap-3">
      <span class="flex size-9 shrink-0 items-center justify-center border border-outline bg-surface text-on-surface-strong">
        {icon}
      </span>
      <h2 class="flex items-baseline gap-2 font-display text-xl md:text-2xl font-medium text-on-surface-strong">
        <span class="text-accent tabular-nums">{step}.</span>
        {title}
      </h2>
    </div>
    <div class="flex flex-col gap-3 text-sm md:text-base text-on-surface text-pretty">
      {children}
    </div>
    {cta ? (
      <div class="flex flex-wrap gap-2 pt-1">
        <a
          href={cta.href}
          class="inline-flex items-center gap-1 border border-accent px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10"
        >
          {cta.label}
        </a>
      </div>
    ) : null}
  </section>
);

const TipList = ({ tips }: { tips: string[] }) => (
  <ul class="flex flex-col gap-1.5">
    {tips.map((tip) => (
      <li class="flex gap-2">
        <span class="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
        <span>{tip}</span>
      </li>
    ))}
  </ul>
);
