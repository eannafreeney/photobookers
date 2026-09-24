import Alpine from "alpinejs";
import { compressImage } from "../../../../../client/utils/imageCompression";

type ImageItem = {
  id: string;
  previewUrl: string;
  file: File;
};

export function registerPrinterGalleryForm() {
  Alpine.data("printerGalleryForm", () => ({
    images: [] as ImageItem[],
    isSubmitting: false,
    isCompressing: false,
    isDragOver: false,
    error: null as string | null,

    async addFiles(files: File[]) {
      if (!files.length) return;
      this.isCompressing = true;
      this.error = null;
      for (const file of files) {
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
      this.isCompressing = false;
    },

    async onFilesChange(e: Event) {
      const input = e.target as HTMLInputElement;
      await this.addFiles(Array.from(input.files || []));
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
      await this.addFiles(
        Array.from(e.dataTransfer?.files || []).filter((file) =>
          file.type.startsWith("image/"),
        ),
      );
    },

    removeImage(index: number) {
      const [removed] = this.images.splice(index, 1);
      if (removed?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
      }
    },

    async submitForm(event: Event) {
      event.preventDefault();
      if (this.images.length === 0) return;
      this.isSubmitting = true;
      this.error = null;
      const formData = new FormData();
      for (const image of this.images) formData.append("images", image.file);
      try {
        const response = await fetch((event.target as HTMLFormElement).action, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          this.error = "Failed to save images";
          this.isSubmitting = false;
          return;
        }
        window.location.reload();
      } catch {
        this.error = "Failed to save images";
        this.isSubmitting = false;
      }
    },
  }));
}
