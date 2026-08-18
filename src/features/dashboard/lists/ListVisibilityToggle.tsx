import { BookList } from "../../../db/schema";
import FormPatch from "../../../components/forms/FormPatch";

type Props = {
  list: Pick<BookList, "id" | "isPublic" | "title">;
};

const ListVisibilityToggle = ({ list }: Props) => {
  const intent = list.isPublic ? "make-private" : "make-public";

  const alpineAttrs = {
    "x-data": `{ isPublic: ${list.isPublic} }`,
    "x-target": `list-visibility-${list.id} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublic = ${list.isPublic}`,
  };

  return (
    <FormPatch
      id={`list-visibility-${list.id}`}
      action={`/dashboard/lists/${list.id}`}
      {...alpineAttrs}
    >
      <input type="hidden" name="intent" value={intent} />
      <label class="cursor-pointer">
        <input
          type="checkbox"
          class="peer sr-only"
          checked={list.isPublic}
          name="isPublic"
          x-on:change="$root.requestSubmit()"
          title={list.isPublic ? "Make private" : "Make public"}
        />
        <div class="relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"></div>
      </label>
    </FormPatch>
  );
};

export default ListVisibilityToggle;
