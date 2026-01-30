import { fadeTransition } from "../../../lib/transitions";
import FileUpload from "./FileUpload";

type Props = {
  existingImages?: string[];
};

const MultiFileUploader = ({ existingImages }: Props) => {
  return (
    <div
      x-data={`{ hasImages: ${
        existingImages?.length && existingImages.length > 0 ? "true" : "false"
      }, existingImages: ${
        existingImages ? JSON.stringify(existingImages) : "null"
      } }`}
    >
      <div
        x-show="hasImages"
        class="border rounded-box p-4 flex flex-wrap gap-4"
      >
        <template x-for="(imageUrl, index) in existingImages">
          <ImageCard />
        </template>
      </div>
      <div x-show="!hasImages || form.images.length === 0" {...fadeTransition}>
        <FileUpload label="Gallery Images" name="form.images" multiple />
      </div>
    </div>
  );
};

export default MultiFileUploader;

const ImageCard = () => (
  <div class="flex flex-col gap-2">
    <img
      x-bind:src="imageUrl"
      alt="Gallery Image"
      class="w-24 h-24 object-cover"
    />
    <button
      type="button"
      class="btn btn-outline btn-sm"
      x-on:click="existingImages.splice(index, 1); form.images = Array.isArray(form.images) ? [...form.images] : (form.images ? [form.images] : [])"
      // x-on:click="existingImages.splice(index, 1) || form.images.splice(index, 1)"
    >
      Remove
    </button>
  </div>
);
