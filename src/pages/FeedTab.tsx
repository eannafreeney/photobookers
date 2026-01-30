import { AuthUser } from "../../types";
import Avatar from "../components/app/Avatar";
import Button from "../components/app/Button";
import Card from "../components/app/Card";
import GridPanel from "../components/app/GridPanel";
import Link from "../components/app/Link";
import SectionTitle from "../components/app/SectionTitle";
import { Creator } from "../db/schema";
import { Book } from "../db/schema";
import { getFeedBooks } from "../services/books";
import { formatDate } from "../utils";

type Props = {
  user: AuthUser | null;
};

const FeedTab = async ({ user }: Props) => {
  if (!user) {
    return (
      <>
        <div id="tab-content">
          <SectionTitle>Your Feed</SectionTitle>
          <p>
            See the latest releases from your favorite artists and publishers.
          </p>
          <div
            class="relative w-full overflow-hidden rounded-radius border border-info bg-surface text-on-surface dark:bg-surface-dark dark:text-on-surface-dark"
            role="alert"
          >
            <div class="flex w-full items-center gap-2 bg-info/10 p-4">
              <div
                class="bg-info/15 text-info rounded-full p-1"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="size-6"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="flex flex-col gap-2 ml-2">
                <div>
                  <h3 class="text-sm font-semibold text-info">
                    Login or register to view your feed.
                  </h3>
                </div>
                <div class="flex items-center gap-4">
                  <a href="/auth/login">
                    <Button variant="outline" color="primary">
                      Login
                    </Button>
                  </a>
                  <a href="/auth/register">
                    <Button variant="solid" color="primary">
                      Register
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const feedBooks = await getFeedBooks(user.id);

  if (!feedBooks) {
    return <div id="tab-content">No feed books found</div>;
  }
  return (
    <div id="tab-content">
      <SectionTitle>Feed</SectionTitle>
      <GridPanel isFullWidth>
        {feedBooks.map((book) => (
          <FeedBookCard book={book} artist={book.artist} />
        ))}
      </GridPanel>
    </div>
  );
};

export default FeedTab;

type FeedBookCardProps = {
  book: Book;
  artist: Creator;
};

const FeedBookCard = ({ book, artist }: FeedBookCardProps) => {
  return (
    <Card>
      <div class="flex items-center gap-2 p-2 ">
        <Avatar
          src={artist.coverUrl ?? ""}
          alt={artist.displayName ?? ""}
          size="sm"
        />
        <div class="flex flex-col">
          <Card.Text>{`${artist?.displayName} released a new book.`}</Card.Text>
          <Card.Text>
            {formatDate(new Date(book.releaseDate ?? "").toISOString())}
          </Card.Text>
        </div>
      </div>
      <Card.Image src={book.coverUrl ?? ""} alt={book.title} />
      <Card.Body>
        <div>
          <Card.Title>{book.title}</Card.Title>
          <Card.Text>
            {formatDate(new Date(book.releaseDate ?? "").toISOString())}
          </Card.Text>
        </div>
        <Card.Tags tags={book.tags ?? []} />
        <Link href={`/books/${book.slug}`}>
          <Button variant="solid" color="primary">
            <span>More Info</span>
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};
