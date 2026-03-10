import { getAllBooksPreview } from "../services";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import Button from "../../../../../components/app/Button";

const ScheduleBOTWContent = async ({ week }: { week: string }) => {
  const allBooks = await getAllBooksPreview();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName} ${book.publisher ? `- ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
    description: book?.description,
  }));

  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
  };

  return (
    <div id="schedule-modal-content" class="h-24">
      <form
        {...alpineAttrs}
        action="/dashboard/admin/planner/book-of-the-week/create"
        method="post"
        class="flex flex-col gap-4"
      >
        <OptionsComboBox options={options} name="form.bookId" />
        <input type="hidden" name="weekStart" value={week} />
        <Button color="primary" variant="solid">
          Schedule
        </Button>
      </form>
    </div>
  );
};

export default ScheduleBOTWContent;
