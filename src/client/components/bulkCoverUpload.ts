import Alpine from "alpinejs";

type BookForMatching = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

export function bulkCoverUpload(books: BookForMatching[]) {
  return {
    books,
    bookImages: {} as Record<string, File[]>,
    filePreviews: {} as Record<string, string>,
    uploading: false,

    openFilePicker(bookId: string) {
      const input = document.getElementById(`fileInput-${bookId}`) as HTMLInputElement;
      if (input) input.click();
    },

    handleDrop(event: DragEvent, bookId: string) {
      const files = Array.from(event.dataTransfer?.files || []);
      this.addFiles(bookId, files);
    },

    handleFileInput(event: Event, bookId: string) {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      this.addFiles(bookId, files);
    },

    addFiles(bookId: string, files: File[]) {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const existing = this.bookImages[bookId] || [];
      const combined = [...existing, ...imageFiles];
      const maxImages = 10;

      this.bookImages[bookId] = combined.slice(0, maxImages);

      if (combined.length > maxImages) {
        alert(`Maximum ${maxImages} images per book. Extra images were ignored.`);
      }
    },

    getFilePreview(file: File): string {
      const key = `${file.name}_${file.size}`;
      if (!this.filePreviews[key]) {
        this.filePreviews[key] = URL.createObjectURL(file);
      }
      return this.filePreviews[key];
    },

    removeImage(bookId: string, index: number) {
      if (!this.bookImages[bookId]) return;
      this.bookImages[bookId] = this.bookImages[bookId].filter(
        (_, i) => i !== index,
      );
    },

    clearBook(bookId: string) {
      delete this.bookImages[bookId];
    },

    getTotalImages(): number {
      return Object.values(this.bookImages).reduce(
        (sum, files) => sum + (files?.length || 0),
        0,
      );
    },

    getBooksWithImages(): number {
      return Object.keys(this.bookImages).filter(
        (id) => this.bookImages[id] && this.bookImages[id].length > 0,
      ).length;
    },

    async uploadAll() {
      const booksWithImages = Object.keys(this.bookImages).filter(
        (id) => this.bookImages[id] && this.bookImages[id].length > 0,
      );

      if (booksWithImages.length === 0 || this.uploading) return;

      this.uploading = true;
      const formData = new FormData();

      // Add images for each book
      for (const bookId of booksWithImages) {
        const files = this.bookImages[bookId];
        if (!files || files.length === 0) continue;

        files.forEach((file, index) => {
          formData.append(`book_${bookId}_image_${index}`, file);
        });

        formData.append(
          `book_${bookId}_count`,
          String(files.length),
        );
      }

      formData.append("book_ids", JSON.stringify(booksWithImages));

      try {
        const response = await fetch("/dashboard/books/import/images/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          window.location.href = "/dashboard/books";
        } else {
          alert("Upload failed. Please try again.");
          this.uploading = false;
        }
      } catch (error) {
        console.error(error);
        alert("Upload failed. Please try again.");
        this.uploading = false;
      }
    },
  };
}

Alpine.data("bulkCoverUpload", bulkCoverUpload);
