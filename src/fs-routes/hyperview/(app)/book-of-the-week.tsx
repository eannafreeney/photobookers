import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { hyperview } from "../../../lib/hxml";
import { getRecentBooksOfTheWeek } from "../../../features/app/BOTWServices";
import { toWeekString } from "../../../lib/utils";
import { getBaseUrl } from "../../../lib/hyperview";
import BookCard, {
  bookCardStyles,
} from "../../../features/hyperview/components/BookCard";

export const GET = createRoute(async (c) => {
  const currentPage = Number(c.req.query("page") ?? 1);

  const baseUrl = getBaseUrl(c);

  const [error, result] = await getRecentBooksOfTheWeek(currentPage);

  const hv = hyperview(c);
  return hv(
    <AppLayout title="Book of the Week" extraStyles={bookOfTheWeekStyles()}>
      <View id="page-content" style="page-content">
        {result?.botwEntries.map((entry) => (
          <View key={entry.book.id} style="botw-entry">
            <Text style="botw-week-label">
              Week: {toWeekString(entry.weekStart)}
            </Text>
            <BookCard book={entry.book} baseUrl={baseUrl} />
          </View>
        ))}
      </View>
    </AppLayout>,
  );
});

const bookOfTheWeekStyles = () => (
  <>
    <Style id="page-content" margin={16} />
    <Style
      id="book-of-the-week-title"
      fontSize={24}
      fontWeight="bold"
      color="black"
    />
    <Style id="botw-entry" flexDirection="column" gap={8} marginBottom={16} />
    <Style
      id="botw-week-label"
      fontSize={12}
      fontWeight="600"
      color="#111111"
    />
    {bookCardStyles()}
  </>
);
