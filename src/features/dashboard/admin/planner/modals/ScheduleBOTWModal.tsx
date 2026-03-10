import Button from "../../../../../components/app/Button";
import Modal from "../../../../../components/app/Modal";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import FormButtons from "../../../../../components/forms/FormButtons";
import BookOfTheWeekForm from "../forms/BookOfTheWeekForm";
import { getAllBooksPreview } from "../services";

type Props = {
  week: string;
  formValues?: {
    weekStart: string;
    bookId: string;
    text: string;
  };
};

const ScheduleBOTWModal = async ({ week, formValues }: Props) => {
  const allBooks = await getAllBooksPreview();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName} ${book.publisher ? `- ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
  }));

  // const alpineAttrs = {
  //   "x-data": `bookOfTheWeekForm(${JSON.stringify(formValues)}, false)`,
  //   "x-target": "toast",
  //   "x-on:ajax:after":
  //     "$dispatch('dialog:close'), $dispatch('planner:updated')",
  // };

  return (
    <Modal title="Schedule Book of the Week">
      <BookOfTheWeekForm
        options={options}
        week={week}
        formValues={formValues}
      />
      {/* <form
        {...alpineAttrs}
        action="/dashboard/admin/planner/book-of-the-week/create"
        method="post"
        class="flex flex-col gap-4"
      >
        <OptionsComboBox options={options} name="form.bookId" />
        <input type="hidden" name="weekStart" value={week} />
        <FormButtons buttonText="Schedule" loadingText="Scheduling..." />
      </form> */}
    </Modal>
  );
};

export default ScheduleBOTWModal;
