import { Context } from "hono";
import { capitalize, getUser } from "../../utils";
import AuthModal from "../../components/app/AuthModal";
import {
  deleteFollow,
  deleteWishlist,
  getBookPermissionData,
  getCreatorByDisplayName,
  getCreatorByWebsite,
  getCreatorPermissionData,
  insertFollow,
  insertWishlist,
} from "./services";
import { showErrorAlert } from "../../lib/alertHelpers";
import Alert from "../../components/app/Alert";
import FollowButton from "../../components/api/FollowButton";
import WishlistButton from "../../components/api/WishlistButton";
import { findUserByEmail } from "../../services/users";
import ValidationLabel from "./components/ValidationLabel";
import { searchBooks } from "../../services/books";
import { searchCreators } from "../../services/creators";
import NavSearchResults from "../../components/app/NavSearchResults";
import NavSearch from "../../components/layouts/NavSearch";
import { DISCOVER_TAGS } from "../../constants/discover";
import Link from "../../components/app/Link";
import Badge from "../../components/app/Badge";
import { closeIcon } from "../../lib/icons";

export const followCreator = async (c: Context) => {
  const creatorId = c.req.param("creatorId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId)
    return c.html(<AuthModal action="to follow this creator." />, 401);

  const body = await c.req.parseBody();
  const isCurrentlyFollowing = body.isFollowing === "true";
  const buttonType = body.buttonType; // "circle" or "default"

  try {
    if (isCurrentlyFollowing) {
      await deleteFollow(creatorId, userId);
    } else {
      await insertFollow(userId, creatorId);
    }
  } catch (error) {
    console.error("Failed to add/remove creator from followers", error);
    return showErrorAlert(c);
  }

  const creator = await getCreatorPermissionData(creatorId);
  if (!creator) return showErrorAlert(c, "Book not found");

  const message = isCurrentlyFollowing
    ? `No longer following ${creator.displayName}.`
    : `Now following ${creator.displayName}.`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <FollowButton
        creator={creator}
        user={user}
        isCircleButton={buttonType === "circle"}
      />
    </>,
  );
};

export const wishlistBook = async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId)
    return c.html(<AuthModal action="to wishlist this book." />, 401);

  const body = await c.req.parseBody();
  const isCurrentlyWishlisted = body.isWishlisted === "true";
  const buttonType = body.buttonType; // "circle" or "default"

  try {
    if (isCurrentlyWishlisted) {
      await deleteWishlist(userId, bookId);
    } else {
      await insertWishlist(userId, bookId);
    }
  } catch (error) {
    console.error("Failed to add/remove book to wishlist", error);
    return showErrorAlert(c);
  }

  const book = await getBookPermissionData(bookId);
  if (!book) return showErrorAlert(c, "Book not found");

  const message = isCurrentlyWishlisted
    ? `${book.title} has been removed from your wishlist`
    : `${book.title} has been added to your wishlist`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <WishlistButton
        book={book}
        user={user}
        isCircleButton={buttonType === "circle"}
      />
      <div x-sync id="server_events">
        <div x-init="$dispatch('wishlist:updated')"></div>
      </div>
    </>,
  );
};

export const validateEmail = async (c: Context) => {
  const email = c.req.query("email");
  const id = "email-availability-status";
  if (!email) return c.html(<div id={id}></div>);
  const existingUser = await findUserByEmail(email);
  return c.html(<ValidationLabel id={id} entityExists={!!existingUser} />);
};

export const validateDisplayName = async (c: Context) => {
  const displayName = c.req.query("displayName");
  const id = "display-name-availability-status";
  if (!displayName) return c.html(<div id={id}></div>);
  const existingCreator = await getCreatorByDisplayName(displayName);
  return c.html(<ValidationLabel id={id} entityExists={!!existingCreator} />);
};

export const validateWebsite = async (c: Context) => {
  const website = c.req.query("website");
  const id = "website-availability-status";
  if (!website) return c.html(<div id={id}></div>);
  const existingWebsite = await getCreatorByWebsite(website);
  return c.html(<ValidationLabel id={id} entityExists={!!existingWebsite} />);
};

export const getSearchResults = async (c: Context) => {
  const searchQuery = c.req.query("search");
  const isMobile = c.req.query("isMobile") === "true";

  if (!searchQuery || searchQuery.length < 3) {
    return c.html(
      <div id={isMobile ? "search-results-mobile" : "search-results"}></div>,
    );
  }

  const searchTerm = searchQuery?.trim().toLowerCase();
  const [bookResults, creatorResults] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? ""),
  ]);

  return c.html(
    <NavSearchResults
      isMobile={isMobile}
      creators={creatorResults ?? []}
      books={bookResults ?? []}
    />,
  );
};

export const getMobileSearchScreen = async (c: Context) => {
  return c.html(
    <div
      id="search-results-mobile-container"
      class="fixed top-0 left-0 right-0 bottom-0 w-full z-10 backdrop-blur-2xl"
      x-data="{ isOpen: true }"
      x-show="isOpen"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-4 p-4">
          <NavSearch isMobile />
          <button x-on:click="isOpen = false">{closeIcon}</button>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-6 p-4">
          {DISCOVER_TAGS.map((tag) => (
            <Link href={`/books/tags/${tag.toLowerCase()}`} key={tag}>
              <Badge variant="default" key={tag}>
                {capitalize(tag)}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>,
  );
};
