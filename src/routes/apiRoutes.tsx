import { Context, Hono } from "hono";
import FollowButton from "../components/api/FollowButton";
import WishlistButton from "../components/api/WishlistButton";
import { getUser } from "../utils";
import { creators } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  deleteFollow,
  deleteWishlist,
  insertFollow,
  insertWishlist,
} from "../db/queries";
import AuthModal from "../components/app/AuthModal";
import { findUserByEmail } from "../services/users";
import { db } from "../db/client";
import {
  getBookPermissionData,
  getBooksInWishlist,
  searchBooks,
} from "../services/books";
import { getCreatorPermissionData, searchCreators } from "../services/creators";
import NavSearchResults from "../components/app/NavSearchResults";
import Alert from "../components/app/Alert";
import NavSearch from "../components/layouts/NavSearch";
import { closeIcon } from "../components/layouts/NavSearchMobile";
import AppLayout from "../components/layouts/AppLayout";
import { normalizeUrl } from "../services/verification";
import BookCard from "../components/app/BookCard";
import GridPanel from "../components/app/GridPanel";
import WishlistedBooks from "../components/app/WishlistedBooks";
import ErrorPage from "../pages/error/errorPage";

export const apiRoutes = new Hono();

apiRoutes.post("/follow/creator/:creatorId", async (c) => {
  const creatorId = c.req.param("creatorId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) {
    return c.html(<AuthModal action="to follow this creator." />, 401);
  }

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
  if (!creator) {
    return showErrorAlert(c, "Book not found");
  }

  const message = isCurrentlyFollowing
    ? `You are no longer following ${creator.displayName}.`
    : `You are now following ${creator.displayName}.`;

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
});

apiRoutes.post("/wishlist/:bookId", async (c) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) {
    return c.html(<AuthModal action="to wishlist this book." />, 401);
  }

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
  if (!book) {
    return showErrorAlert(c, "Book not found");
  }

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
});

apiRoutes.get("/wishlist-books", async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  if (!user) {
    return c.html(<ErrorPage errorMessage="User not found" user={user} />);
  }
  return c.html(
    <WishlistedBooks
      user={user}
      currentPage={currentPage}
      currentPath={currentPath}
    />,
  );
});

const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
) => c.html(<Alert type="danger" message={errorMessage} />, 422);

apiRoutes.get("/check-email", async (c) => {
  const email = c.req.query("email");

  if (!email) {
    return c.html(<div id="email-availability-status"></div>);
  }

  const existingUser = await findUserByEmail(email);
  const available = !existingUser;

  return c.html(
    <div id="email-availability-status">
      {available ? (
        <p class="label text-success mt-1">✓</p>
      ) : (
        <p class="label text-danger mt-1">✗</p>
      )}
    </div>,
  );
});

apiRoutes.get("/check-displayName", async (c) => {
  const displayName = c.req.query("displayName");

  if (!displayName) {
    return c.html(<div id="display-name-availability-status"></div>);
  }

  const existingCreator = await db.query.creators.findFirst({
    where: eq(creators.displayName, displayName),
  });

  const available = !existingCreator;

  return c.html(
    <div id="display-name-availability-status">
      {available ? (
        <p class="label text-success mt-1">✓</p>
      ) : (
        <p class="label text-danger mt-1">✗</p>
      )}
    </div>,
  );
});

apiRoutes.get("/check-website", async (c) => {
  const website = c.req.query("website");

  if (!website) {
    return c.html(<div id="website-availability-status"></div>);
  }

  const existingWebsite = await db.query.creators.findFirst({
    where: eq(creators.website, normalizeUrl(website)),
  });

  const available = !existingWebsite;

  return c.html(
    <div id="website-availability-status">
      {available ? (
        <p class="label text-success mt-1">✓</p>
      ) : (
        <p class="label text-danger mt-1">✗</p>
      )}
    </div>,
  );
});

apiRoutes.get("/search", async (c) => {
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
});

apiRoutes.get("/search/mobile", async (c) => {
  return c.html(
    <div
      id="search-results-mobile-container"
      class="fixed top-0 left-0 right-0 bottom-0 w-full z-10 backdrop-blur-md"
      x-data="{ isOpen: true }"
      x-show="isOpen"
    >
      <div class="flex items-center justify-between gap-4 p-4">
        <NavSearch isMobile />
        <button x-on:click="isOpen = false">{closeIcon}</button>
      </div>
    </div>,
  );
});

apiRoutes.get("/test", async (c) => {
  return c.html(
    <AppLayout title="Test">
      <div x-data>
        <span
          {...{ "x-on:notify.window": "() => console.log('hello world')" }}
        ></span>
        <button x-on:click="$dispatch('notify')">Notify</button>
      </div>
    </AppLayout>,
  );
});
