import Alpine from "alpinejs";
import { compressImage } from "../utils/imageCompression";

export function registerCreatorCoverForm() {
  Alpine.data(
    "creatorCoverForm",
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

          this.previewUrl = URL.createObjectURL(file);
          this.error = null;
          this.isCompressing = true;

          try {
            const compressed = await compressImage(file, "profile");
            this.selectedFile = compressed;

            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = URL.createObjectURL(compressed);
          } catch (err) {
            this.error = "Failed to process image";
            this.selectedFile = file;
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

        },

        onError() {
          this.isSubmitting = false;
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
          this.isSubmitting = true;
          this.error = null;

          const formData = new FormData();
          formData.append("cover", this.selectedFile);

          try {
            await fetch((event.target as HTMLFormElement).action, {
              method: "POST",
              body: formData,
            });
            this.isSubmitting = false;
          } catch (err) {
            this.error = "Failed to save image";
            this.isSubmitting = false;
          }
        },
      };
    }
  );
}
