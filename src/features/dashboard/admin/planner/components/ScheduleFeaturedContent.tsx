import { getAllBooksPreview } from "../services";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import Button from "../../../../../components/app/Button";

const ScheduleFeaturedContent = async ({
  week,
  initialBookIds,
}: {
  week: string;
  initialBookIds?: string[];
}) => {
  const allBooks = await getAllBooksPreview();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName}${book.publisher ? ` - ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
    description: book?.description,
  }));

  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
  };

  return (
    <div id="featured-set-modal-content" class="flex flex-col gap-4">
      <form
        {...alpineAttrs}
        action="/dashboard/admin/planner/featured/set"
        method="post"
        class="flex flex-col gap-4"
      >
        <input type="hidden" name="weekStart" value={week} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <label class="text-xs text-on-surface-weak">Book {i}</label>
            <OptionsComboBox options={options} name={`form.bookId${i}`} />
          </div>
        ))}
        <Button color="primary" variant="solid">
          Save featured books
        </Button>
      </form>
    </div>
  );
};
export default ScheduleFeaturedContent;
