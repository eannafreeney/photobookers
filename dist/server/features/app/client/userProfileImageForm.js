import Alpine from "alpinejs";
import { compressImage } from "../../../client/utils/imageCompression.js";
function registerUserProfileImageForm() {
  Alpine.data(
    "userProfileImageForm",
    ({ initialUrl }) => {
      return {
        previewUrl: initialUrl || null,
        initialUrl: initialUrl || null,
        selectedFile: null,
        isSubmitting: false,
        isCompressing: false,
        error: null,
        async onFileChange(e) {
          const file = e.target.files?.[0];
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
          this.error = "Failed to save profile image";
          this.previewUrl = this.initialUrl;
        },
        cancelSelection() {
          this.previewUrl = this.initialUrl;
          this.error = null;
        },
        async submitForm(event) {
          event.preventDefault();
          this.isSubmitting = true;
          this.error = null;
          const formData = new FormData();
          if (this.selectedFile) {
            formData.append("userImageProfile", this.selectedFile);
          }
          try {
            await fetch(event.target.action, {
              method: "POST",
              body: formData
            });
            this.isSubmitting = false;
          } catch (err) {
            console.error("Failed to save profile image", err);
            this.error = "Failed to save image";
            this.isSubmitting = false;
          }
        }
      };
    }
  );
}
export {
  registerUserProfileImageForm
};
