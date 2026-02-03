import Alpine from "alpinejs";
import { compressImage } from "../utils/imageCompression";

export function registerBookCoverForm() {
  Alpine.data(
    "bookCoverForm",
    ({ initialUrl }: { initialUrl: string | null }) => {
      return {
        previewUrl: initialUrl || null,
        initialUrl: initialUrl || null,
        selectedFile: null,
        isSubmitting: false,
        isCompressing: false,
        error: null,

        async onFileChange(e: Event) {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          // Show preview immediately with original
          this.previewUrl = URL.createObjectURL(file);
          this.error = null;
          this.isCompressing = true;

          try {
            // Compress the image
            const compressed = await compressImage(file, "cover");
            this.selectedFile = compressed;

            // Update preview with compressed version
            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = URL.createObjectURL(compressed);
          } catch (err) {
            this.error = "Failed to process image";
            this.selectedFile = file; // Fallback to original
          } finally {
            this.isCompressing = false;
          }
        },

        onBefore() {
          this.isSubmitting = true;
          this.error = null;
        },

        onSuccess() {
          this.isSubmitting = false;
          this.initialUrl = this.previewUrl;  // Mark current state as "saved"

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
    }
  );
}
