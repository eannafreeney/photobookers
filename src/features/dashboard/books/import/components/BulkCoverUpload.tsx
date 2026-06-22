import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Card from "../../../../../components/app/Card";
import type { BookForMatching } from "../matchCovers";

type Props = {
  books: BookForMatching[];
};

const BulkCoverUpload = ({ books }: Props) => {
  const alpineAttrs = {
    "x-data": `bulkCoverUpload(${JSON.stringify(books)})`,
    "x-init": "init()",
  };

  const dropzoneAttrs = {
    "x-on:drop.prevent": "(e) => handleDrop(e, book.id)",
    "x-on:dragover.prevent": "",
  };

  return (
    <div class="flex flex-col gap-8" {...alpineAttrs}>
      <div class="space-y-4">
        <SectionTitle>Upload covers and gallery images</SectionTitle>
        <p class="text-on-surface-weak">
          Drop images for each book below. The first image will be the cover,
          additional images become gallery images (max 10 images per book).
        </p>
      </div>

      <div class="space-y-6">
        <template x-for="(book, index) in books" x-bind:key="book.id">
          <Card>
            <Card.Body>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium" x-text="book.title"></h3>
                  <span
                    class="text-sm"
                    x-show="bookImages[book.id] && bookImages[book.id].length > 0"
                  >
                    <span x-text="bookImages[book.id].length"></span> image
                    <span x-show="bookImages[book.id].length !== 1">s</span>
                  </span>
                </div>

                <div
                  class="border-2 border-dashed border-outline rounded-radius p-8 text-center cursor-pointer hover:border-primary hover:bg-surface-alt/50 transition-colors"
                  x-on:click="openFilePicker(book.id)"
                  {...dropzoneAttrs}
                  x-show="!bookImages[book.id] || bookImages[book.id].length === 0"
                >
                  <p class="text-on-surface-strong mb-1">
                    Drop images here or click to browse
                  </p>
                  <p class="text-sm text-on-surface-weak">
                    First image = cover, rest = gallery (max 10)
                  </p>
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  class="hidden"
                  x-bind:id="'fileInput-' + book.id"
                  x-on:change="handleFileInput($event, book.id)"
                />

                <div
                  x-show="bookImages[book.id] && bookImages[book.id].length > 0"
                  class="space-y-2"
                >
                  <div class="grid grid-cols-4 gap-2">
                    <template
                      x-for="(file, i) in bookImages[book.id]"
                      x-bind:key="i"
                    >
                      <div class="relative group">
                        <img
                          x-bind:src="getFilePreview(file)"
                          x-bind:alt="file.name"
                          class="w-full aspect-square object-cover rounded border"
                        />
                        <div
                          x-show="i === 0"
                          class="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded"
                        >
                          Cover
                        </div>
                        <button
                          type="button"
                          x-on:click="removeImage(book.id, i)"
                          class="absolute top-1 right-1 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    </template>
                  </div>
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      color="inverse"
                      size="sm"
                      x-on:click="openFilePicker(book.id)"
                    >
                      Add more images
                    </Button>
                    <Button
                      variant="outline"
                      color="danger"
                      size="sm"
                      x-on:click="clearBook(book.id)"
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </template>
      </div>

      <div class="flex gap-4 sticky bottom-4 bg-surface border-t border-outline pt-4 -mx-4 px-4">
        <Button
          variant="solid"
          color="primary"
          x-on:click="uploadAll()"
          x-bind:disabled="uploading || getTotalImages() === 0"
        >
          <span x-show="!uploading">
            Upload <span x-text="getTotalImages()"></span> image
            <span x-show="getTotalImages() !== 1">s</span> for{" "}
            <span x-text="getBooksWithImages()"></span> book
            <span x-show="getBooksWithImages() !== 1">s</span>
          </span>
          <span x-show="uploading">Uploading...</span>
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" color="inverse" x-bind:disabled="uploading">
            Skip for now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BulkCoverUpload;
