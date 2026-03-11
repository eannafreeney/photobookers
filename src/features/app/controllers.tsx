import { Context } from "hono";
import { getFlash, getUser, setFlash } from "../../utils";
import { getIsMobile } from "../../lib/device";
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
import { parseSortBy } from "../../lib/utils";
import ContactPage from "./pages/ContactPage";
import { ContactFormContext } from "./types";
import { showErrorAlert } from "../../lib/alertHelpers";
import { supabaseAdmin } from "../../lib/supabase";
import { generateContactEmail } from "./emails";
import LatestBooksFragment from "./fragments/LatestBooksFragment";
import FeaturedBooksFragment from "./fragments/FeaturedBooksFragment";

export const getHomePage = async (c: Context) => {
  return c.redirect("/featured");
};

export const getCreatorDetailPage = async (c: Context) => {
  const slug = c.req.param("slug");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const sortBy = parseSortBy(c.req.query("sortBy"));

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
  const sortBy = parseSortBy(c.req.query("sortBy"));

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
  const sortBy = parseSortBy(c.req.query("sortBy"));

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
  const sortBy = parseSortBy(c.req.query("sortBy"));

  return c.html(
    <FeedPage
      user={user}
      flash={flash}
      currentPath={currentPath}
      currentPage={page}
      sortBy={sortBy}
    />,
  );
};

export const getLibraryPage = async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const sortBy = parseSortBy(c.req.query("sortBy"));

  return c.html(
    <LibraryPage
      user={user}
      flash={flash}
      currentPath={currentPath}
      currentPage={page}
      sortBy={sortBy}
    />,
  );
};

export const getAboutPage = async (c: Context) => {
  return c.html(<AboutPage />);
};

export const getContactPage = async (c: Context) => {
  return c.html(<ContactPage />);
};

export const getTermsPage = async (c: Context) => {
  return c.html(<TermsAndConditionsPage />);
};

export const getArtistsPage = async (c: Context) => {
  const user = await getUser(c);
  const page = Number(c.req.query("page") ?? 1);
  return c.html(<CreatorsPage type="artist" user={user} currentPage={page} />);
};

export const getPublishersPage = async (c: Context) => {
  const user = await getUser(c);
  const page = Number(c.req.query("page") ?? 1);
  return c.html(
    <CreatorsPage type="publisher" user={user} currentPage={page} />,
  );
};

export const processContact = async (c: ContactFormContext) => {
  const form = c.req.valid("form");

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: "hello@photobookers.com",
        subject: "New Contact Form Submission",
        html: generateContactEmail(form),
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });
    if (error) {
      console.error("Failed to send email:", error);
      return showErrorAlert(
        c,
        "Failed to send contact email. Please try again.",
      );
    }
  } catch (error) {
    console.error("Error sending contact email:", error);
    return showErrorAlert(c, "Failed to send contact email");
  }

  await setFlash(c, "success", "Contact form submitted successfully");
  return c.redirect("/");
};

// Fragment routes

export const getLatestBooksFragment = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);
  const sortBy = parseSortBy(c.req.query("sortBy"));

  return c.html(
    <LatestBooksFragment
      user={user}
      currentPage={page}
      sortBy={sortBy}
      currentPath={currentPath}
    />,
  );
};

export const getFeaturedBooksFragment = async (c: Context) => {
  const user = await getUser(c);

  return c.html(<FeaturedBooksFragment user={user} />);
};
