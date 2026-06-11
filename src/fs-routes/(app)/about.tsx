import { createRoute } from "hono-fsr";
import SectionTitle from "../../components/app/SectionTitle";
import PageHeader from "../../components/app/PageHeader";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import { canonicalUrl, pageTitle } from "../../lib/seo";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const title = pageTitle("About");
  const description =
    "Photobookers is a place to discover and explore photobooks. Browse books, artists, and publishers in one place.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/about")}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="About"
          title="A home for the photobook"
          intro="Photobookers is a place to discover and explore photobooks — books, artists, and publishers, all in one place."
        />
        <div class="mx-auto w-full max-w-2xl flex flex-col gap-8">
          <p class="text-base leading-relaxed text-on-surface">
            The photobook is one of photography's most enduring forms — a
            complete, considered object where sequence, paper, and print come
            together. But photobooks are scattered across small presses,
            artist-run shops, and out-of-the-way corners of the internet.
            Photobookers brings them together: we list books, artists, and
            publishers in one place so you can find what you're looking for and
            see where to get it.
          </p>
          <section class="flex flex-col gap-3 border-t border-outline pt-6">
            <SectionTitle className="mb-0" kicker="For Fans">
              Discover and collect
            </SectionTitle>
            <p class="text-base leading-relaxed text-on-surface">
              Browse books by artist and publisher, see covers and details, and
              follow links to buy or pre-order. Whether you collect photobooks
              or are just getting started, we help you find titles and keep
              track of who made them and who published them. Like, wishlist,
              and collect books, follow your favorite creators, and get a feed
              of new work as it arrives.
            </p>
          </section>
          <section class="flex flex-col gap-3 border-t border-outline pt-6">
            <SectionTitle className="mb-0" kicker="For Artists">
              Your work, findable
            </SectionTitle>
            <p class="text-base leading-relaxed text-on-surface">
              Get a profile that ties your name to your books and makes your
              work easier to find. List your titles, add a short bio and links,
              and point people to your shop or publisher — so your books show
              up when people search.
            </p>
          </section>
          <section class="flex flex-col gap-3 border-t border-outline pt-6">
            <SectionTitle className="mb-0" kicker="For Publishers">
              Your catalogue, in one place
            </SectionTitle>
            <p class="text-base leading-relaxed text-on-surface">
              Show your catalogue in one place: books, covers, and links to
              your store. We help fans and collectors discover your titles and
              see your list grow as you release new work.
            </p>
          </section>
          <section class="flex flex-col gap-3 border-t border-outline pt-6">
            <SectionTitle className="mb-0" kicker="Every Week">
              An editorial rhythm
            </SectionTitle>
            <p class="text-base leading-relaxed text-on-surface">
              Every day we feature a{" "}
              <a
                href="/book-of-the-day"
                class="underline decoration-accent underline-offset-4 hover:text-accent"
              >
                Book of the Day
              </a>
              , and every week an{" "}
              <a
                href="/artist-of-the-week"
                class="underline decoration-accent underline-offset-4 hover:text-accent"
              >
                Artist
              </a>{" "}
              and a{" "}
              <a
                href="/publisher-of-the-week"
                class="underline decoration-accent underline-offset-4 hover:text-accent"
              >
                Publisher of the Week
              </a>
              , alongside{" "}
              <a
                href="/interviews"
                class="underline decoration-accent underline-offset-4 hover:text-accent"
              >
                interviews
              </a>{" "}
              with the people behind the books. The best way to keep up is the{" "}
              <a
                href="/newsletter"
                class="underline decoration-accent underline-offset-4 hover:text-accent"
              >
                newsletter
              </a>
              .
            </p>
          </section>
        </div>
      </Page>
    </AppLayout>,
  );
});
