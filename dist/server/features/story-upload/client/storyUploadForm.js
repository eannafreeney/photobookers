import Alpine from "alpinejs";
import { compressImage } from "../../../client/utils/imageCompression.js";
function registerStoryUploadForm() {
  Alpine.data("storyUploadForm", () => {
    return {
      previewUrl: null,
      selectedFile: null,
      isSubmitting: false,
      isCompressing: false,
      error: null,
      isDragOver: false,
      async processFile(file) {
        if (!file) return;
        this.previewUrl = URL.createObjectURL(file);
        this.error = null;
        this.isCompressing = true;
        try {
          const compressed = await compressImage(file, "cover");
          this.selectedFile = compressed;
          URL.revokeObjectURL(this.previewUrl);
          this.previewUrl = URL.createObjectURL(compressed);
          const dt = new DataTransfer();
          dt.items.add(compressed);
          if (this.$refs.fileInput) {
            this.$refs.fileInput.files = dt.files;
          }
        } catch {
          this.error = "Failed to process image";
          this.selectedFile = file;
        } finally {
          this.isCompressing = false;
        }
      },
      async onFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        await this.processFile(file);
      },
      onDragEnter(e) {
        e.preventDefault();
        this.isDragOver = true;
      },
      onDragOver(e) {
        e.preventDefault();
        this.isDragOver = true;
      },
      onDragLeave(e) {
        e.preventDefault();
        const related = e.relatedTarget;
        if (!related || !this.$el.contains(related)) {
          this.isDragOver = false;
        }
      },
      async onDrop(e) {
        e.preventDefault();
        this.isDragOver = false;
        const file = Array.from(e.dataTransfer?.files || []).find(
          (f) => f.type.startsWith("image/")
        );
        if (!file) {
          this.error = "Please drop an image file";
          return;
        }
        await this.processFile(file);
      },
      onBefore() {
        this.isSubmitting = true;
        this.error = null;
      },
      onSuccess() {
        this.isSubmitting = false;
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
        this.selectedFile = null;
        this.error = null;
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
      },
      onError() {
        this.isSubmitting = false;
      }
    };
  });
}
export {
  registerStoryUploadForm
};
