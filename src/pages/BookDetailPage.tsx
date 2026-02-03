import AppLayout from "../components/layouts/AppLayout";
import CarouselMobile from "../components/app/CarouselMobile";
import Card from "../components/app/Card";
import { getBookBySlug } from "../services/books";
import { AuthUser } from "../../types";
import { Book, Creator } from "../db/schema";
import CardButtons from "../components/app/CardButtons";
import TagList from "../components/app/TagList";
import { formatDate } from "../utils";
import Page from "../components/layouts/Page";
import CreatorCard from "../components/app/CreatorCard";
import CreatorCardMobile from "../components/app/CreatorCardMobile";
import Carousel from "../components/app/Carousel";
import SectionTitle from "../components/app/SectionTitle";
import VerifiedCreator from "../components/app/VerifiedCreator";
import ClaimCreatorBtn from "../components/app/ClaimCreatorBtn";
import { canClaimCreator, canFollowCreator } from "../lib/permissions";
import FollowButton from "../components/app/FollowButton";
import { useUser } from "../contexts/UserContext";
import SocialLinks from "../components/app/SocialLinks";

type BookDetailPageProps = {
  user: AuthUser | null;
  bookSlug: string;
  currentPath: string;
  status: "published" | "draft";
  isPreview?: boolean;
};

const BookDetailPage = async ({
  user,
  bookSlug,
  currentPath,
  status,
  isPreview = false,
}: BookDetailPageProps) => {
  const result = await getBookBySlug(bookSlug, status);
  if (!result?.book || !result.book.artist) {
    return (
      <AppLayout title="Book not found" user={user}>
        <p>Book not found</p>
      </AppLayout>
    );
  }

  const { book } = result;
  const artist = result.book.artist;

  const galleryImages = [
    book.coverUrl,
    ...(book?.images?.map((image) => image.imageUrl) ?? []),
  ];

  return (
    <AppLayout title={book.title} user={user}>
      <Page>
        {/* Mobile layout */}
        <div class="flex flex-col gap-4 md:hidden ">
          {isPreview && <PreviewBanner/>}
          <CreatorCardMobile creator={artist} />
          <BookCard book={book} galleryImages={galleryImages} />
          <CreatorCardMobile creator={book.publisher} />
          <Card.Description>{book.description ?? ""}</Card.Description>
          <Card.Description>{book.specs ?? ""}</Card.Description>
          <TagList tags={book.tags ?? []} />
          <CreatorCard creator={book.artist} currentPath={currentPath} />
        </div>
        {/* Desktop layout */}
        <div class="hidden md:flex md:flex-col gap-8">
        {isPreview && <PreviewBanner/>}
          <div class="flex gap-16">
            <div class="w-2/3">
              <Carousel images={galleryImages} />
            </div>
            <div class="w-1/3">
              <SectionTitle>
                {book.title} - {book.artist?.displayName}
              </SectionTitle>
              <div class="flex flex-col gap-4">
                <CardButtons book={book} />
                <Card.Description>{book.description ?? ""}</Card.Description>
                <Card.Description>{book.specs ?? ""}</Card.Description>
                <TagList tags={book.tags ?? []} />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <CreatorCardDesktop
              creator={book.artist}
              currentPath={currentPath}
            />
            <CreatorCardDesktop
              creator={book.publisher}
              currentPath={currentPath}
            />
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default BookDetailPage;

type BookCardProps = {
  book: Book & { publisher: Creator };
  galleryImages: string[];
};

const BookCard = ({ book, galleryImages }: BookCardProps) => {
  return (
    <Card>
      <CarouselMobile images={galleryImages} />
      <Card.Body>
        <div>
          <Card.Title>{book.title}</Card.Title>
          <Card.SubTitle>
            {book.releaseDate
              ? formatDate(new Date(book.releaseDate ?? "").toISOString())
              : ""}
          </Card.SubTitle>
        </div>
        <CardButtons book={book} />
      </Card.Body>
    </Card>
  );
};

const CreatorCardDesktop = ({
  creator,
  currentPath,
}: {
  creator: Creator;
  currentPath: string;
}) => {
  if (!creator) return <></>;
  const user = useUser();

  return (
    <Card>
      <div class="flex">
        <div class="w-48 shrink-0">
          <Card.Image src={creator.coverUrl ?? ""} alt={creator.displayName} />
        </div>
        <Card.Body>
          <div>
            <Card.Title>
              <div class="flex items-start gap-2">
                <a href={`/creators/${creator.slug}`}>{creator.displayName}</a> {VerifiedCreator({ creator })}
              </div>
            </Card.Title>
            <Card.SubTitle>
              <div>
                {creator.city ? `${creator.city}, ` : ""}
                {creator?.country ?? ""}
              </div>
            </Card.SubTitle>
          </div>
          <Card.Intro>{creator.tagline ?? ""}</Card.Intro>
        </Card.Body>
        <Card.Body>
          <FollowButton
            creatorId={creator.id}
            user={user}
            isDisabled={!canFollowCreator(user, creator.id)}
            variant="desktop"
          />
          <ClaimCreatorBtn
            creator={creator}
            currentPath={currentPath}
            user={user ?? undefined}
            isDisabled={!canClaimCreator(user, creator)}
          />
          <SocialLinks creator={creator} />
        </Card.Body>
      </div>
    </Card>
  );
};

const PreviewBanner = () => {
  return (
    <div class="fixed top-0 left-0 w-full bg-yellow-100 text-yellow-800 p-2 rounded-md mb-4">Preview Mode</div>
  );
};