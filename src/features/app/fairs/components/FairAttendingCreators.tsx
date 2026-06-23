import Link from "../../../../components/app/Link";
import { getFairAttendees } from "../../../fair-attendees/services";

const FairAttendingCreators = async ({ fairId }: { fairId: string }) => {
  const [attendeesError, attendees] = await getFairAttendees(fairId);
  if (attendeesError || attendees.length === 0) return <></>;

  return (
    <div id="fair-attending-creators" class="space-y-8">
      <div class="text-center">
        <h2 class="font-display text-3xl md:text-4xl font-bold text-on-surface-strong mb-2">
          Attending Creators
        </h2>
        <p class="text-on-surface">
          {attendees.length} {attendees.length === 1 ? "creator" : "creators"}{" "}
          attending this fair
        </p>
      </div>

      {/* Creators Grid */}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {attendees.map((attendee) => (
          <Link href={`/creators/${attendee.creator.slug}`} className="group">
            <div class="flex flex-col items-center gap-3 transition-transform duration-200 hover:scale-105">
              <div class="relative w-full aspect-square overflow-hidden rounded-2xl bg-surface-container shadow-sm group-hover:shadow-md transition-shadow">
                {attendee.creator.coverUrl ? (
                  <img
                    src={attendee.creator.coverUrl}
                    alt={attendee.creator.displayName}
                    class="w-full h-full object-cover"
                  />
                ) : (
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                    <span class="text-4xl font-display font-bold text-accent/40">
                      {attendee.creator.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div class="text-center w-full">
                <p class="text-sm font-semibold text-on-surface-strong group-hover:text-accent transition-colors line-clamp-2">
                  {attendee.creator.displayName}
                </p>
                {(attendee.creator.city || attendee.creator.country) && (
                  <p class="text-xs text-on-surface/70 mt-1">
                    {attendee.creator.city || attendee.creator.country}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FairAttendingCreators;
