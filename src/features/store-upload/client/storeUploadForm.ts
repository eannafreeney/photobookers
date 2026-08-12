import Alpine from "alpinejs";
import { compressImage } from "../../../client/utils/imageCompression";
import { MAX_STORE_GALLERY_IMAGES } from "../../../constants/images";

type ImageItem = {
  id: string;
  previewUrl: string;
  file: File;
};

type InitArgs = {
  maxImages?: number;
};

export function registerStoreUploadForm() {
  Alpine.data("storeUploadForm", (args: InitArgs = {}) => {
    const maxImages = args.maxImages ?? MAX_STORE_GALLERY_IMAGES;
    return {
      images: [] as ImageItem[],
      bannerFile: null as File | null,
      bannerPreviewUrl: null as string | null,
      isSubmitting: false,
      isCompressing: false,
      error: null as string | null,
      isDragOver: false,
      bannerDragOver: false,
      maxImages,

      get canSubmit() {
        return this.images.length >= 1 && this.images.length <= this.maxImages;
      },

      async processBanner(file: File) {
        this.isCompressing = true;
        this.error = null;
        try {
          const compressed = await compressImage(file, "cover");
          this.bannerFile = compressed;
          if (this.bannerPreviewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(this.bannerPreviewUrl);
          }
          this.bannerPreviewUrl = URL.createObjectURL(compressed);
          const dt = new DataTransfer();
          dt.items.add(compressed);
          if (this.$refs.bannerInput) {
            (this.$refs.bannerInput as HTMLInputElement).files = dt.files;
          }
        } catch {
          this.error = "Failed to process banner image";
        } finally {
          this.isCompressing = false;
        }
      },

      clearBanner() {
        if (this.bannerPreviewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(this.bannerPreviewUrl);
        }
        this.bannerFile = null;
        this.bannerPreviewUrl = null;
        if (this.$refs.bannerInput) {
          (this.$refs.bannerInput as HTMLInputElement).value = "";
        }
      },

      async onBannerChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        await this.processBanner(file);
      },

      onBannerDragEnter(e: DragEvent) {
        e.preventDefault();
        this.bannerDragOver = true;
      },

      onBannerDragOver(e: DragEvent) {
        e.preventDefault();
        this.bannerDragOver = true;
      },

      onBannerDragLeave(e: DragEvent) {
        e.preventDefault();
        const related = e.relatedTarget as Node | null;
        if (!related || !(this.$el as HTMLElement).contains(related)) {
          this.bannerDragOver = false;
        }
      },

      async onBannerDrop(e: DragEvent) {
        e.preventDefault();
        this.bannerDragOver = false;
        const file = Array.from(e.dataTransfer?.files || []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!file) {
          this.error = "Please drop an image file";
          return;
        }
        await this.processBanner(file);
      },

      async addFiles(files: File[]) {
        if (!files.length) return;
        this.isCompressing = true;
        this.error = null;

        const availableSlots = this.maxImages - this.images.length;
        const filesToProcess = files.slice(0, Math.max(availableSlots, 0));

        for (const file of filesToProcess) {
          if (!file.type.startsWith("image/")) continue;
          try {
            const compressed = await compressImage(file, "gallery");
            this.images.push({
              id: `new-${Date.now()}-${Math.random()}`,
              previewUrl: URL.createObjectURL(compressed),
              file: compressed,
            });
          } catch {
            this.error = `Failed to process "${file.name}"`;
          }
        }

        if (files.length > filesToProcess.length) {
          this.error = `Maximum ${this.maxImages} images allowed. Extra files were not added.`;
        }

        this.isCompressing = false;
      },

      async onFilesChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        await this.addFiles(files);
        input.value = "";
      },

      onDragEnter(e: DragEvent) {
        e.preventDefault();
        this.isDragOver = true;
      },

      onDragOver(e: DragEvent) {
        e.preventDefault();
        this.isDragOver = true;
      },

      onDragLeave(e: DragEvent) {
        e.preventDefault();
        const related = e.relatedTarget as Node | null;
        if (!related || !(this.$el as HTMLElement).contains(related)) {
          this.isDragOver = false;
        }
      },

      async onDrop(e: DragEvent) {
        e.preventDefault();
        this.isDragOver = false;
        const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
          f.type.startsWith("image/"),
        );
        await this.addFiles(files);
      },

      removeImage(index: number) {
        const removed = this.images.splice(index, 1)[0];
        if (removed?.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(removed.previewUrl);
        }
      },

      async submitForm(event: Event) {
        event.preventDefault();
        if (!this.canSubmit) {
          this.error = `Add between 1 and ${this.maxImages} shop photos`;
          return;
        }

        this.isSubmitting = true;
        this.error = null;

        const formData = new FormData();
        if (this.bannerFile) formData.append("banner", this.bannerFile);
        for (const img of this.images) {
          formData.append("images", img.file);
        }

        try {
          const response = await fetch(
            (event.target as HTMLFormElement).action,
            { method: "POST", body: formData },
          );
          const html = await response.text();
          const container = document.getElementById("toast");
          if (container) container.outerHTML = html;

          if (!response.ok) {
            this.error = "Upload failed — please try again";
            this.isSubmitting = false;
            return;
          }

          this.isSubmitting = false;
        } catch {
          this.error = "Upload failed — please try again";
          this.isSubmitting = false;
        }
      },
    };
  });
}
