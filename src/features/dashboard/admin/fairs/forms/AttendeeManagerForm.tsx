import type { BookFair, FairAttendee } from "../../../../../db/schema";
import SectionTitle from "../../../../../components/app/SectionTitle";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import { getAllCreatorOptionsForFairs } from "../services";
import AttendeesList from "../components/AttendeesList";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";

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
    <div id="attendees" class="space-y-4">
      <SectionTitle>Attending Publishers & Artists</SectionTitle>
      <FormPost
        action={`/dashboard/admin/fairs/${fair.id}/attendees`}
        x-target="attendees-list"
      >
        <div class="flex gap-4 items-end mb-4">
          <div class="flex-1">
            <OptionsComboBox
              label="Add Creators"
              name="creatorId"
              options={creatorOptions}
              multiple
            />
          </div>
          <Button variant="solid" color="primary" width="auto">
            Add Attendees
          </Button>
        </div>
      </FormPost>
      <div
        id="attendees-list"
        {...{ "@attendees:updated.window": "$ajax($el.dataset.refreshUrl)" }}
      >
        <AttendeesList attendees={attendees} fairId={fair.id} />
      </div>
    </div>
  );
};

export default AttendeeManagerForm;
