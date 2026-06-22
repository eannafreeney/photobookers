import type { FairAttendee } from "../../../../../db/schema";
import FormDelete from "../../../../../components/forms/FormDelete";

type AttendeesListProps = {
  attendees: Array<
    FairAttendee & {
      creator: {
        id: string;
        slug: string;
        type: "publisher" | "artist";
        displayName: string;
        coverUrl: string | null;
      };
    }
  >;
  fairId: string;
};

const AttendeesList = ({ attendees, fairId }: AttendeesListProps) => {
  if (attendees.length === 0) {
    return (
      <div class="text-center py-8 text-gray-500">
        No attendees yet. Add creators above.
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {attendees.map((attendee) => (
        <div
          class="border rounded-lg p-4 flex items-center justify-between"
          x-data
        >
          <div class="flex items-center gap-3">
            {attendee.creator.coverUrl && (
              <img
                src={attendee.creator.coverUrl}
                alt={attendee.creator.displayName}
                class="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <div class="font-medium">{attendee.creator.displayName}</div>
              <div class="text-sm text-gray-500 capitalize">
                {attendee.creator.type}
              </div>
            </div>
          </div>
          <FormDelete
            action={`/dashboard/admin/fairs/${fairId}/attendees?creatorId=${attendee.creatorId}`}
            confirmMessage={`Remove ${attendee.creator.displayName} from this fair?`}
            {...{ "@ajax:success": "$el.closest('[x-data]').remove()" }}
          />
        </div>
      ))}
    </div>
  );
};

export default AttendeesList;
