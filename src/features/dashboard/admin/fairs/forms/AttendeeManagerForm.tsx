import type { BookFair, FairAttendee } from "../../../../../db/schema";
import SectionTitle from "../../../../../components/app/SectionTitle";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import { getAllCreatorOptionsForFairs } from "../services";
import AttendeesList from "../components/AttendeesList";

type AttendeeManagerFormProps = {
  fair: BookFair;
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
};

const AttendeeManagerForm = async ({
  fair,
  attendees,
}: AttendeeManagerFormProps) => {
  const [error, creatorOptions] = await getAllCreatorOptionsForFairs();

  if (error) {
    return <div>Error loading creators</div>;
  }

  return (
    <div class="space-y-4">
      <SectionTitle>Attending Publishers & Artists</SectionTitle>
      <form
        method="post"
        action={`/dashboard/admin/fairs/${fair.id}/attendees`}
        x-target="attendees-list"
      >
        <div class="flex gap-4 items-end mb-4">
          <div class="flex-1">
            <OptionsComboBox
              label="Add Creator"
              name="creatorId"
              options={creatorOptions}
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary"
          >
            Add Attendee
          </button>
        </div>
      </form>
      <div id="attendees-list" {...{ "@attendees:updated.window": "$ajax($el.dataset.refreshUrl)" }}>
        <AttendeesList attendees={attendees} fairId={fair.id} />
      </div>
    </div>
  );
};

export default AttendeeManagerForm;
