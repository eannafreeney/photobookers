import { fadeTransition } from "../../../lib/transitions";
import FileUpload from "./FileUpload";

type Props = {
  existingCoverUrl?: string | null;
  action: string;
};

const SingleFileUploader = ({ existingCoverUrl, action }: Props) => {
  console.log(existingCoverUrl);
  return (
    <div
      x-data={`{ hasCover: ${
        existingCoverUrl ? "true" : "false"
      }, existingCoverUrl: ${
        existingCoverUrl ? JSON.stringify(existingCoverUrl) : "null"
      } }`}
    >
      <div
        x-show="hasCover && existingCoverUrl"
        class="flex flex-col gap-2 border rounded-box p-4"
      >
        <label class="text-sm font-medium">Current Book Cover</label>
        <ImageCard />
      </div>
      <div x-show="!hasCover" {...fadeTransition}>
        <form action={action} method="post">
          <FileUpload
            label="Book Cover"
            name="form.cover_url"
            required={!existingCoverUrl}
          />
        </form>
      </div>
    </div>
  );
};

export default SingleFileUploader;

const ImageCard = () => (
  <div class="flex items-center gap-4">
    <img
      x-bind:src="existingCoverUrl"
      alt="Book Cover"
      class="w-32 h-32 object-cover rounded"
    />
    <button
      type="button"
      class="btn btn-outline btn-sm"
      x-on:click="hasCover = false; form.cover_url = null"
    >
      Remove
    </button>
  </div>
);
