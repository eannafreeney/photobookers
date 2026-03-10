import { BookOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";
import ScheduleBOTWModal from "./ScheduleBOTWModal";

type Props = {
  bookOfTheWeek: BookOfTheWeek | null;
  week: string;
};

const EditBOTWModal = ({ week, bookOfTheWeek }: Props) => {
  const formValues = {
    weekStart: bookOfTheWeek?.weekStart
      ? toWeekString(bookOfTheWeek?.weekStart)
      : "",
    text: bookOfTheWeek?.text ?? "",
    bookId: bookOfTheWeek?.bookId ?? "",
  };

  return <ScheduleBOTWModal formValues={formValues} week={week} />;
};

export default EditBOTWModal;
