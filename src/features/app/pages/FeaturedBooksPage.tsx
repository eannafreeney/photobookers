import { AuthUser } from "../../../../types";
import Card from "../../../components/app/Card";
import GridPanel from "../../../components/app/GridPanel";
import TickerBanner from "../../../components/app/TickerBanner";
import AppLayout from "../../../components/layouts/AppLayout";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import { capitalize, getRandomCoverUrl } from "../../../utils";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import BookOfTheWeekGrid from "../components/BOTWGrid";
import DiscoveryTags from "../components/DiscoveryTags";
import Intersector from "../components/Intersector";
import { getFirstBookByTag } from "../services";

type Props = {
  user: AuthUser | null;

  currentPath: string;
  isMobile: boolean;
};

const FeaturedBooksPage = async ({ user, currentPath, isMobile }: Props) => {
  return (
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <TickerBanner />
      <Page>
        <NavTabs currentPath={currentPath} />
        <BookOfTheWeekGrid user={user} isMobile={isMobile} />
        <DiscoveryTags />
        <Intersector
          id="featured-books-fragment"
          endpoint="/fragments/featured-books"
        />
        {/* <DiscoveryCards /> */}
        <Intersector
          id="creator-spotlights-fragment"
          endpoint="/fragments/creator-spotlights"
        />
        <Intersector
          id="latest-books-fragment"
          endpoint="/fragments/latest-books"
        />
      </Page>
    </AppLayout>
  );
};

export default FeaturedBooksPage;

const DiscoveryCards = async () => {
  const tagSlugs = [
    "europe",
    "france",
    "europe",
    "france",
    "europe",
    "france",
  ] as const;
  // Fetch 1 book per tag, and use its coverUrl as the image
  const discoveryCards = await Promise.all(
    tagSlugs.map(async (tag) => {
      const [error, book] = await getFirstBookByTag(tag);
      if (error || !book) return null;

      const src = book?.coverUrl || getRandomCoverUrl();
      return {
        src,
        alt: `#${capitalize(tag)}`,
        href: `/books/tags/${tag}`,
      };
    }),
  );

  return (
    <div
      class="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]
            sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]
            lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
    >
      {discoveryCards
        .filter((card) => card !== null)
        .map((card) => (
          <Card key={card?.href}>
            <div class="relative">
              <div class="opacity-60">
                <Card.Image src={card?.src} alt={card?.alt} href={card?.href} />
              </div>
              <a href={card?.href}>
                <div class="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center text-black text-3xl tracking-wider font-semibold">
                  {card?.alt}
                </div>
              </a>
            </div>
          </Card>
        ))}
    </div>
  );
};
