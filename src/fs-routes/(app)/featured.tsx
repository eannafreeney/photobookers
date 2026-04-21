import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import HeroCarousel from "../../components/app/HeroCarousel";
import SiteFeatures from "../../features/app/components/SiteFeatures";
import Intersector from "../../features/app/components/Intersector";
import NewsletterBanner from "../../features/app/components/NewsletterBanner";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import DiscoveryTags from "../../features/app/components/DiscoveryTags";
import { getIsMobile } from "../../lib/device";
import PageBleed from "../../components/layouts/PageContent";
import ScrollReveal from "../../components/app/ScrollReveal";
import { getInterviews } from "../../features/app/services";
import { log } from "console";
import { getCreatorById } from "../../features/dashboard/creators/services";
import SectionTitle from "../../components/app/SectionTitle";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <NewsletterBanner />
      <Page>
        <HeroCarousel />
        <Slogan />
        <ScrollReveal>
          <Intersector id="stats-fragment" endpoint="/fragments/stats" />
        </ScrollReveal>
        <ScrollReveal>
          <SiteFeatures />
        </ScrollReveal>
        <ScrollReveal>
          <Interviews />
        </ScrollReveal>
        <ScrollReveal>
          <Intersector
            id="featured-books-fragment"
            endpoint="/fragments/featured-books"
          />
        </ScrollReveal>
        <ScrollReveal>
          <PageBleed>
            <Intersector
              id="creators-slider-fragment"
              endpoint="/fragments/creators-slider"
            />
          </PageBleed>
        </ScrollReveal>
        <ScrollReveal>
          <NewsletterCard />
        </ScrollReveal>
        <ScrollReveal>
          <PageBleed>
            <DiscoveryTags />
          </PageBleed>
        </ScrollReveal>
        <ScrollReveal>
          <Intersector
            id="latest-books-fragment"
            endpoint="/fragments/latest-books"
          />
        </ScrollReveal>
      </Page>
    </AppLayout>,
  );
});

const Slogan = () => (
  <div class="text-center text-2xl font-bold">
    The{" "}
    <span
      x-data={`{
              words: ['community', 'social network', 'archive', 'home'],
              current: 0,
              visible: true,
               init() {
                setInterval(() => {
                  this.visible = false
                  setTimeout(() => {
                    this.current = (this.current + 1) % this.words.length
                    this.visible = true
                  }, 300)
                }, 2500)
              }
            }`}
      x-text="words[current]"
      x-bind:class="visible ? 'opacity-100' : 'opacity-0'"
      class="border-b-2 border-black inline-block transition-opacity duration-300"
    />{" "}
    for photobook lovers.
  </div>
);

const Interviews = async () => {
  const [error, interviews] = await getInterviews();

  if (error) return <div>Error: {error.reason}</div>;
  if (!interviews) return <div>No interviews found</div>;

  return (
    <>
      <SectionTitle>Interviews</SectionTitle>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex w-5xl sm:w-full items-center gap-6">
          {interviews.map((interview) => (
            <InterviewCard interview={interview} />
          ))}
        </div>
      </div>
    </>
  );
};

const InterviewCard = ({ interview }) => (
  <div class="relative rounded-radius overflow-hidden w-full">
    <a href={`/interviews/${interview.creator.slug}`} class="cursor-pointer">
      <img
        src={interview.promoImageUrl ?? ""}
        class="w-full h-64 object-cover rounded-radius"
        alt="Interview"
      />
      <div class="absolute inset-0 flex flex-col gap-1 items-center justify-center rounded-radius bg-black/50 p-4 text-white">
        <h3 class="text-3xl font-medium tracking-wider text-center">
          {interview.creator.displayName}
        </h3>
      </div>
    </a>
  </div>
);
