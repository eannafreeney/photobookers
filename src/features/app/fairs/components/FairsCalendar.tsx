import { BookFair } from "../../../../db/schema";
import Link from "../../../../components/app/Link";
import { fairUrl } from "../../spotlightUrls";

type FairsCalendarProps = {
  year: number;
  month: number;
  fairs: Array<
    Pick<
      BookFair,
      | "id"
      | "slug"
      | "name"
      | "startDate"
      | "endDate"
      | "city"
      | "country"
      | "listingTier"
    >
  >;
  baseUrl: string;
};

const FairsCalendar = ({ year, month, fairs, baseUrl }: FairsCalendarProps) => {
  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  // Group fairs by date
  const fairsByDate = new Map<number, typeof fairs>();
  fairs.forEach((fair) => {
    const start = new Date(fair.startDate);
    const end = new Date(fair.endDate);
    
    // Add fair to all dates it spans in this month
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month - 1, d);
      if (currentDate >= start && currentDate <= end) {
        const existing = fairsByDate.get(d) || [];
        fairsByDate.set(d, [...existing, fair]);
      }
    }
  });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-display font-medium text-on-surface-strong">
          {monthName}
        </h2>
        <div class="flex gap-2">
          <Link
            href={`${baseUrl}?view=calendar&year=${prevYear}&month=${prevMonth}`}
            className="px-4 py-2 text-sm rounded border border-outline hover:border-accent transition-colors"
          >
            ← Previous
          </Link>
          <Link
            href={`${baseUrl}?view=calendar&year=${nextYear}&month=${nextMonth}`}
            className="px-4 py-2 text-sm rounded border border-outline hover:border-accent transition-colors"
          >
            Next →
          </Link>
        </div>
      </div>

      <div class="border-2 border-on-surface-strong rounded">
        {/* Calendar header */}
        <div class="grid grid-cols-7 border-b-2 border-on-surface-strong">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              class="p-2 text-center text-sm font-medium text-on-surface-strong bg-surface-container"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div class="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              class="min-h-[120px] p-2 border-b border-r border-outline bg-surface-container-low"
            />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayFairs = fairsByDate.get(day) || [];
            const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();

            return (
              <div
                key={day}
                class={`min-h-[120px] p-2 border-b border-r border-outline ${
                  isToday ? "bg-accent/5" : ""
                }`}
              >
                <div
                  class={`text-sm font-medium mb-2 ${
                    isToday
                      ? "inline-flex items-center justify-center size-6 rounded-full bg-accent text-on-accent"
                      : "text-on-surface"
                  }`}
                >
                  {day}
                </div>
                <div class="flex flex-col gap-1">
                  {dayFairs.map((fair) => (
                    <Link
                      key={fair.id}
                      href={fairUrl(fair.slug)}
                      className={`text-xs p-1 rounded hover:bg-surface-container transition-colors line-clamp-2 ${
                        fair.listingTier === "promoted"
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-on-surface-muted"
                      }`}
                    >
                      {fair.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fairs.length === 0 && (
        <div class="text-center py-8 text-on-surface-muted">
          No fairs scheduled for this month
        </div>
      )}
    </div>
  );
};

export default FairsCalendar;
