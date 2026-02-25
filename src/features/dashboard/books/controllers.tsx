import { Context } from "hono";
import { getFlash, getUser, setFlash } from "../../../utils";
import { getIsMobile } from "../../../lib/device";
import BooksOverview from "../../../pages/dashboard/BooksOverview";
import AddBookPage from "../../../pages/dashboard/AddBookPage";
import { resolveArtist } from "../../../services/creators";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { createBook, prepareBookData } from "../../../services/books";
import Alert from "../../../components/app/Alert";

export const getBooksOverview = async (c: Context) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  const currentPath = c.req.path;

  return c.html(
    <BooksOverview
      searchQuery={searchQuery}
      user={user}
      flash={flash}
      currentPath={currentPath}
      isMobile={isMobile}
    />,
  );
};

export const getAddBookPage = async (c: Context) => {
  const user = await getUser(c);
  return c.html(<AddBookPage user={user} />);
};

export const createBookAsPublisher = async (c: Context) => {
  const user = await getUser(c);
  const formData = c.req.valid("form");

  if (!user.creator) {
    return showErrorAlert(c, "No Creator Profile Found");
  }

  const artist = await resolveArtist(formData, user.id);

  if (artist === "error" || !artist) {
    return showErrorAlert(c, "Invalid artist");
  }

  const bookData = await prepareBookData(
    formData,
    artist,
    user.id,
    user.creator,
  );
  const newBook = await createBook(bookData);

  if (!newBook) {
    return c.html(<Alert type="danger" message="Failed to create book" />, 422);
  }

  await setFlash(c, "success", `${newBook.title} created!`);
  return c.redirect("/dashboard/books");
};
