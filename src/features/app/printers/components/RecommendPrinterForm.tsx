import Button from "../../../../components/app/Button";

const fieldClass =
  "w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface";

const RecommendPrinterForm = () => {
  return (
    <form
      method="post"
      action="/printers/recommend"
      class="mx-auto flex w-full max-w-lg flex-col gap-4 my-4"
      {...{ "x-target": "modal-root", "x-target.error": "toast" }}
    >
      <label class="flex flex-col gap-1 text-sm">
        Printer name
        <input class={fieldClass} name="name" required />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Link
        <input
          class={fieldClass}
          name="link"
          type="url"
          required
          placeholder="https://"
        />
      </label>
      <Button color="primary" width="fit">
        Recommend
      </Button>
    </form>
  );
};

export default RecommendPrinterForm;
