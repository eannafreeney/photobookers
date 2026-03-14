import { AuthUser } from "../../../../../types";
import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import Table from "../../../../components/app/Table";
import { Creator } from "../../../../db/schema";
import PreviewButton from "../../../api/components/PreviewButton";
import PublishToggleForm from "../components/PublishToggleForm";
import { getBooksForStubPublishersByCreatorId } from "../services";

type Props = {
  searchQuery?: string;
  creator: Creator;
  user: AuthUser | null;
};

const BooksCreatedForStubPublishersTable = async ({ user, creator }: Props) => {
  // const books = await getBooksForStubPublishersByCreatorId(creator.id);
  const books = [];
  console.log("books for stub publishers", books);

  const validBooks = books?.filter((book) => book != null);

  if (validBooks?.length === 0) {
    return <></>;
  }

  return (
    <div>
      <SectionTitle>Published Books</SectionTitle>
      {/* <p>
        Books created by you unclaimed publishers. You can edit, delete or
        publish the book as long as the publisher remains unclaimed.
      </p> */}
      <div class="overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
        <table
          id="books-other-publishers-table"
          class="w-full text-left text-sm text-on-surface"
        >
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              <Table.HeadRow>Publisher</Table.HeadRow>
              <Table.HeadRow>Release Date</Table.HeadRow>
              <Table.HeadRow>Publish</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            <p>No books found</p>
            {/* {validBooks?.map((book) => (
              <BookTableRow book={book} user={user} />
            ))} */}
          </Table.Body>
        </table>
      </div>
    </div>
  );
};

export default BooksCreatedForStubPublishersTable;

type BookTableRowProps = {
  book: Book & { artist: Creator; publisher: Creator };
  user: AuthUser | null;
};

const BookTableRow = ({ book, user }: BookTableRowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <tr>
      <Table.BodyRow>
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/edit/${book.id}#book-images`}>
            <Button variant="outline" color="warning">
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </Table.BodyRow>
      <Table.BodyRow>{book.title}</Table.BodyRow>
      <Table.BodyRow>
        <a href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName}
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        {book.releaseDate
          ? book.releaseDate
              .toISOString()
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/")
          : ""}
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishToggleForm book={book} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PreviewButton book={book} user={user} />
      </Table.BodyRow>

      <Table.BodyRow>
        <a href={`/dashboard/books/edit/${book.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </Table.BodyRow>
    </tr>
  );
};
