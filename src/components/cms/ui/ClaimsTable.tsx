import { books, Creator, CreatorClaim } from "../../../db/schema";
import SearchForm from "./Search";

type ClaimsTableProps = {
  claims: CreatorClaim[];
  creatorsWithClaims: Creator[];
};

export const ClaimsTable = ({
  claims = [],
  creatorsWithClaims = [],
}: ClaimsTableProps) => {
  const validClaims = claims.filter((claim) => claim != null);
  const validCreatorsWithClaims = creatorsWithClaims.filter(
    (creator) => creator != null
  );

  return (
    <div class="flex flex-col gap-8">
      <SearchForm />
      {/* Desktop Table View */}
      <div class="hidden md:block overflow-x-auto">
        <table id="claims_table" class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="claims_table">
            {validClaims && validClaims.length > 0
              ? validClaims.map((claim) => (
                  <ClaimsTableRow
                    claim={claim}
                    creatorsWithClaims={validCreatorsWithClaims}
                  />
                ))
              : null}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      {/* <div class="block md:hidden">
        {validClaims && validClaims.length > 0
          ? validClaims.map((claim) => <BookCardRow claim={claim} />)
          : null}
      </div> */}
    </div>
  );
};

type ClaimsTableRowProps = {
  claim: CreatorClaim;
  creatorsWithClaims: Creator[];
};

const ClaimsTableRow = ({ claim, creatorsWithClaims }: ClaimsTableRowProps) => {
  if (!claim || !claim.id || !claim.creatorId || !claim.userId) {
    return <></>;
  }

  return (
    <tr>
      <td>
        {
          creatorsWithClaims.find((creator) => creator.id === claim.creatorId)
            ?.displayName
        }
      </td>
      <td>
        {claim.requestedAt
          ? new Date(claim.requestedAt).toLocaleDateString()
          : ""}
      </td>
      <td>{claim.status}</td>
      <td>
        <form
          method="post"
          action={`/dashboard/claims/approve/${claim.id}`}
          x-target="claims_table"
        >
          <button class="btn btn-outline btn-primary">Approve</button>
        </form>
      </td>
    </tr>
  );
};

const BookCardRow = ({ book }: { book: Book }) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <div class="flex items-center gap-4">
          <a
            href={`/books/${book.slug}`}
            target="_blank"
            class="link link-primary"
          >
            <img
              src={book.coverUrl ?? ""}
              alt={book.title}
              class="w-16 h-16 object-cover rounded"
            />
          </a>
          <div class="flex-1">
            <h3 class="card-title text-lg">
              <a
                href={`/books/${book.slug}`}
                target="_blank"
                class="link link-hover"
              >
                {book.title}
              </a>
            </h3>
            {book.releaseDate && (
              <p class="text-sm text-base-content/70">
                {new Date(book.releaseDate).toLocaleDateString()}
              </p>
            )}
            <div class="badge badge-outline mt-1">{book.publicationStatus}</div>
          </div>
        </div>
        <div class="card-actions justify-end mt-4">
          <a
            href={`/dashboard/books/edit/${book.id}`}
            class="btn btn-outline btn-sm"
          >
            Edit
          </a>
          <form
            method="post"
            action={`/dashboard/books/delete/${book.id}`}
            x-target="books_table"
            class="inline"
          >
            <button class="btn btn-outline btn-error btn-sm">Delete</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClaimsTable;
