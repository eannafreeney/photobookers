import Modal from "../../../../../components/app/Modal";
import FormPost from "../../../../../components/forms/FormPost";
import { toDateString } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import {
  collectBookImageOptions,
  collectCreatorImageOptions,
} from "../social-media/instagramCaption";
import type {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "../services";
import {
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
} from "../social-media/instagramUtils";
import { formatDayLabel } from "../utils";

type Props = {
  week: string;
  entries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  artistBookCoverUrls?: string[];
  publisherBookCoverUrls?: string[];
};

const FeaturedHeroImagesModal = ({
  week,
  entries,
  artistOfTheWeek,
  publisherOfTheWeek,
  artistBookCoverUrls = [],
  publisherBookCoverUrls = [],
}: Props) => {
  const saveAlpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
  };

  const hasContent =
    entries.length > 0 || artistOfTheWeek || publisherOfTheWeek;

  const artistCreator = artistOfTheWeek?.creator ?? null;
  const publisherCreator = publisherOfTheWeek?.creator ?? null;

  if (!hasContent) {
    return (
      <Modal title={`Featured hero images – week ${week}`} maxWidth="max-w-2xl">
        <p class="text-sm text-on-surface">
          Schedule books of the day, artist of the week, or publisher of the
          week before choosing featured hero images.
        </p>
      </Modal>
    );
  }

  return (
    <Modal title={`Featured hero images – week ${week}`} maxWidth="max-w-2xl">
      <div>
        <p class="mb-4 text-sm text-on-surface">
          These images appear in the featured page hero carousel and on
          spotlight pages. Instagram posts use the same featured image when
          prepared.
        </p>
        <FormPost
          action={`/dashboard/admin/planner/featured-hero/${week}/prepare`}
          {...saveAlpineAttrs}
        >
          <input type="hidden" name="week" value={week} />
          <div class="max-h-[min(55vh,calc(100dvh-12rem))] space-y-6 overflow-y-auto overscroll-contain pr-1">
            {entries.map((entry) => {
              const dateKey = toDateString(entry.date);
              const book = entry.book;
              if (!book) return null;

              const imageOptions = collectBookImageOptions(book);
              const selectedImage =
                entry.featuredImageUrl ?? imageOptions[0] ?? "";

              return (
                <HeroImageSection
                  key={entry.id}
                  title={formatDayLabel(entry.date)}
                  subtitle={book.title}
                  fieldKey={dateKey}
                  imageOptions={imageOptions}
                  selectedImage={selectedImage}
                />
              );
            })}

            {artistCreator && artistOfTheWeek ? (
              <HeroImageSection
                key="aotw"
                title="Artist of the week"
                subtitle={artistCreator.displayName}
                fieldKey={INSTAGRAM_SPOTLIGHT_AOTW_KEY}
                imageOptions={collectCreatorImageOptions(
                  artistCreator,
                  artistBookCoverUrls,
                )}
                selectedImage={
                  artistOfTheWeek.featuredImageUrl ??
                  collectCreatorImageOptions(
                    artistCreator,
                    artistBookCoverUrls,
                  )[0] ??
                  ""
                }
              />
            ) : null}

            {publisherCreator && publisherOfTheWeek ? (
              <HeroImageSection
                key="potw"
                title="Publisher of the week"
                subtitle={publisherCreator.displayName}
                fieldKey={INSTAGRAM_SPOTLIGHT_POTW_KEY}
                imageOptions={collectCreatorImageOptions(
                  publisherCreator,
                  publisherBookCoverUrls,
                )}
                selectedImage={
                  publisherOfTheWeek.featuredImageUrl ??
                  collectCreatorImageOptions(
                    publisherCreator,
                    publisherBookCoverUrls,
                  )[0] ??
                  ""
                }
              />
            ) : null}
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-outline pt-4">
            <button
              type="submit"
              class="rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer"
            >
              Save
            </button>
          </div>
        </FormPost>
      </div>
    </Modal>
  );
};

export default FeaturedHeroImagesModal;

type HeroImageSectionProps = {
  title: string;
  subtitle: string;
  fieldKey: string;
  imageOptions: string[];
  selectedImage: string;
};

const HeroImageSection = ({
  title,
  subtitle,
  fieldKey,
  imageOptions,
  selectedImage,
}: HeroImageSectionProps) => (
  <section class="rounded border border-outline bg-surface-alt/40 p-4">
    <h3 class="mb-1 text-sm font-semibold text-on-surface-strong">{title}</h3>
    <p class="mb-3 text-xs text-on-surface line-clamp-2">{subtitle}</p>

    <fieldset>
      <legend class="mb-2 block text-xs font-medium text-on-surface">
        Image
      </legend>
      {imageOptions.length === 0 ? (
        <p class="text-xs text-danger">No image available.</p>
      ) : (
        <div class="max-h-48 overflow-y-auto overscroll-contain rounded border border-outline/60 bg-surface p-2">
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imageOptions.map((url) => (
              <label
                key={url}
                class="cursor-pointer rounded border border-outline p-1 [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary"
              >
                <input
                  type="radio"
                  name={`imageUrl[${fieldKey}]`}
                  value={url}
                  required
                  checked={url === selectedImage}
                  class="sr-only"
                />
                <img
                  src={url}
                  alt=""
                  class="aspect-[3/4] w-full rounded object-cover"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </fieldset>
  </section>
);
