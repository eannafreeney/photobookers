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
import { parseSortBy } from "../../lib/utils";
import ContactPage from "./pages/ContactPage";
import { ContactFormContext, UserUpdateFormContext } from "./types";
import { showErrorAlert } from "../../lib/alertHelpers";
import { generateContactEmail } from "./emails";
import LatestBooksFragment from "./fragments/LatestBooksFragment";
import FeaturedBooksFragment from "./fragments/FeaturedBooksFragment";
import MessagesPage from "./pages/MessagesPage";
import NewsletterConfirmationPage from "./pages/NewsletterConfirmationPage";
import RelatedBooksFragment from "./fragments/RelatedBooksFragment";
import { getBookBySlug } from "./services";
import { sendAdminEmail } from "../../lib/sendEmail";
import { match } from "../../lib/result";
import UpdateUserModal from "./modals/UpdateUser";
import AuthModal from "../../components/app/AuthModal";
import BooksPage from "./pages/BooksPage";
import StatsFragment from "./fragments/StatsFragment";
import FollowedCreatorsPage from "./pages/FollowedCreatorsPage";
import CreatorsSliderFragment from "./fragments/CreatorsSliderFragment";

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

export const getBooksPage = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <BooksPage user={user} currentPath={currentPath} currentPage={page} />,
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

  return c.html(
    <TagPage
      user={user}
      tag={tag}
      currentPath={currentPath}
      currentPage={page}
    />,
  );
};

export const getFeaturedPage = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(<FeaturedBooksPage user={user} currentPath={currentPath} />);
};

export const getUserUpdateModal = async (c: UserUpdateFormContext) => {
  const form = c.req.valid("form");
  const msg = form.msg;
  const user = await getUser(c);

  if (!user) {
    return c.html(
      <>
        <AuthModal action="to complete this action." />
        <div id="modal-root"></div>
      </>,
    );
  }

  return c.html(<UpdateUserModal user={user} msg={msg} />);
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
  const currentPath = c.req.path;
  return c.html(<AboutPage currentPath={currentPath} />);
};

export const getContactPage = async (c: Context) => {
  const currentPath = c.req.path;
  return c.html(<ContactPage currentPath={currentPath} />);
};

export const getTermsPage = async (c: Context) => {
  const currentPath = c.req.path;
  return c.html(<TermsAndConditionsPage currentPath={currentPath} />);
};

export const getArtistsPage = async (c: Context) => {
  const user = await getUser(c);
  const page = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  return c.html(
    <CreatorsPage
      type="artist"
      user={user}
      currentPage={page}
      currentPath={currentPath}
    />,
  );
};

export const getPublishersPage = async (c: Context) => {
  const user = await getUser(c);
  const page = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  return c.html(
    <CreatorsPage
      type="publisher"
      user={user}
      currentPage={page}
      currentPath={currentPath}
    />,
  );
};

export const getMessagesFeedPage = async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <MessagesPage
      user={user}
      flash={flash}
      currentPath={currentPath}
      currentPage={page}
    />,
  );
};

export const getNewsletterConfirmationPage = async (c: Context) => {
  return c.html(<NewsletterConfirmationPage />);
};

export const processContact = async (c: ContactFormContext) => {
  const form = c.req.valid("form");

  // 🍯 1. Honeypot (bots fill this)
  if (form.website) {
    return c.redirect("/");
  }

  // ⏱️ 2. Time check (bots are instant)
  const ts = Number(form.ts);
  if (!ts || Date.now() - ts < 3000) {
    return c.redirect("/");
  }

  // 🧠 3. Content heuristics (cheap + effective)
  const msg = String(form.message || "");

  // too many links → spam
  if ((msg.match(/http/gi) || []).length > 2) {
    return c.redirect("/");
  }

  // nonsense length
  if (msg.length < 10 || msg.length > 2000) {
    return c.redirect("/");
  }

  // optional: block obvious keywords
  if (/viagra|casino|crypto|loan/gi.test(msg)) {
    return c.redirect("/");
  }

  return match(
    await sendAdminEmail(
      "New Contact Form Submission",
      generateContactEmail(form),
    ),
    {
      err: () => showErrorAlert(c, "Failed to send contact email."),
      ok: async () => {
        await setFlash(c, "success", "Contact form submitted successfully");
        return c.redirect("/");
      },
    },
  );
};

// Fragment routes

export const getLatestBooksFragment = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <LatestBooksFragment
      user={user}
      currentPage={page}
      currentPath={currentPath}
    />,
  );
};

export const getStatsFragment = async (c: Context) => {
  return c.html(<StatsFragment />);
};

export const getFeaturedBooksFragment = async (c: Context) => {
  const user = await getUser(c);
  return c.html(<FeaturedBooksFragment user={user} />);
};

export const getFollowedCreatorsPage = async (c: Context) => {
  const user = await getUser(c);
  return c.html(<FollowedCreatorsPage user={user} />);
};

export const getRelatedBooksFragment = async (c: Context) => {
  const bookSlug = c.req.param("slug");
  const user = await getUser(c);
  const result = await getBookBySlug(bookSlug);

  return c.html(
    <RelatedBooksFragment book={result?.book ?? null} user={user} />,
  );
};

export const getCreatorsSliderFragment = async (c: Context) => {
  return c.html(<CreatorsSliderFragment />);
};
