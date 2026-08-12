import Button from "../../../components/app/Button";
import FileUploadInput from "../../../components/forms/FileUpload";
import FormPost from "../../../components/forms/FormPost";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea";
import { MAX_STORE_GALLERY_IMAGES } from "../../../constants/images";

type Props = {
  token: string;
  storeName: string;
};

const StoreUploadForm = ({ token, storeName }: Props) => {
  const alpineAttrs = {
    "x-data": `storeUploadForm({ maxImages: ${MAX_STORE_GALLERY_IMAGES} })`,
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <FormPost
      id="store-upload-form"
      action={`/store-upload/${token}`}
      enctype="multipart/form-data"
      {...alpineAttrs}
    >
      <div class="space-y-8">
        <section class="space-y-3">
          <h2 class="text-lg font-semibold text-on-surface-strong">
            Banner (optional)
          </h2>
          <p class="text-sm text-on-surface/80">
            Wide image for the top of the {storeName} page (roughly 16:9).
          </p>
          <div
            class="relative w-full overflow-hidden rounded-lg bg-gray-100"
            style="aspect-ratio: 16/9;"
            x-show="bannerPreviewUrl"
            x-cloak
          >
            <img
              x-bind:src="bannerPreviewUrl"
              alt="Banner preview"
              class="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              class="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
              x-on:click="clearBanner()"
            >
              Remove
            </button>
          </div>
          <div
            x-show="!bannerPreviewUrl"
            {...{
              "@dragenter.prevent": "onBannerDragEnter($event)",
              "@dragover.prevent": "onBannerDragOver($event)",
              "@dragleave.prevent": "onBannerDragLeave($event)",
              "@drop.prevent": "onBannerDrop($event)",
              "@click": "$refs.bannerInput.click()",
              ":class":
                "bannerDragOver ? 'border-success bg-success/5' : 'border-outline'",
            }}
            class="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition"
          >
            <p class="text-sm text-on-surface/80">
              Drag and drop or click to add a banner
            </p>
            <p class="mt-1 text-xs text-on-surface/80">PNG, JPG, WebP — Max 5MB</p>
          </div>
          <FileUploadInput
            label="Banner image"
            name="banner"
            x-on:change="onBannerChange"
            x-ref="bannerInput"
          />
        </section>

        <section class="space-y-3">
          <h2 class="text-lg font-semibold text-on-surface-strong">
            Shop photos (1–{MAX_STORE_GALLERY_IMAGES})
          </h2>
          <p class="text-sm text-on-surface/80">
            Upload between 1 and {MAX_STORE_GALLERY_IMAGES} photos. Submitting
            replaces any photos currently on your page.
          </p>
          <div
            class="grid grid-cols-2 gap-3 sm:grid-cols-3"
            x-show="images.length > 0"
            x-cloak
          >
            <template x-for="(img, index) in images" x-bind:key="img.id">
              <div class="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  x-bind:src="img.previewUrl"
                  alt=""
                  class="h-full w-full object-cover"
                />
                <button
                  type="button"
                  class="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white"
                  x-on:click="removeImage(index)"
                >
                  Remove
                </button>
              </div>
            </template>
          </div>
          <div x-show={`images.length < ${MAX_STORE_GALLERY_IMAGES}`}>
            <DragAndDropArea prompt="Drag and drop or click to add shop photos." />
          </div>
          <FileUploadInput
            label="Shop photos"
            name="images"
            multiple
            x-on:change="onFilesChange"
            x-ref="fileInput"
          />
          <p x-show="isCompressing" class="text-sm text-gray-500">
            Compressing images…
          </p>
          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
        </section>

        <div class="flex gap-2">
          <Button
            variant="solid"
            color="primary"
            x-bind:disabled="isSubmitting || isCompressing || !canSubmit"
          >
            <span x-show="!isSubmitting">Upload photos</span>
            <span x-show="isSubmitting">Uploading…</span>
          </Button>
        </div>
      </div>
    </FormPost>
  );
};

export default StoreUploadForm;
