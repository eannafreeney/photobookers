import Alpine from "alpinejs";
import { compressImage } from "../utils/imageCompression";

export function registerBookImageForm() {
  Alpine.data(
    "bookImageForm",
    ({ initialUrl }: { initialUrl: string | null }) => {
      return {
        previewUrl: initialUrl || null,
        initialUrl: initialUrl || null,
        selectedFile: null,
        isLoading: false,
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
          this.isLoading = true;
          this.error = null;
        },

        onSuccess(event) {
          this.isLoading = false;

          console.log(event, "event");

          const data = event.detail.response;
          console.log(data, "data");
        },

        onError() {
          this.isLoading = false;
          this.error = "Failed to save cover";

          // rollback optimistic UI
          this.previewUrl = this.previousUrl;
        },

        cancelSelection() {
          // Revert to the original saved image
          this.previewUrl = this.initialUrl;
          this.error = null;
        },
        async submitForm(event: Event) {
          event.preventDefault();
          this.isLoading = true;
          this.error = null;

          const formData = new FormData();
          formData.append("cover", this.selectedFile);

          try {
            await fetch(event.target.action, {
              method: "POST",
              body: formData,
            });

            this.isLoading = false;
          } catch (err) {
            this.error = "Failed to save image";
            this.isLoading = false;
          }
        },
      };
    }
  );
}
