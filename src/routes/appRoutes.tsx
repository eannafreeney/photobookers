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

export const appRoutes = new Hono();

// HOME
appRoutes.get("/", async (c) => {
  return c.redirect("/new-books");
});

appRoutes.get("/creators/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  return c.html(
    <CreatorDetailPage
      creatorSlug={slug}
      user={user}
      currentPath={currentPath}
      isMobile={isMobile}
      currentPage={page}
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

  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <TagPage
      user={user}
      tag={tag}
      isMobile={isMobile}
      currentPath={currentPath}
      currentPage={page}
    />,
  );
});

appRoutes.get("/new-books", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  return c.html(
    <NewBooksPage
      user={user}
      flash={flash}
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

appRoutes.get("/terms-and-conditions", async (c) => {
  return c.html(<TermsAndConditionsPage />);
});
