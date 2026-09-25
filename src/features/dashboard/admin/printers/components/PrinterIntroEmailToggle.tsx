import FormPost from "../../../../../components/forms/FormPost";

type Props = {
  printerId: string;
  sentAt: Date | null;
};

const PrinterIntroEmailToggle = ({ printerId, sentAt }: Props) => {
  const isSent = Boolean(sentAt);
  const id = `printer-intro-email-${printerId}`;

  const alpineAttrs = {
    "x-target": `${id} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <FormPost
      id={id}
      action={`/dashboard/admin/printers/${printerId}/intro-email`}
      {...alpineAttrs}
    >
      <label
        class="cursor-pointer"
        title={isSent ? "Intro email sent" : "Send intro email"}
      >
        <input
          type="checkbox"
          class="peer sr-only"
          checked={isSent}
          disabled={isSent}
          aria-label={isSent ? "Intro email sent" : "Send intro email"}
          x-on:change="$el.form?.requestSubmit()"
        />
        <div class="relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-success peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"></div>
      </label>
    </FormPost>
  );
};

export default PrinterIntroEmailToggle;
