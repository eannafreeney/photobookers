import Alpine from "alpinejs";

export function registerCreatorImageForm() {
  Alpine.data(
    "creatorImageForm",
    ({ initialUrl }: { initialUrl: string | null }) => {
      return {
        previewUrl: initialUrl || null,
        initialUrl: initialUrl || null,
        isSubmitting: false,
        error: null,

        onFileChange(e: Event) {
          const file = e.target.files[0];
          if (!file) return;

          if (file.size > 2_000_000) {
            this.error = "Max file size is 2MB";
            e.target.value = "";
            return;
          }

          this.previewUrl = URL.createObjectURL(file);
          this.error = null;
        },

        onBefore() {
          this.isSubmitting = true;
          this.error = null;
        },

        onSuccess(event) {
          this.isSubmitting = false;

          // backend should return the new cover_url
          const data = event.detail.response;
        },

        onError(event) {
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
      };
    }
  );
}
