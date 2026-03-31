import Alpine from "alpinejs";
import { compressImage } from "../../../../client/utils/imageCompression";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../../../../constants/images";

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
        isSubmitting: false,
        previewImage: null as string | null,
        isCompressing: false,
        isDragOver: false,
        error: null as string | null,
        maxImages: MAX_GALLERY_IMAGES_PER_BOOK,
        dragIndex: null as number | null,
        dragOverIndex: null as number | null,

        init() {
          const imgs = initialImages ?? [];
          this.initialImages = imgs.map((img) => ({
            id: img.id,
            previewUrl: img.url,
          }));
          this.images = [...this.initialImages];
        },

        get hasChanges() {
          if (this.removedIds.length > 0) return true;
          if (this.images.some((img) => img.file)) return true;
          const initialOrder = this.initialImages
            .map((img) => img.id)
            .join(",");
          const currentOrder = this.images
            .filter((img) => !img.file) // existing images only
            .map((img) => img.id)
            .join(",");
          return initialOrder !== currentOrder;
        },

        async addFiles(files: File[]) {
          if (!files.length) return;

          this.isCompressing = true;
          this.error = null;

          const availableSlots = this.maxImages - this.images.length;
          const filesToProcess = files.slice(0, Math.max(availableSlots, 0));

          for (const file of filesToProcess) {
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

          if (files.length > filesToProcess.length) {
            this.error = `Maximum ${this.maxImages} images allowed. Extra files were not added.`;
          }

          if (this.images.length > this.maxImages) {
            this.images = this.images.slice(0, this.maxImages);
            this.error = `Maximum ${this.maxImages} images allowed. Extra files were not added.`;
          }

          this.isCompressing = false;
        },

        async onFilesChange(e: Event) {
          const input = e.target as HTMLInputElement;
          const files = Array.from(input.files || []);
          await this.addFiles(files);
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
          const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
            f.type.startsWith("image/"),
          );
          await this.addFiles(files);
        },

        onReorderDragStart(index: number) {
          this.dragIndex = index;
          this.dragOverIndex = index;
        },

        onReorderDragEnter(hoverIndex: number) {
          if (this.dragIndex == null) return;
          if (hoverIndex === this.dragIndex) return;
          const [moved] = this.images.splice(this.dragIndex, 1);
          this.images.splice(hoverIndex, 0, moved);
          // important: update drag index to new position
          this.dragIndex = hoverIndex;
          this.dragOverIndex = hoverIndex;
        },

        onReorderDragEnd() {
          this.dragIndex = null;
          this.dragOverIndex = null;
        },

        onReorderDrop(dropIndex: number) {
          if (this.dragIndex == null || this.dragIndex === dropIndex) return;
          const [moved] = this.images.splice(this.dragIndex, 1);
          this.images.splice(dropIndex, 0, moved);
          this.dragIndex = null;
        },

        removeImage(index: number) {
          const removedImage = this.images.splice(index, 1)[0];
          if (!removedImage) return;

          if (!removedImage.file) {
            this.removedIds.push(removedImage.id);
          }

          if (removedImage.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(removedImage.previewUrl);
          }
        },

        reset() {
          this.images.forEach((img) => {
            if (img.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(img.previewUrl);
            }
          });

          this.images = [...this.initialImages];
          this.removedIds = [];
          this.error = null;
          this.isDragOver = false;
        },

        onBefore() {
          this.isSubmitting = true;
          this.error = null;
        },

        onSuccess() {
          this.isSubmitting = false;

          this.initialImages = this.images
            .filter((img) => !img.file)
            .map((img) => ({ id: img.id, previewUrl: img.previewUrl }));

          this.removedIds = [];
          this.images = this.images.map((img) => {
            if (img.file) return { id: img.id, previewUrl: img.previewUrl };
            return img;
          });
        },

        onError() {
          this.isSubmitting = false;
          this.error = "Failed to save images";
        },

        async submitForm(event: Event) {
          event.preventDefault();
          this.isSubmitting = true;
          this.error = null;

          const formData = new FormData();

          for (const img of this.images) {
            if (img.file) {
              formData.append("images", img.file);
            }
          }

          formData.append("removedIds", JSON.stringify(this.removedIds));

          const orderedIds = this.images
            .filter((img) => !img.file) // existing db rows only
            .map((img) => img.id);
          formData.append("orderedIds", JSON.stringify(orderedIds));

          try {
            const response = await fetch(
              (event.target as HTMLFormElement).action,
              {
                method: "POST",
                body: formData,
              },
            );

            const html = await response.text();

            if (!response.ok) {
              this.error = "Failed to save images";
              this.isSubmitting = false;
            }

            const container = document.getElementById("toast");
            if (container) {
              container.outerHTML = html;
            }

            if (response.ok) {
              this.initialImages = this.images
                .filter((img) => !img.file)
                .map((img) => ({ id: img.id, previewUrl: img.previewUrl }));

              this.removedIds = [];
              this.images = this.images.map((img) => {
                if (img.file) return { id: img.id, previewUrl: img.previewUrl };
                return img;
              });
            }

            this.isSubmitting = false;
          } catch {
            this.error = "Failed to save images";
            this.isSubmitting = false;
          }
        },
      };
    },
  );
}
