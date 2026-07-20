import Modal from "@/components/app/Modal";
import FormPost from "@/components/forms/FormPost";
import Input from "@/components/forms/Input";
import TextArea from "@/components/forms/TextArea";
import FormButtons from "@/components/forms/FormButtons";

type Props = {
  /** Base issue action path, e.g. `/dashboard/admin/magazine/{id}`. */
  action: string;
  bookId: string;
  /** DOM id of the card to swap once the email sends. */
  targetId: string;
  /** Address on file (editable/prefilled); empty when the artist has none. */
  recipientEmail: string | null;
  subject: string;
  /** The AI-generated question, editable before sending. */
  prompt: string;
  /** 1-based position of this book in the issue, for reveal-day context. */
  dayNumber: number;
};

// The edit modal fetched (GET) when the admin clicks "Email question to artist".
// Recipient, subject and the AI question are editable; the surrounding email copy
// is fixed, and the body is rebuilt from the (possibly edited, and saved)
// question on POST.
const ArtistEmailModal = ({
  action,
  bookId,
  targetId,
  recipientEmail,
  subject,
  prompt,
  dayNumber,
}: Props) => {
  const initialForm = {
    email: recipientEmail ?? "",
    subject,
    prompt,
    revealDate: "",
  };
  // Dotted / namespaced Alpine attribute names must be passed as string keys.
  const formAttrs = {
    "x-target": `${targetId} toast`,
    "x-target.error": "toast",
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "isSubmitting = false",
    "x-on:ajax:success": "$dispatch('dialog:close')",
  };

  return (
    <Modal title="Email question to artist" maxWidth="max-w-2xl">
      <FormPost
        action={`${action}/email-artist`}
        x-data={`magazineArtistEmailForm(${JSON.stringify(initialForm)})`}
        className="flex flex-col gap-1"
        {...formAttrs}
      >
        <input type="hidden" name="bookId" value={bookId} />
        <Input
          label="To"
          type="email"
          name="form.email"
          required
          validateInput="validateField('email')"
        />
        <Input
          label="Subject"
          name="form.subject"
          required
          validateInput="validateField('subject')"
        />
        <TextArea
          label="Question for the artist"
          name="form.prompt"
          minRows={4}
          required
          validateInput="validateField('prompt')"
        />
        <p class="-mt-1 mb-2 text-xs text-on-surface-weak">
          Edit the question if you like — it's saved to the book, and the email is
          written around it.
        </p>

        <Input label="Reveal day (optional)" type="date" name="form.revealDate" />
        <p class="-mt-1 mb-2 text-xs text-on-surface-weak">
          This is book #{dayNumber} in the issue. Set the date it goes live on
          Instagram and the email tells the artist when to reshare — leave blank to
          skip.
        </p>

        <FormButtons
          buttonText="Send email"
          loadingText="Sending..."
          showCancelButton
        />
      </FormPost>
    </Modal>
  );
};

export default ArtistEmailModal;
