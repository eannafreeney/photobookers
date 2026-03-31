import Alpine from "alpinejs";
import { compressImage } from "../../../../client/utils/imageCompression";

export function registerBookCoverForm() {
  Alpine.data(
    "bookCoverForm",
    ({ initialUrl }: { initialUrl: string | null }) => {
      return {
        previewUrl: initialUrl || null,
        initialUrl: initialUrl || null,
        selectedFile: null as File | null,
        isSubmitting: false,
        isCompressing: false,
        error: null as string | null,
        isDragOver: false,

        async processFile(file: File) {
          if (!file) return;
          this.previewUrl = URL.createObjectURL(file);
          this.error = null;
          this.isCompressing = true;
          try {
            const compressed = await compressImage(file, "cover");
            this.selectedFile = compressed;
            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = URL.createObjectURL(compressed);
            // ensure dropped file is what gets submitted
            const dt = new DataTransfer();
            dt.items.add(compressed);
            if (this.$refs.fileInput) {
              (this.$refs.fileInput as HTMLInputElement).files = dt.files;
            }
          } catch {
            this.error = "Failed to process image";
            this.selectedFile = file;
          } finally {
            this.isCompressing = false;
          }
        },

        async onFileChange(e: Event) {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;
          await this.processFile(file);
          // const file = (e.target as HTMLInputElement).files?.[0];
          // if (!file) return;

          // // Show preview immediately with original
          // this.previewUrl = URL.createObjectURL(file);
          // this.error = null;
          // this.isCompressing = true;

          // try {
          //   // Compress the image
          //   const compressed = await compressImage(file, "cover");
          //   this.selectedFile = compressed;

          //   // Update preview with compressed version
          //   URL.revokeObjectURL(this.previewUrl);
          //   this.previewUrl = URL.createObjectURL(compressed);
          // } catch (err) {
          //   this.error = "Failed to process image";
          //   this.selectedFile = file; // Fallback to original
          // } finally {
          //   this.isCompressing = false;
          // }
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
          const file = Array.from(e.dataTransfer?.files || []).find((f) =>
            f.type.startsWith("image/"),
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
          this.initialUrl = this.previewUrl; // Mark current state as "saved"
        },

        onError() {
          this.isSubmitting = false;
          this.previewUrl = null;
        },

        cancelSelection() {
          this.previewUrl = this.initialUrl;
          this.error = null;
        },
      };
    },
  );
}
