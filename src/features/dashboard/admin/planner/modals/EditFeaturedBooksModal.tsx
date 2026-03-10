import { FeaturedBookOfTheWeekWithBook } from "../services";
import ScheduleFeaturedModal from "./ScheduleFeaturedModal";

type Props = {
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
  week: string;
};

const EditFeaturedBooksModal = async ({ featuredBooks, week }: Props) => {
  if (featuredBooks.length === 0) {
    return <div>No featured books found</div>;
  }

  const formValues = {
    bookId1: featuredBooks[0]?.bookId ?? "",
    bookId2: featuredBooks[1]?.bookId ?? "",
    bookId3: featuredBooks[2]?.bookId ?? "",
    bookId4: featuredBooks[3]?.bookId ?? "",
    bookId5: featuredBooks[4]?.bookId ?? "",
  };

  console.log("formValues", formValues);

  return <ScheduleFeaturedModal week={week} formValues={formValues} />;
};
export default EditFeaturedBooksModal;
