import { Hono } from "hono";
import BookDetailPage from "../pages/BookDetailPage";
import CreatorDetailPage from "../pages/CreatorDetailPage";
import { getFlash, getUser } from "../utils";
import TagPage from "../pages/TagPage";
import { getIsMobile } from "../lib/device";
import LibraryPage from "../pages/LibraryPage";
import FeedPage from "../pages/FeedPage";
import NewBooksPage from "../pages/NewBooksPage";
import { requireBookPreviewAccess } from "../middleware/bookGuard";
import TermsAndConditionsPage from "../pages/TermsAndConditions";
import CreatorsPage from "../pages/CreatorsPage";
import AboutPage from "../pages/AboutPage";
import ErrorPage from "../pages/error/errorPage";
import WishlistedBooks from "../components/app/WishlistedBooks";

export const appRoutes = new Hono();

// HOME
appRoutes.get("/", async (c) => {
  return c.redirect("/featured");
});

appRoutes.get("/creators/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const rawSort = c.req.query("sortBy");
  const sortBy =
    rawSort === "oldest" || rawSort === "title_asc" || rawSort === "title_desc"
      ? rawSort
      : "newest";

  return c.html(
    <CreatorDetailPage
      creatorSlug={slug}
      user={user}
      currentPath={currentPath}
      isMobile={isMobile}
      currentPage={page}
      sortBy={sortBy}
    />,
  );
});

appRoutes.get("/books/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const currentPath = c.req.path;

  return c.html(
    <BookDetailPage
      user={user}
      bookSlug={slug}
      currentPath={currentPath}
      isMobile={isMobile}
    />,
  );
});

appRoutes.get("/books/preview/:slug", requireBookPreviewAccess, async (c) => {
  const book = c.get("book");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  return c.html(
    <BookDetailPage
      isPreview
      user={user}
      bookSlug={book.slug}
      currentPath={currentPath}
      status="draft"
      isMobile={isMobile}
    />,
  );
});

appRoutes.get("/books/tags/:tag", async (c) => {
  const tag = c.req.param("tag");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const rawSort = c.req.query("sortBy");
  const sortBy =
    rawSort === "oldest" || rawSort === "title_asc" || rawSort === "title_desc"
      ? rawSort
      : "newest";

  return c.html(
    <TagPage
      user={user}
      tag={tag}
      currentPath={currentPath}
      currentPage={page}
      sortBy={sortBy}
    />,
  );
});

appRoutes.get("/featured", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const rawSort = c.req.query("sortBy");
  const sortBy =
    rawSort === "oldest" || rawSort === "title_asc" || rawSort === "title_desc"
      ? rawSort
      : "newest";

  return c.html(
    <NewBooksPage
      user={user}
      flash={flash}
      sortBy={sortBy}
      currentPage={page}
      currentPath={currentPath}
      isMobile={isMobile}
    />,
  );
});

appRoutes.get("/feed", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <FeedPage
      user={user}
      flash={flash}
      currentPath={currentPath}
      currentPage={page}
    />,
  );
});

appRoutes.get("/library", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <LibraryPage
      user={user}
      flash={flash}
      currentPath={currentPath}
      currentPage={page}
    />,
  );
});

appRoutes.get("/about", async (c) => {
  return c.html(<AboutPage />);
});

// appRoutes.get("/contact", async (c) => {
//   return c.html(<ContactPage />);
// });

appRoutes.get("/terms", async (c) => {
  return c.html(<TermsAndConditionsPage />);
});

appRoutes.get("/artists", async (c) => {
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  return c.html(
    <CreatorsPage type="artist" currentPath={currentPath} currentPage={page} />,
  );
});

appRoutes.get("/publishers", async (c) => {
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  return c.html(
    <CreatorsPage
      type="publisher"
      currentPath={currentPath}
      currentPage={page}
    />,
  );
});

appRoutes.get("/wishlist-books", async (c) => {
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
