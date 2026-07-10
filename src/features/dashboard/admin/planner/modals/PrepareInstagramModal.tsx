import Modal from "../../../../../components/app/Modal";
import FormPost from "../../../../../components/forms/FormPost";
import { toDateString } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import {
  buildArtistInstagramCaption,
  buildBotdInstagramCaption,
  buildPublisherInstagramCaption,
  collectBookImageOptions,
  collectCreatorImageOptions,
  formatInstagramHashtags,
} from "../instagramCaption";
import type {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "../services";
import {
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  MAX_INSTAGRAM_CAROUSEL_IMAGES,
  getPlannerInstagramImageSelection,
} from "../instagramUtils";
import { formatDayLabel } from "../utils";

type Props = {
  week: string;
  entries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  artistBookCoverUrls?: string[];
  publisherBookCoverUrls?: string[];
};

const PrepareInstagramModal = ({
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

  const hasBotdPlan = entries.some(
    (entry) =>
      entry.instagramPreparedAt ||
      entry.instagramQueuedAt ||
      entry.instagramCaption ||
      entry.featuredImageUrl ||
      (entry.instagramImageUrls?.length ?? 0) > 0,
  );
  const hasArtistPlan = Boolean(
    artistOfTheWeek &&
    (artistOfTheWeek.instagramPreparedAt ||
      artistOfTheWeek.instagramQueuedAt ||
      artistOfTheWeek.instagramCaption ||
      artistOfTheWeek.featuredImageUrl ||
      (artistOfTheWeek.instagramImageUrls?.length ?? 0) > 0),
  );
  const hasPublisherPlan = Boolean(
    publisherOfTheWeek &&
    (publisherOfTheWeek.instagramPreparedAt ||
      publisherOfTheWeek.instagramQueuedAt ||
      publisherOfTheWeek.instagramCaption ||
      publisherOfTheWeek.featuredImageUrl ||
      (publisherOfTheWeek.instagramImageUrls?.length ?? 0) > 0),
  );
  const hasInstagramPlan = hasBotdPlan || hasArtistPlan || hasPublisherPlan;
  const hasQueuedToBuffer =
    entries.some(
      (entry) => entry.instagramQueuedAt || entry.instagramStoryQueuedAt,
    ) ||
    Boolean(artistOfTheWeek?.instagramQueuedAt) ||
    Boolean(artistOfTheWeek?.instagramStoryQueuedAt) ||
    Boolean(publisherOfTheWeek?.instagramQueuedAt) ||
    Boolean(publisherOfTheWeek?.instagramStoryQueuedAt);

  const clearConfirm = hasQueuedToBuffer
    ? "Clear this week's Instagram plan? Posts and stories already sent to Buffer will not be removed there — delete those in Buffer if needed."
    : "Clear this week's Instagram plan?";

  const clearAlpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "@ajax:before": `confirm(${JSON.stringify(clearConfirm)}) || $event.preventDefault()`,
  };

  const hasContent =
    entries.length > 0 || artistOfTheWeek || publisherOfTheWeek;

  const artistCreator = artistOfTheWeek?.creator ?? null;
  const publisherCreator = publisherOfTheWeek?.creator ?? null;

  return (
    <Modal title={`Prepare Instagram – week ${week}`} maxWidth="max-w-2xl">
      {!hasContent ? (
        <p class="text-sm text-on-surface">
          Schedule books of the day, artist of the week, or publisher of the
          week before preparing Instagram posts.
        </p>
      ) : (
        <div>
          <p class="mb-4 text-sm text-on-surface">
            Feed posts publish automatically. Stories use Buffer&apos;s
            notification flow — you&apos;ll get a phone alert with copy-paste DM
            stickers for artist and publisher.
          </p>
          <FormPost
            action={`/dashboard/admin/planner/instagram/${week}/prepare`}
            {...saveAlpineAttrs}
          >
            <input type="hidden" name="week" value={week} />
            <div class="max-h-[min(55vh,calc(100dvh-12rem))] space-y-6 overflow-y-auto overscroll-contain pr-1">
              {entries.map((entry) => {
                const dateKey = toDateString(entry.date);
                const book = entry.book;
                if (!book) return null;

                const imageOptions = collectBookImageOptions(book);
                const selectedImages = getPlannerInstagramImageSelection(
                  entry,
                  imageOptions,
                );

                const tagLine = formatInstagramHashtags(book.tags);

                return (
                  <ImageCaptionSection
                    key={entry.id}
                    title={formatDayLabel(entry.date)}
                    subtitle={book.title}
                    fieldKey={dateKey}
                    imageOptions={imageOptions}
                    caption={buildBotdInstagramCaption(
                      book,
                      entry.instagramCaption,
                      entry.spotlightBlurb,
                    )}
                    selectedImages={selectedImages}
                    tagsLine={
                      tagLine ? `Tags: ${tagLine}` : "No tags on this book"
                    }
                  />
                );
              })}

              {artistCreator && artistOfTheWeek ? (
                <ImageCaptionSection
                  key="aotw"
                  title="Artist of the week"
                  subtitle={artistCreator.displayName}
                  fieldKey={INSTAGRAM_SPOTLIGHT_AOTW_KEY}
                  imageOptions={collectCreatorImageOptions(
                    artistCreator,
                    artistBookCoverUrls,
                  )}
                  caption={buildArtistInstagramCaption(
                    artistCreator,
                    artistOfTheWeek.instagramCaption,
                    artistOfTheWeek.spotlightBlurb,
                  )}
                  selectedImages={getPlannerInstagramImageSelection(
                    artistOfTheWeek,
                    collectCreatorImageOptions(
                      artistCreator,
                      artistBookCoverUrls,
                    ),
                  )}
                />
              ) : null}

              {publisherCreator && publisherOfTheWeek ? (
                <ImageCaptionSection
                  key="potw"
                  title="Publisher of the week"
                  subtitle={publisherCreator.displayName}
                  fieldKey={INSTAGRAM_SPOTLIGHT_POTW_KEY}
                  imageOptions={collectCreatorImageOptions(
                    publisherCreator,
                    publisherBookCoverUrls,
                  )}
                  caption={buildPublisherInstagramCaption(
                    publisherCreator,
                    publisherOfTheWeek.instagramCaption,
                    publisherOfTheWeek.spotlightBlurb,
                  )}
                  selectedImages={getPlannerInstagramImageSelection(
                    publisherOfTheWeek,
                    collectCreatorImageOptions(
                      publisherCreator,
                      publisherBookCoverUrls,
                    ),
                  )}
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
          {hasInstagramPlan && (
            <FormPost
              action={`/dashboard/admin/planner/instagram/${week}/clear`}
              class="mt-3"
              {...clearAlpineAttrs}
            >
              <button
                type="submit"
                class="rounded border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 cursor-pointer"
              >
                Clear Instagram plan
              </button>
            </FormPost>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PrepareInstagramModal;

type ImageCaptionSectionProps = {
  title: string;
  subtitle: string;
  fieldKey: string;
  imageOptions: string[];
  caption: string;
  selectedImages: string[];
  tagsLine?: string | null;
};

const ImageCaptionSection = ({
  title,
  subtitle,
  fieldKey,
  imageOptions,
  caption,
  selectedImages,
  tagsLine,
}: ImageCaptionSectionProps) => {
  const checkboxName = `imageUrl[${fieldKey}][]`;
  const limitCarouselSelection = `const checked = $el.closest('fieldset').querySelectorAll('input[type=checkbox]:checked'); if (checked.length > ${MAX_INSTAGRAM_CAROUSEL_IMAGES}) $el.checked = false`;

  return (
    <section class="rounded border border-outline bg-surface-alt/40 p-4">
      <h3 class="mb-3 text-sm font-semibold text-on-surface-strong">{title}</h3>
      <p class="mb-1 text-xs text-on-surface line-clamp-2">{subtitle}</p>
      {tagsLine ? (
        <p class="mb-3 text-xs text-on-surface-weak">{tagsLine}</p>
      ) : (
        <div class="mb-3" />
      )}

      <fieldset class="mb-4">
        <legend class="mb-2 block text-xs font-medium text-on-surface">
          Images (select 1–{MAX_INSTAGRAM_CAROUSEL_IMAGES} for carousel)
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
                    type="checkbox"
                    name={checkboxName}
                    value={url}
                    checked={selectedImages.includes(url)}
                    class="sr-only"
                    x-on:change={limitCarouselSelection}
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

      <label class="block text-xs font-medium text-on-surface">
        Caption
        <textarea
          name={`captions[${fieldKey}]`}
          required
          rows={5}
          class="mt-1 w-full rounded border border-outline bg-surface px-3 py-2 text-sm"
        >
          {caption}
        </textarea>
      </label>
    </section>
  );
};
