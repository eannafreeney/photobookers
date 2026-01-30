import Alpine from "alpinejs";

export function registerBookImageForm() {
  Alpine.data(
    "bookImageForm",
    ({ initialUrl }: { initialUrl: string | null }) => {
      return {
        previewUrl: initialUrl || null,
        initialUrl: initialUrl || null,
        selectedFile: null,
        isLoading: false,
        error: null,

        init() {
          // console.log("previewUrl", this.previewUrl);
        },

        onFileChange(e: Event) {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          if (file.size > 2_000_000) {
            this.error = "Max file size is 2MB";
            e.target.value = "";
            return;
          }

          this.selectedFile = file;
          this.previewUrl = URL.createObjectURL(file);
          this.error = null;
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
