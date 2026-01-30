import Alpine from "alpinejs";

type ImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
};

export function registerBookGalleryForm() {
  Alpine.data(
    "bookGalleryForm",
    ({ initialImages }: { initialImages: { id: string; url: string }[] }) => {
      return {
        images: [] as ImageItem[],
        initialImages: [] as ImageItem[],
        removedIds: [] as string[],
        isLoading: false,
        previewImage: null,
        error: null as string | null,

        init() {
          const imgs = initialImages ?? [];
          // Convert initial URLs to image items
          this.initialImages = imgs.map((img, i) => ({
            id: img.id,
            previewUrl: img.url,
          }));
          this.images = [...this.initialImages];
        },

        get hasChanges() {
          // Check if any images were removed
          if (this.removedIds.length > 0) return true;
          // Check if any new images were added
          if (this.images.some((img) => img.file)) return true;
          return false;
        },

        onFilesChange(e: Event) {
          const input = e.target as HTMLInputElement;
          const files = Array.from(input.files || []);

          for (const file of files) {
            if (file.size > 2_000_000) {
              this.error = `"${file.name}" exceeds 2MB limit`;
              continue;
            }

            this.images.push({
              id: `new-${Date.now()}-${Math.random()}`,
              previewUrl: URL.createObjectURL(file),
              file,
            });
          }

          // Clear input so same files can be selected again
          input.value = "";
          if (files.length > 0 && !this.error) {
            this.error = null;
          }
        },

        removeImage(index: number) {
          const removedImage = this.images.splice(index, 1)[0];
          if (!removedImage.file) {
            this.removedIds.push(removedImage.id);
          }

          // Revoke blob URL for new images to free memory
          if (removedImage.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(removedImage.previewUrl);
          }
        },

        reset() {
          // Revoke all new image URLs
          this.images.forEach((img) => {
            if (img.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(img.previewUrl);
            }
          });

          this.images = [...this.initialImages];
          this.removedIds = [];
          this.error = null;
        },

        onBefore() {
          this.isLoading = true;
          this.error = null;
        },

        onSuccess(event: CustomEvent) {
          this.isLoading = false;
          // Update initialImages with response if backend returns new URLs
          // this.initialImages = [...this.images];
          this.removedIds = [];
        },

        onError() {
          this.isLoading = false;
          this.error = "Failed to save images";
        },

        async submitForm(event: Event) {
          event.preventDefault();
          this.isLoading = true;
          this.error = null;

          const formData = new FormData();

          // Append all files from the images array
          for (const img of this.images) {
            if (img.file) {
              formData.append("images", img.file);
            }
          }

          // Append removed IDs
          formData.append("removedIds", JSON.stringify(this.removedIds));

          try {
            const response = await fetch(event.target.action, {
              method: "POST",
              body: formData,
            });

            const html = await response.text();

            const container = document.getElementById("notification-message");
            if (container) {
              container.outerHTML = html;
            }

            this.isLoading = false;
          } catch (err) {
            this.error = "Failed to save images";
            this.isLoading = false;
          }
        },
      };
    }
  );
}
