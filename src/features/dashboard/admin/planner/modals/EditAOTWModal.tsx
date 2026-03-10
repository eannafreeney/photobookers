import type { ArtistOfTheWeekWithCreator } from "../services";
import ScheduleAOTWModal from "./ScheduleAOTWModal";

type Props = {
  week: string;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
};

const EditAOTWModal = async ({ week, artistOfTheWeek }: Props) => {
  const formValues = {
    weekStart: week,
    creatorId: artistOfTheWeek?.creatorId ?? artistOfTheWeek?.creator?.id ?? "",
    text: artistOfTheWeek?.text ?? "",
  };

  return <ScheduleAOTWModal formValues={formValues} week={week} />;
};

export default EditAOTWModal;
