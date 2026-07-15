import FormPost from "@/components/forms/FormPost";
import TextArea from "@/components/forms/TextArea";
import FormButtons from "@/components/forms/FormButtons";

type Props = {
  bookId: string;
  /** The artist's answer/quote already on file, if any. */
  artistQuote: string | null;
  action: string;
};

// Paste the artist's reply here — it's saved as the book's quote and published
// in the issue as "From the artist: …".
const ArtistAnswerForm = ({ bookId, artistQuote, action }: Props) => {
  const initialForm = { quote: artistQuote ?? "" };

  return (
    <FormPost
      action={`${action}/artist-quote`}
      x-data={`magazineArtistQuoteForm(${JSON.stringify(initialForm)})`}
      x-target="toast"
      x-on:submit="submitForm($event)"
      className="mt-1 flex flex-col gap-1"
    >
      <input type="hidden" name="bookId" value={bookId} />
      <TextArea
        label="Artist's answer"
        name="form.quote"
        minRows={3}
        placeholder="Paste the artist's reply to publish in the issue"
        validateInput="validateField('quote')"
      />
      <FormButtons buttonText="Save answer" loadingText="Saving..." />
    </FormPost>
  );
};

export default ArtistAnswerForm;
