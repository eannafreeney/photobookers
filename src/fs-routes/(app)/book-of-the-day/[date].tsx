import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../lib/validator";
import InfoPage from "../../../pages/InfoPage";
import { getBookOfTheDayForDate } from "../../../features/app/BOTDServices";
import { bookPath } from "../../../features/app/spotlightUrls";
import { parseDateString } from "../../../lib/utils";
import { getUser } from "../../../utils";

const dateParamSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform(parseDateString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
});

export const GET = createRoute(paramValidator(dateParamSchema), async (c) => {
  const user = await getUser(c);
  const date = c.req.valid("param").date;

  const [botdError, bookOfTheDay] = await getBookOfTheDayForDate(date);
  if (botdError || !bookOfTheDay.book?.slug) {
    return c.html(
      <InfoPage errorMessage="Book of the day not found" user={user} />,
      404,
    );
  }

  return c.redirect(bookPath(bookOfTheDay.book.slug), 301);
});
