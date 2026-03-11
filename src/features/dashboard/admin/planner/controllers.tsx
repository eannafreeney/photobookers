import { Context } from "hono";
import { getUser } from "../../../../utils";
import PlannerPage from "./pages/PlannerPage";
import { getWeekStarts } from "./utils";
import {
  deleteArtistOfTheWeekByWeekStart,
  deleteBookOfTheWeekByWeekStart,
  deletePublisherOfTheWeekByWeekStart,
  getArtistOfTheWeekForDateQuery,
  getBookOfTheWeekForDateQuery,
  getFeaturedBooksForWeekQuery,
  getPublisherOfTheWeekForDateQuery,
  setArtistOfTheWeek,
  setBookOfTheWeek,
  setFeaturedBooksForWeek,
  setPublisherOfTheWeek,
  updateArtistOfTheWeek,
  updateBookOfTheWeek,
  updatePublisherOfTheWeek,
} from "./services";
import {
  ArtistOfTheWeekFormContext,
  BOTWFormWithBookIdContext,
  PlannerWeekQueryContext,
  PublisherOfTheWeekFormContext,
} from "./types";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getBookById } from "../../books/services";
import EditBOTWModal from "./modals/EditBOTWModal";
import Alert from "../../../../components/app/Alert";
import ScheduleBOTWModal from "./modals/ScheduleBOTWModal";
import ScheduleFeaturedModal from "./modals/ScheduleFeaturedModal";
import { FeaturedFormContext } from "./types";
import EditFeaturedBooksModal from "./modals/EditFeaturedBooksModal";
import { parseWeekString } from "../../../../lib/utils";
import ScheduleAOTWModal from "./modals/ScheduleAOTWModal";
import SchedulePOTWModal from "./modals/SchedulePOTWModal";
import EditPOTWModal from "./modals/EditPOTWModal";
import EditAOTWModal from "./modals/EditAOTWModal";

const updatePlanner = () => (
  <div id="server_events">
    <div x-init="$dispatch('planner:updated')"></div>
  </div>
);

export const getPlannerPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const year = Number(c.req.query("year") ?? new Date().getFullYear());
  const weekStarts = getWeekStarts(year);
  const currentPath = c.req.path;

  return c.html(
    <PlannerPage
      user={user}
      year={year}
      weekStarts={weekStarts}
      currentPath={currentPath}
    />,
  );
};

// ---------- BOOK OF THE WEEK  ----------

export const getScheduleBOTWModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  return c.html(<ScheduleBOTWModal week={week} />);
};

export const getEditBOTWModalAdmin = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  const bookOfTheWeek = Number.isNaN(weekStart.getTime())
    ? null
    : await getBookOfTheWeekForDateQuery(weekStart);

  if (!bookOfTheWeek) return showErrorAlert(c, "Book of the week not found");

  return c.html(<EditBOTWModal week={week} bookOfTheWeek={bookOfTheWeek} />);
};

export const setBOTWAdmin = async (c: BOTWFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const bookId = formData.bookId;
  const weekStart = formData.weekStart;
  const text = formData.text;

  try {
    const bookOfTheWeek = await setBookOfTheWeek({
      weekStart,
      bookId,
      text: text ?? "",
    });
    if (!bookOfTheWeek) {
      return showErrorAlert(c, "Failed to set book of the week");
    }
  } catch (error) {
    return showErrorAlert(c, "Failed to set book of the week");
  }

  return c.html(
    <>
      <Alert type="success" message="Book of the Week set!" />
      {updatePlanner()}
    </>,
  );
};

export const updateBOTWAdmin = async (c: BOTWFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const bookId = formData.bookId;
  const weekStart = formData.weekStart;
  const text = formData.text;

  const bookOfTheWeek = await updateBookOfTheWeek({
    weekStart,
    bookId,
    text: text ?? "",
  });

  const book = await getBookById(bookId);
  if (!book) return showErrorAlert(c, "Book not found");

  if (!bookOfTheWeek) {
    return c.html(
      <div id="book-of-the-week-errors" class="text-danger text-xs my-2">
        That week already has a book assigned, or this book is already chosen
        for another week.
      </div>,
      422,
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Book of the Week edited!" />
      {updatePlanner()}
    </>,
  );
};

export const deleteBOTWAdmin = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const deleted = await deleteBookOfTheWeekByWeekStart(weekStart);
  if (!deleted?.length) return showErrorAlert(c, "Failed to delete");
  return c.html(
    <>
      <Alert type="success" message="Book of the Week deleted!" />
      {updatePlanner()}
    </>,
  );
};

// ---------- FEATURED BOOKS ----------

export const getFeaturedModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  return c.html(<ScheduleFeaturedModal week={week} />);
};

export const getEditFeaturedModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  const featuredBooks = Number.isNaN(weekStart.getTime())
    ? []
    : await getFeaturedBooksForWeekQuery(weekStart);

  return c.html(
    <EditFeaturedBooksModal featuredBooks={featuredBooks} week={week} />,
  );
};

export const setFeaturedAdmin = async (c: FeaturedFormContext) => {
  const form = c.req.valid("form");
  const weekStart = form.weekStart;
  const bookIds: [string, string, string, string, string] = [
    form.bookId1,
    form.bookId2,
    form.bookId3,
    form.bookId4,
    form.bookId5,
  ];

  const result = await setFeaturedBooksForWeek(weekStart, bookIds);

  if (!result.ok) {
    return showErrorAlert(c, result.error ?? "Failed to set featured books.");
  }

  return c.html(
    <>
      <Alert type="success" message="Featured books set!" />
      {updatePlanner()}
    </>,
  );
};

export const updateFeaturedBooksAdmin = async (c: FeaturedFormContext) => {
  const form = c.req.valid("form");
  const weekStart = form.weekStart;
  const bookIds: [string, string, string, string, string] = [
    form.bookId1,
    form.bookId2,
    form.bookId3,
    form.bookId4,
    form.bookId5,
  ];

  const result = await setFeaturedBooksForWeek(weekStart, bookIds);

  if (!result.ok) {
    return showErrorAlert(
      c,
      result.error ?? "Failed to update featured books.",
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Featured books updated!" />
      {updatePlanner()}
    </>,
  );
};

// ---------- ARTIST OF THE WEEK ----------
export const getScheduleArtistModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  return c.html(<ScheduleAOTWModal week={week} />);
};

export const getEditArtistModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  const artistOfTheWeek = Number.isNaN(weekStart.getTime())
    ? null
    : await getArtistOfTheWeekForDateQuery(weekStart);

  if (!artistOfTheWeek)
    return showErrorAlert(c, "Artist of the week not found");

  return c.html(
    <EditAOTWModal week={week} artistOfTheWeek={artistOfTheWeek} />,
  );
};

export const setArtistOfTheWeekAdmin = async (
  c: ArtistOfTheWeekFormContext,
) => {
  const form = c.req.valid("form");
  const row = await setArtistOfTheWeek({
    weekStart: form.weekStart,
    creatorId: form.creatorId,
    text: form.text,
  });
  if (!row) {
    return c.html(
      <div id="artist-of-the-week-errors" class="text-danger text-sm my-2">
        Failed to set artist of the week (week may already have one).
      </div>,
      422,
    );
  }
  return c.html(
    <>
      <Alert type="success" message="Artist of the Week set!" />
      {updatePlanner()}
    </>,
  );
};

export const updateArtistOfTheWeekAdmin = async (
  c: ArtistOfTheWeekFormContext,
) => {
  const form = c.req.valid("form");
  const row = await updateArtistOfTheWeek({
    weekStart: form.weekStart,
    creatorId: form.creatorId,
    text: form.text ?? "",
  });
  if (!row) {
    return c.html(
      <div id="artist-of-the-week-errors" class="text-danger text-sm my-2">
        Failed to update artist of the week.
      </div>,
      422,
    );
  }
  return c.html(
    <>
      <Alert type="success" message="Artist of the Week updated!" />
      {updatePlanner()}
    </>,
  );
};

export const deleteArtistOfTheWeek = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const deleted = await deleteArtistOfTheWeekByWeekStart(weekStart);
  if (!deleted?.length) return showErrorAlert(c, "Failed to delete");
  return c.html(
    <>
      <Alert type="success" message="Artist of the Week removed." />
      {updatePlanner()}
    </>,
  );
};

// ---------- PUBLISHER OF THE WEEK ----------
export const getSchedulePublisherModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  return c.html(<SchedulePOTWModal week={week} />);
};

export const getEditPublisherModal = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  const publisherOfTheWeek = Number.isNaN(weekStart.getTime())
    ? null
    : await getPublisherOfTheWeekForDateQuery(weekStart);
  return c.html(
    <EditPOTWModal week={week} publisherOfTheWeek={publisherOfTheWeek} />,
  );
};

export const setPublisherOfTheWeekAdmin = async (
  c: PublisherOfTheWeekFormContext,
) => {
  const form = c.req.valid("form");
  const row = await setPublisherOfTheWeek({
    weekStart: form.weekStart,
    creatorId: form.creatorId,
    text: form.text ?? "",
  });
  if (!row) {
    return c.html(
      <div id="publisher-of-the-week-errors" class="text-danger text-sm my-2">
        Failed to set publisher of the week (week may already have one).
      </div>,
      422,
    );
  }
  return c.html(
    <>
      <Alert type="success" message="Publisher of the Week set!" />
      {updatePlanner()}
    </>,
  );
};

export const updatePublisherOfTheWeekAdmin = async (
  c: PublisherOfTheWeekFormContext,
) => {
  const form = c.req.valid("form");
  const row = await updatePublisherOfTheWeek({
    weekStart: form.weekStart,
    creatorId: form.creatorId,
    text: form.text ?? "",
  });
  if (!row) {
    return c.html(
      <div id="publisher-of-the-week-errors" class="text-danger text-sm my-2">
        Failed to update publisher of the week.
      </div>,
      422,
    );
  }
  return c.html(
    <>
      <Alert type="success" message="Publisher of the Week updated!" />
      {updatePlanner()}
    </>,
  );
};

export const deletePublisherOfTheWeek = async (c: PlannerWeekQueryContext) => {
  const week = c.req.valid("query").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const deleted = await deletePublisherOfTheWeekByWeekStart(weekStart);
  if (!deleted?.length) return showErrorAlert(c, "Failed to delete");
  return c.html(
    <>
      <Alert type="success" message="Publisher of the Week removed." />
      {updatePlanner()}
    </>,
  );
};
