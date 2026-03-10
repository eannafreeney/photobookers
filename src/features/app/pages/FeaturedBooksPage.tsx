import { AuthUser, Flash } from "../../../../types";
import Button from "../../../components/app/Button";
import Card from "../../../components/app/Card";
import SectionTitle from "../../../components/app/SectionTitle";
import SocialLinks from "../../../components/app/SocialLinks";
import AppLayout from "../../../components/layouts/AppLayout";
import FeatureGuard from "../../../components/layouts/FeatureGuard";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import { getCreatorById } from "../../dashboard/creators/services";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import BooksGrid from "../components/BooksGrid";
import BookOfTheWeekGrid from "../components/BOTWGrid";
import DiscoveryTags from "../components/DiscoveryTags";
import FeaturedBooksGrid from "../components/FeaturedBooksGrid";
import { getThisWeeksFeaturedBooks } from "../FeaturedServices";
import { getLatestBooks } from "../services";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  currentPage: number;
  isMobile: boolean;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
};

const FeaturedBooksPage = async ({
  user,
  flash,
  currentPath,
  currentPage,
  isMobile,
  sortBy,
}: Props) => {
  const [result, bookOfTheWeek, featuredBooks] = await Promise.all([
    getLatestBooks(currentPage, sortBy),
    getThisWeeksBookOfTheWeek(),
    getThisWeeksFeaturedBooks(),
  ]);

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <BookOfTheWeekGrid
          bookOfTheWeek={bookOfTheWeek}
          user={user}
          isMobile={isMobile}
        />
        <DiscoveryTags />
        <FeaturedBooksGrid featuredBooks={featuredBooks} user={user} />
        {/* <CreatorSpotlightsGrid /> */}
        <BooksGrid
          title="New & Notable"
          user={user}
          currentPath={currentPath}
          sortBy={sortBy}
          result={result}
          isFullWidth
        />
      </Page>
    </AppLayout>
  );
};

export default FeaturedBooksPage;

const CreatorSpotlightsGrid = () => {
  return (
    <div class="grid grid-cols-2 gap-4 w-full">
      <div>
        <SectionTitle className="mb-2">Publisher Spotlight</SectionTitle>
        <CreatorSpotlight creatorId="0bc6f290-d574-4c51-8814-c325601736f8" />
      </div>
      <div>
        <SectionTitle className="mb-2">Artist Spotlight</SectionTitle>
        <CreatorSpotlight creatorId="1e8f2a61-c542-40f9-8abb-afee5a5ee06b" />
      </div>
    </div>
  );
};

const CreatorSpotlight = async ({ creatorId }: { creatorId: string }) => {
  const creator = await getCreatorById(creatorId);
  if (!creator) return <></>;
  return (
    <Card className="flex-row">
      <div className="w-1/2 shrink-0">
        <Card.Image
          src={creator?.coverUrl ?? ""}
          alt={creator?.displayName ?? ""}
          href={`/creators/${creator.slug}`}
          aspectSquare
          objectCover
        />
      </div>
      <div class="flex flex-col justify-end gap-2 w-1/2 min-w-0">
        <Card.Body>
          <Card.Title>{creator?.displayName}</Card.Title>
          <Card.Text>
            {creator?.city ? `${creator?.city}, ` : ""} {creator?.country ?? ""}
          </Card.Text>
          <Card.Description>{creator?.bio}</Card.Description>
          <Button variant="solid" color="primary" width="full">
            View Catalog
          </Button>
        </Card.Body>
      </div>
    </Card>
  );
};
