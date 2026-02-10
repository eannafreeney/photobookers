import { Hono } from "hono";
import BookDetailPage from "../pages/BookDetailPage";
import CreatorDetailPage from "../pages/CreatorDetailPage";
import { getBooksByTag } from "../services/books";
import { getFlash, getUser } from "../utils";
import TagPage from "../pages/TagPage";
import { isMobile } from "../lib/device";
import LibraryPage from "../pages/LibraryPage";
import FeedPage from "../pages/FeedTab";
import NewBooksPage from "../pages/NewBooksPage";

export const appRoutes = new Hono();

// HOME
appRoutes.get("/", async (c) => {
  return c.redirect("/new-books");
});

appRoutes.get("/creators/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <CreatorDetailPage
      creatorSlug={slug}
      user={user}
      currentPath={currentPath}
    />,
  );
});

appRoutes.get("/books/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const device = isMobile(c.req.header("user-agent") ?? "");
  const currentPath = c.req.path;

  return c.html(
    <BookDetailPage
      user={user}
      bookSlug={slug}
      currentPath={currentPath}
      device={device}
    />,
  );
});

appRoutes.get("/books/preview/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const device = isMobile(c.req.header("user-agent") ?? "");

  return c.html(
    <BookDetailPage
      user={user}
      bookSlug={slug}
      currentPath={currentPath}
      isPreview
      status="draft"
      device={device}
    />,
  );
});

appRoutes.get("/books/tags/:tag", async (c) => {
  const tag = c.req.param("tag");
  const user = await getUser(c);
  const books = await getBooksByTag(tag);

  return c.html(<TagPage books={books} user={user} tag={tag} />);
});

appRoutes.get("/new-books", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  return c.html(
    <NewBooksPage user={user} flash={flash} currentPath="/new-books" />,
  );
});

appRoutes.get("/feed", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  return c.html(<FeedPage user={user} flash={flash} currentPath="/feed" />);
});

appRoutes.get("/library", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  return c.html(
    <LibraryPage user={user} flash={flash} currentPath="/library" />,
  );
});
