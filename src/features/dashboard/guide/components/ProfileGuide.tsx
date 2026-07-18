import { PropsWithChildren } from "hono/jsx";
import {
  analyticsIcon,
  booksIcon,
  feedIcon,
  imageSkeletonIcon,
  updatesIcon,
  usersIcon,
} from "../../../../lib/icons";
import { Creator } from "../../../../db/schema";
import { ChildType } from "../../../../../types";

type Props = {
  creator: Pick<Creator, "id" | "slug" | "type" | "status">;
};

// A static, self-contained "how to get the most out of your profile" guide for
// creators. Each section links straight to the dashboard area it describes so a
// creator can act on the advice without hunting for the right screen.
const ProfileGuide = ({ creator }: Props) => {
  const profileHref = `/dashboard/creators/${creator.id}`;
  const publicHref = `/creators/${creator.slug}`;
  const collaborators = creator.type === "publisher" ? "artists" : "publishers";

  return (
    <div class="flex flex-col gap-8">
      <p class="max-w-2xl text-sm md:text-base text-on-surface text-pretty">
        Your profile is how readers, collectors, and buyers discover your work.
        A complete, active profile stands out in browse and search, and gives
        visitors a reason to follow you and click through to buy. Work through
        the steps below to make yours shine.
      </p>

      <GuideSection
        step={1}
        icon={usersIcon(5)}
        title="Write a strong description"
        cta={{ label: "Edit your profile", href: profileHref }}
      >
        <p>
          Your description sits at the top of your profile and in the{" "}
          <strong>About</strong> tab. It's your chance to say who you are and
          what your work is about in a few sentences.
        </p>
        <TipList
          tips={[
            "Keep it to 2–4 short paragraphs — concrete beats generic.",
            "Say what you make and the themes, places, or ideas behind it.",
            "Mention notable publishers, awards, or exhibitions if you have them.",
            "Add links to your website and social so visitors can follow you off-platform.",
          ]}
        />
      </GuideSection>

      <GuideSection
        step={2}
        icon={imageSkeletonIcon}
        title="Use strong profile and banner images"
        cta={{ label: "Update your images", href: profileHref }}
      >
        <p>
          Your avatar and banner are the first thing visitors see. Good imagery
          signals that your profile is worth exploring.
        </p>
        <TipList
          tips={[
            "Upload high-resolution images — a wide banner (roughly 1600px across) looks sharp on every screen.",
            "Pick a recognizable avatar that still reads well at small sizes.",
            "Keep it on-brand and well-lit; avoid busy, text-heavy graphics.",
            "Aim for a consistent look between your banner, avatar, and book covers.",
          ]}
        />
      </GuideSection>

      <GuideSection
        step={3}
        icon={booksIcon}
        title="Add books with great covers"
        cta={{ label: "Add a book", href: "/dashboard/books/new" }}
        secondaryCta={{
          label: "Import several at once",
          href: "/dashboard/books/import",
        }}
      >
        <p>
          Your books are the heart of your profile. Three things make the
          biggest difference to whether a book gets found and bought:{" "}
          <strong>tags</strong>, a <strong>good description</strong>, and{" "}
          <strong>proper images of both the cover and the interior</strong>.
          Don't skip them.
        </p>
        <TipList
          tips={[
            "Add plenty of tags — themes, subjects, style, location. Tags are how readers filter and discover your book in browse and search.",
            "Write a real description: what the book is about, how it's made and printed, and why it matters. A few concrete sentences beat one generic line.",
            "Upload a proper cover shot — straight-on, true colors, sharp, and no glare.",
            "Show the interior too: add several spreads and detail images so buyers can see the paper, printing, and sequencing before they commit.",
            "Fill in the rest — title, year, and publisher — and keep sold-out or upcoming status current so visitors know what they can buy.",
          ]}
        />
      </GuideSection>

      <GuideSection
        step={4}
        icon={updatesIcon}
        title="Post updates regularly"
        cta={{ label: "Write a post", href: "/dashboard/messages" }}
      >
        <p>
          Posts appear in your <strong>Posts</strong> tab and in your followers'
          feeds. They're the best way to stay visible between releases — share
          new books, signings, fairs, restocks, or behind-the-scenes moments.
        </p>
        <TipList
          tips={[
            "Post consistently — a steady rhythm keeps you in followers' feeds.",
            "Lead with an image; posts with visuals get far more attention.",
            "Keep the text short and end with a clear link or call to action.",
          ]}
        />
      </GuideSection>

      <GuideSection
        step={5}
        icon={feedIcon}
        title="Understand your profile tabs"
      >
        <p>
          Your public profile organizes everything into tabs, and each one fills
          in automatically as you add content:
        </p>
        <ul class="flex flex-col gap-2 text-sm md:text-base text-on-surface">
          <TabExplainer label="Books">
            Every book you've added, newest first.
          </TabExplainer>
          <TabExplainer label="Posts">
            Your updates — grows each time you post.
          </TabExplainer>
          <TabExplainer label={collaborators === "artists" ? "Artists" : "Publishers"}>
            The {collaborators} you're connected to through your books.
          </TabExplainer>
          <TabExplainer label="Fairs">
            Book fairs you're attending, so visitors can meet you in person.
          </TabExplainer>
          <TabExplainer label="About">
            Your description and links — the reason to complete step 1.
          </TabExplainer>
        </ul>
      </GuideSection>

      <GuideSection
        step={6}
        icon={analyticsIcon}
        title="Learn from your analytics"
        cta={{ label: "Open analytics", href: "/dashboard/analytics" }}
      >
        <p>
          Analytics shows you views, favorites, and purchase clicks over time.
          Use it to see which books and traffic sources are working, then do more
          of what performs.
        </p>
      </GuideSection>

      <GuideSection
        step={7}
        icon={usersIcon(5)}
        title="Share your profile"
        cta={{ label: "View your public profile", href: publicHref }}
      >
        <p>
          The more people you send to your profile, the more follows and sales
          you'll see. Share your link in your Instagram bio, newsletters, and
          anywhere you already have an audience.
        </p>
        {creator.status !== "verified" ? (
          <p class="text-sm text-on-surface-weak">
            Tip: verified creators get extra sharing tools and a share banner on
            their dashboard.
          </p>
        ) : null}
      </GuideSection>
    </div>
  );
};

export default ProfileGuide;

type CtaLink = { label: string; href: string };

type GuideSectionProps = PropsWithChildren<{
  step: number;
  icon: ChildType;
  title: string;
  cta?: CtaLink;
  secondaryCta?: CtaLink;
}>;

const GuideSection = ({
  step,
  icon,
  title,
  cta,
  secondaryCta,
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
    {cta || secondaryCta ? (
      <div class="flex flex-wrap gap-2 pt-1">
        {cta ? (
          <a
            href={cta.href}
            class="inline-flex items-center gap-1 border border-accent px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10"
          >
            {cta.label}
          </a>
        ) : null}
        {secondaryCta ? (
          <a
            href={secondaryCta.href}
            class="inline-flex items-center gap-1 border border-outline px-3 py-1.5 text-sm font-semibold text-on-surface hover:border-outline-strong"
          >
            {secondaryCta.label}
          </a>
        ) : null}
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

const TabExplainer = ({
  label,
  children,
}: PropsWithChildren<{ label: string }>) => (
  <li class="flex flex-col gap-0.5 border-l-2 border-outline pl-3">
    <span class="font-semibold text-on-surface-strong">{label}</span>
    <span class="text-on-surface-weak">{children}</span>
  </li>
);
