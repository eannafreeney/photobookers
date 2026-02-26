import { Context } from "hono";
import { getFlash, getUser } from "../../utils";
import { getIsMobile } from "../../lib/device";
import WishlistedBooks from "../../components/app/WishlistedBooks";
import CreatorDetailPage from "./pages/CreatorDetailPage";
import BookDetailPage from "./pages/BookDetailPage";
import TagPage from "./pages/TagPage";
import FeaturedBooksPage from "./pages/FeaturedBooksPage";
import FeedPage from "./pages/FeedPage";
import LibraryPage from "./pages/LibraryPage";
import AboutPage from "./pages/AboutPage";
import TermsAndConditionsPage from "./pages/TermsAndConditions";
import CreatorsPage from "./pages/CreatorsPage";
import ErrorPage from "../../pages/error/errorPage";

export const getHomePage = async (c: Context) => {
  return c.redirect("/featured");
};

export const getCreatorDetailPage = async (c: Context) => {
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
};

export const getBookDetailPage = async (c: Context) => {
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
};

export const getBookPreviewPage = async (c: Context) => {
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
};

export const getTagPage = async (c: Context) => {
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
};

export const getFeaturedPage = async (c: Context) => {
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
    <FeaturedBooksPage
      user={user}
      flash={flash}
      sortBy={sortBy}
      currentPage={page}
      currentPath={currentPath}
      isMobile={isMobile}
    />,
  );
};

export const getFeedPage = async (c: Context) => {
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
};

export const getLibraryPage = async (c: Context) => {
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
};

export const getAboutPage = async (c: Context) => {
  return c.html(<AboutPage />);
};

export const getContactPage = async (c: Context) => {
  //   return c.html(<ContactPage />);
};

export const getTermsPage = async (c: Context) => {
  return c.html(<TermsAndConditionsPage />);
};

export const getArtistsPage = async (c: Context) => {
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  return c.html(
    <CreatorsPage type="artist" currentPath={currentPath} currentPage={page} />,
  );
};

export const getPublishersPage = async (c: Context) => {
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  return c.html(
    <CreatorsPage
      type="publisher"
      currentPath={currentPath}
      currentPage={page}
    />,
  );
};

export const getWishlistedBooks = async (c: Context) => {
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
};
