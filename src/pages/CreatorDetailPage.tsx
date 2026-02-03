import AppLayout from "../components/layouts/AppLayout";
import ArtistList from "../components/app/ArtistList";
import BookList from "../components/app/BookList";
import { AuthUser } from "../../types";
import Page from "../components/layouts/Page";
import CreatorCard from "../components/app/CreatorCard";
import { getCreatorBySlug } from "../services/creators";
import CreatorCardMobile from "../components/app/CreatorCardMobile";

type CreatorDetailPageProps = {
  user: AuthUser | null;
  creatorSlug: string;
  currentPath: string;
};

const CreatorDetailPage = async ({
  user,
  creatorSlug,
  currentPath,
}: CreatorDetailPageProps) => {
  const result = await getCreatorBySlug(creatorSlug);

  if (!result.creator) {
    return (
      <AppLayout title="Creator not found" user={user}>
        <p>Creator not found</p>
      </AppLayout>
    );
  }

  const { creator, artists } = result;
  const books =
    creator.type === "publisher"
      ? creator?.booksAsPublisher
      : creator?.booksAsArtist || [];

  return (
    <AppLayout title={creator?.displayName ?? ""} user={user}>
      <Page>
        <CreatorCardMobile creator={creator} />
        <div class="hidden md:block text-4xl font-medium my-8">
          {creator?.displayName ?? ""}
        </div>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="md:w-3/4 flex flex-col gap-4">
            <BookList books={books ?? []} />
            <ArtistList artists={artists} creator={creator} />
          </div>
          <div class="md:w-1/4">
            <CreatorCard creator={creator} currentPath={currentPath} />
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorDetailPage;
