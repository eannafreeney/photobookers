import { Hono } from "hono";
import BookDetailPage from "../pages/BookDetailPage";
import CreatorDetailPage from "../pages/CreatorDetailPage";
import HomePage from "../pages/HomePage";
import { getBooksByTag } from "../services/books";
import { getFlash, getUser } from "../utils";
import TagPage from "../pages/TagPage";
import BookPreviewPage from "../pages/BookPreviewPage";
import ProfileTab from "../pages/ProfileTab";
import FeedTab from "../pages/FeedTab";
import NewTab from "../pages/NewTab";
import Alert from "../components/app/Alert";
import { supabaseAdmin } from "../lib/supabase";

export const appRoutes = new Hono();

// HOME
appRoutes.get("/", async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);

  return c.html(<HomePage user={user} flash={flash} initialTab="new-books"  />);
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
    />
  );
});

appRoutes.get("/books/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <BookDetailPage user={user} bookSlug={slug} currentPath={currentPath} />
  );
});

appRoutes.get("/books/preview/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;


  return c.html(
    <BookDetailPage user={user} bookSlug={slug} currentPath={currentPath} isPreview status="draft" />
  );
});

appRoutes.get("/books/tags/:tag", async (c) => {
  const tag = c.req.param("tag");
  const user = await getUser(c);
  const books = await getBooksByTag(tag);

  if (!books) {
    return c.redirect("/");
  }

  return c.html(<TagPage books={books} user={user} tag={tag} />);
});

appRoutes.get("/new-books", async (c) => {
  const isAjax = c.req.header("X-Alpine-Target");
  const user = await getUser(c);

  if (isAjax) {
    return c.html(<NewTab user={user} />);
  }

  // Full page load - return HomePage with pre-loaded content
  const flash = await getFlash(c);
  return c.html(<HomePage user={user} flash={flash} initialTab="new-books" />);
});

appRoutes.get("/feed", async (c) => {
  const isAjax = c.req.header("X-Alpine-Target");
  const user = await getUser(c);

  if (isAjax) {
    return c.html(<FeedTab user={user} />);
  }

  const flash = await getFlash(c);
  return c.html(<HomePage user={user} flash={flash} initialTab="feed" />);
});

appRoutes.get("/profile", async (c) => {
  const isAjax = c.req.header("X-Alpine-Target");
  const user = await getUser(c);

  if (isAjax) {
    return c.html(<ProfileTab user={user} />);
  }

  const flash = await getFlash(c);
  return c.html(<HomePage user={user} flash={flash} initialTab="profile" />);
});
