import { PublisherOfTheWeekWithCreator } from "../services";
import SchedulePublisherOfTheWeekModal from "./SchedulePOTWModal";

type Props = {
  week: string;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const EditPOTWModal = async ({ week, publisherOfTheWeek }: Props) => {
  const formValues = {
    weekStart: week,
    creatorId:
      publisherOfTheWeek?.creatorId ?? publisherOfTheWeek?.creator?.id ?? "",
    text: publisherOfTheWeek?.text ?? "",
  };

  return (
    <SchedulePublisherOfTheWeekModal formValues={formValues} week={week} />
  );
};

export default EditPOTWModal;
