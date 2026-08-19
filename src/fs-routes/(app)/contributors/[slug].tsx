import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import PageHeader from "../../../components/app/PageHeader";
import BookCard from "../../../components/app/BookCard";
import InfoPage from "../../../pages/InfoPage";
import { getContributorByShelfSlug } from "../../../domain/contributors/services";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { routeParam } from "../../../lib/routeParam";

function displayName(user: { firstName: string | null; lastName: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Contributor";
}

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;

    const [error, result] = await getContributorByShelfSlug(slug);
    if (error) return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const { contributor, books } = result;
    const name = displayName(contributor);
    const title = pageTitle(name);

    return c.html(
      <AppLayout
        title={title}
        description={`Books submitted by ${name} on Photobookers`}
        canonicalUrl={canonicalUrl(c.req.url, `/contributors/${slug}`)}
        currentPath={currentPath}
        user={user}
      >
        <Page>
          <PageHeader
            kicker="Contributor"
            title={name}
            intro={`${books.length} book${books.length !== 1 ? "s" : ""} submitted to Photobookers`}
          />
          {books.length > 0 ? (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {books.map((book) => (
                <BookCard book={book} user={user} />
              ))}
            </div>
          ) : (
            <p class="text-on-surface-weak mt-8">No published books yet.</p>
          )}
        </Page>
      </AppLayout>,
    );
  },
);
