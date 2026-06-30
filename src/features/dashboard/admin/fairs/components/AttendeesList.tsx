import type { FairAttendee } from "../../../../../db/schema";
import FormDelete from "../../../../../components/forms/FormDelete";
import StatusPill from "../../components/StatusPill";
import Button from "../../../../../components/app/Button";

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
          key={attendee.id}
          class="border rounded-lg p-4 flex flex-col gap-3"
          x-data
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              {attendee.creator.coverUrl && (
                <img
                  src={attendee.creator.coverUrl}
                  alt={attendee.creator.displayName}
                  class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div class="min-w-0">
                <div class="font-medium truncate">
                  {attendee.creator.displayName}
                </div>
                <div class="text-sm text-gray-500 capitalize">
                  {attendee.creator.type}
                </div>
              </div>
            </div>
            <StatusPill status={attendee.status} />
          </div>

          <div class="flex items-center gap-2">
            {attendee.status === "pending" && (
              <>
                <form
                  method="post"
                  action={`/dashboard/admin/fairs/${fairId}/attendees/${attendee.id}/approve`}
                  x-target="attendees-list"
                >
                  <Button variant="solid" color="success">
                    Approve
                  </Button>
                </form>
                <form
                  method="post"
                  action={`/dashboard/admin/fairs/${fairId}/attendees/${attendee.id}/reject`}
                  x-target="attendees-list"
                >
                  <Button variant="solid" color="danger">
                    Reject
                  </Button>
                </form>
              </>
            )}
            <FormDelete
              action={`/dashboard/admin/fairs/${fairId}/attendees?creatorId=${attendee.creatorId}`}
              {...{ "@ajax:success": "$el.closest('[x-data]').remove()" }}
            >
              <Button variant="outline" color="inverse" width="fit">
                Remove
              </Button>
            </FormDelete>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendeesList;
