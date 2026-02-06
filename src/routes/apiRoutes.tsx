import { Context, Hono } from "hono";
import FollowButton from "../components/app/FollowButton";
import WishlistButton from "../components/app/WishlistButton";
import CollectionButton from "../components/app/CollectionButton";
import { getUser } from "../utils";
import { Book, Creator, creators } from "../db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  deleteCollectionItem,
  deleteFollow,
  deleteWishlist,
  insertCollectionItem,
  insertFollow,
  insertWishlist,
} from "../db/queries";
import AuthModal from "../components/app/AuthModal";
import { findUserByEmail } from "../services/users";
import { db } from "../db/client";
import { getBookPermissionData, searchBooks } from "../services/books";
import { getCreatorById, getCreatorPermissionData, searchCreators } from "../services/creators";
import NavSearchResults from "../components/app/NavSearchResults";
import ArtistSearchResults from "../components/app/ArtistSearchResults";
import Alert from "../components/app/Alert";

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

  const message = isCurrentlyFollowing ? `You are no longer following ${creator.displayName}.` : `You are now following ${creator.displayName}.`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <FollowButton creator={creator} user={user} variant="desktop" isCircleButton={buttonType === "circle"} />
      <FollowButton creator={creator} user={user} variant="mobile" isCircleButton={buttonType === "circle"} />
    </>
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

  const message = isCurrentlyWishlisted ? `${book.title} has been removed from your wishlist` : `${book.title} has been added to your wishlist`;

  return c.html(  
    <>
      <Alert type="success" message={message} />
      <WishlistButton book={book} user={user} isCircleButton={buttonType === "circle"} />
    </>
  );
});

const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again."
) => c.html(<Alert type="danger" message={errorMessage} />, 422);

// apiRoutes.post("/collection/:bookId", async (c) => {
//   const bookId = c.req.param("bookId");
//   const user = await getUser(c);
//   const userId = user?.id;

//   if (!userId) {
//     return c.html(
//       <AuthModal action="to add this book to your collection." />,
//       401
//     );
//   }

//   const body = await c.req.parseBody();
//   const isCurrentlyInCollection = body.isInCollection === "true";
//   const buttonType = body.buttonType; // "circle" or "default"

//   try {
//     if (isCurrentlyInCollection) {
//       await deleteCollectionItem(userId, bookId);
//     } else {
//       await insertCollectionItem(userId, bookId);
//     }
//   } catch (error) {
//     console.error("Failed to add/remove book to collection", error);
//     return showErrorAlert(c);
//   }

//   const book = await getBookPermissionData(bookId);
//   if (!book) {
//     return showErrorAlert(c, "Book not found");
//   }

//   if (buttonType === "circle") {
//     return c.html(
//       <CollectionButton bookId={bookId} user={user} isCircleButton />
//     );
//   }

//   return c.html(<CollectionButton bookId={bookId} user={user} />);
// });

apiRoutes.get("/check-email", async (c) => {
  const email = c.req.query("email");

  if (!email) {
    return c.html(<div id="field-status"></div>);
  }

  const existingUser = await findUserByEmail(email);
  const available = !existingUser;

  return c.html(
    <div id="field-status">
      {available ? (
        <p class="label text-success mt-1">✓ Email is available</p>
      ) : (
        <p class="label text-error mt-1">✗ This email is already registered</p>
      )}
    </div>
  );
});

apiRoutes.get("/check-displayName", async (c) => {
  const displayName = c.req.query("displayName");

  if (!displayName) {
    return c.html(<div id="field-status"></div>);
  }

  const existingCreator = await db.query.creators.findFirst({
    where: eq(creators.displayName, displayName),
  });

  const available = !existingCreator;

  return c.html(
    <div id="field-status">
      {available ? (
        <p class="label text-success mt-1">✓ Name is available</p>
      ) : (
        <p class="label text-error mt-1">✗ This Name is already registered</p>
      )}
    </div>
  );
});

apiRoutes.get("/search-artists", async (c) => {
  const searchQuery = c.req.query("q");

  if (!searchQuery || searchQuery.length < 2) {
    return c.html(<div id="artist-search-results"></div>);
  }

  // Normalize query for searching
  const searchTerm = searchQuery.trim().toLowerCase();
  const searchPattern = `%${searchTerm}%`;

  const matchingArtists = await db.query.creators.findMany({
    where: or(
      ilike(creators.displayName, searchPattern),
      ilike(creators.displayName, `${searchTerm}%`),
      sql`LOWER(${creators.displayName}) LIKE ANY(ARRAY[${searchTerm
        .split(" ")
        .map((word) => `'%${word}%'`)
        .join(", ")}])`
    ),
    orderBy: (creators, { asc }) => [asc(creators.displayName)],
    limit: 5,
  });

  return c.html(<ArtistSearchResults artists={matchingArtists} />);
});

apiRoutes.get("/search", async (c) => {
  const searchQuery = c.req.query("search");
 

  const searchTerm = searchQuery?.trim().toLowerCase();
  const [bookResults, creatorResults] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? ""),
  ]);

  const books: (Book & { artist: Creator; publisher: Creator })[] =
    bookResults ?? [];
  const creators = creatorResults ?? [];

  return c.html(
    <NavSearchResults creators={creators} books={books} />
  );
});
