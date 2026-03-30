import { AuthUser } from "../../../../types";
import Card from "../../../components/app/Card";
import HeroCarousel from "../../../components/app/HeroCarousel";

import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { capitalize, getRandomCoverUrl } from "../../../utils";
import DiscoveryTags from "../components/DiscoveryTags";
import Intersector from "../components/Intersector";
import NewsletterCard from "../components/NewsletterCard";
import PublishersSlider from "../components/CreatorsSlider";
import SiteFeatures from "../components/SiteFeatures";
import { getFirstBookByTag } from "../services";

type Props = {
  user: AuthUser | null;
  currentPath: string;
};

const FeaturedBooksPage = async ({ user, currentPath }: Props) => {
  return (
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <Page>
        <HeroCarousel />
        <div class="text-center text-2xl font-bold">
          The social network for photobook lovers.
        </div>
        <Intersector id="stats-fragment" endpoint="/fragments/stats" />
        <SiteFeatures />
        <Intersector
          id="featured-books-fragment"
          endpoint="/fragments/featured-books"
        />
        <Intersector
          id="creators-slider-fragment"
          endpoint="/fragments/creators-slider"
        />
        <NewsletterCard />
        <DiscoveryTags />
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
