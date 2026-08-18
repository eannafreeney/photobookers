import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import { toDateString } from "../../../../../lib/utils.js";
import {
  buildArtistInstagramCaption,
  buildBotdInstagramCaption,
  buildPublisherInstagramCaption,
  collectBookImageOptions,
  collectCreatorImageOptions,
  formatInstagramHashtags
} from "../social-media/instagramCaption.js";
import {
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  getPlannerInstagramImageSelection
} from "../social-media/instagramUtils.js";
import { formatDayLabel } from "../utils.js";
const PrepareInstagramModal = ({
  week,
  entries,
  artistOfTheWeek,
  publisherOfTheWeek,
  artistBookCoverUrls = [],
  publisherBookCoverUrls = []
}) => {
  const saveAlpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close'), $dispatch('planner:updated')"
  };
  const hasBotdPlan = entries.some(
    (entry) => entry.instagramPreparedAt || entry.instagramQueuedAt || entry.instagramCaption || entry.featuredImageUrl || (entry.instagramImageUrls?.length ?? 0) > 0
  );
  const hasArtistPlan = Boolean(
    artistOfTheWeek && (artistOfTheWeek.instagramPreparedAt || artistOfTheWeek.instagramQueuedAt || artistOfTheWeek.instagramCaption || artistOfTheWeek.featuredImageUrl || (artistOfTheWeek.instagramImageUrls?.length ?? 0) > 0)
  );
  const hasPublisherPlan = Boolean(
    publisherOfTheWeek && (publisherOfTheWeek.instagramPreparedAt || publisherOfTheWeek.instagramQueuedAt || publisherOfTheWeek.instagramCaption || publisherOfTheWeek.featuredImageUrl || (publisherOfTheWeek.instagramImageUrls?.length ?? 0) > 0)
  );
  const hasInstagramPlan = hasBotdPlan || hasArtistPlan || hasPublisherPlan;
  const hasQueuedToBuffer = entries.some(
    (entry) => entry.instagramQueuedAt || entry.instagramStoryQueuedAt
  ) || Boolean(artistOfTheWeek?.instagramQueuedAt) || Boolean(artistOfTheWeek?.instagramStoryQueuedAt) || Boolean(publisherOfTheWeek?.instagramQueuedAt) || Boolean(publisherOfTheWeek?.instagramStoryQueuedAt);
  const clearConfirm = hasQueuedToBuffer ? "Clear this week's Instagram plan? Posts and stories already sent to Buffer will not be removed there \u2014 delete those in Buffer if needed." : "Clear this week's Instagram plan?";
  const clearAlpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "@ajax:before": `confirm(${JSON.stringify(clearConfirm)}) || $event.preventDefault()`
  };
  const hasContent = entries.length > 0 || artistOfTheWeek || publisherOfTheWeek;
  const artistCreator = artistOfTheWeek?.creator ?? null;
  const publisherCreator = publisherOfTheWeek?.creator ?? null;
  return /* @__PURE__ */ jsx(Modal, { title: `Prepare Instagram \u2013 week ${week}`, maxWidth: "max-w-2xl", children: !hasContent ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Schedule books of the day, artist of the week, or publisher of the week before preparing Instagram posts." }) : /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { class: "mb-4 text-sm text-on-surface", children: "Feed posts publish automatically. Stories use Buffer's notification flow \u2014 you'll get a phone alert with copy-paste DM stickers for artist and publisher." }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/admin/planner/instagram/${week}/prepare`,
        ...saveAlpineAttrs,
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "week", value: week }),
          /* @__PURE__ */ jsxs("div", { class: "max-h-[min(55vh,calc(100dvh-12rem))] space-y-6 overflow-y-auto overscroll-contain pr-1", children: [
            entries.map((entry) => {
              const dateKey = toDateString(entry.date);
              const book = entry.book;
              if (!book) return null;
              const imageOptions = collectBookImageOptions(book);
              if (entry.artistProvidedStoryImageUrl) {
                imageOptions.unshift(entry.artistProvidedStoryImageUrl);
              }
              const selectedImages = getPlannerInstagramImageSelection(
                entry,
                imageOptions
              );
              const tagLine = formatInstagramHashtags(book.tags);
              return /* @__PURE__ */ jsx(
                ImageCaptionSection,
                {
                  title: formatDayLabel(entry.date),
                  subtitle: book.title,
                  fieldKey: dateKey,
                  imageOptions,
                  caption: buildBotdInstagramCaption(
                    book,
                    entry.instagramCaption,
                    entry.spotlightBlurb
                  ),
                  selectedImages,
                  tagsLine: tagLine ? `Tags: ${tagLine}` : "No tags on this book",
                  artistProvidedStoryImageUrl: entry.artistProvidedStoryImageUrl,
                  previewKind: "botd",
                  previewId: entry.id
                },
                entry.id
              );
            }),
            artistCreator && artistOfTheWeek ? (() => {
              const aotwImageOptions = collectCreatorImageOptions(
                artistCreator,
                artistBookCoverUrls
              );
              if (artistOfTheWeek.artistProvidedStoryImageUrl) {
                aotwImageOptions.unshift(
                  artistOfTheWeek.artistProvidedStoryImageUrl
                );
              }
              return /* @__PURE__ */ jsx(
                ImageCaptionSection,
                {
                  title: "Artist of the week",
                  subtitle: artistCreator.displayName,
                  fieldKey: INSTAGRAM_SPOTLIGHT_AOTW_KEY,
                  imageOptions: aotwImageOptions,
                  caption: buildArtistInstagramCaption(
                    artistCreator,
                    artistOfTheWeek.instagramCaption,
                    artistOfTheWeek.spotlightBlurb
                  ),
                  selectedImages: getPlannerInstagramImageSelection(
                    artistOfTheWeek,
                    aotwImageOptions
                  ),
                  artistProvidedStoryImageUrl: artistOfTheWeek.artistProvidedStoryImageUrl,
                  previewKind: "aotw",
                  previewId: artistOfTheWeek.id
                },
                "aotw"
              );
            })() : null,
            publisherCreator && publisherOfTheWeek ? (() => {
              const potwImageOptions = collectCreatorImageOptions(
                publisherCreator,
                publisherBookCoverUrls
              );
              if (publisherOfTheWeek.artistProvidedStoryImageUrl) {
                potwImageOptions.unshift(
                  publisherOfTheWeek.artistProvidedStoryImageUrl
                );
              }
              return /* @__PURE__ */ jsx(
                ImageCaptionSection,
                {
                  title: "Publisher of the week",
                  subtitle: publisherCreator.displayName,
                  fieldKey: INSTAGRAM_SPOTLIGHT_POTW_KEY,
                  imageOptions: potwImageOptions,
                  caption: buildPublisherInstagramCaption(
                    publisherCreator,
                    publisherOfTheWeek.instagramCaption,
                    publisherOfTheWeek.spotlightBlurb
                  ),
                  selectedImages: getPlannerInstagramImageSelection(
                    publisherOfTheWeek,
                    potwImageOptions
                  ),
                  artistProvidedStoryImageUrl: publisherOfTheWeek.artistProvidedStoryImageUrl,
                  previewKind: "potw",
                  previewId: publisherOfTheWeek.id
                },
                "potw"
              );
            })() : null
          ] }),
          /* @__PURE__ */ jsx("div", { class: "mt-4 flex flex-wrap items-center gap-3 border-t border-outline pt-4", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              class: "rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer",
              children: "Save"
            }
          ) })
        ]
      }
    ),
    hasInstagramPlan && /* @__PURE__ */ jsx(
      FormPost,
      {
        action: `/dashboard/admin/planner/instagram/${week}/clear`,
        class: "mt-3",
        ...clearAlpineAttrs,
        children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            class: "rounded border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 cursor-pointer",
            children: "Clear Instagram plan"
          }
        )
      }
    )
  ] }) });
};
var PrepareInstagramModal_default = PrepareInstagramModal;
const ImageCaptionSection = ({
  title,
  subtitle,
  fieldKey,
  imageOptions,
  caption,
  selectedImages,
  tagsLine,
  artistProvidedStoryImageUrl,
  previewKind,
  previewId
}) => {
  const checkboxName = `imageUrl[${fieldKey}][]`;
  const previewAlpine = `{
    selectedImage: ${JSON.stringify(selectedImages[0] ?? "")},
    previewSrc: '',
    previewUrl() {
      return '/dashboard/admin/planner/story-preview?kind=${previewKind}&id=${previewId}'
        + (this.selectedImage ? '&image=' + encodeURIComponent(this.selectedImage) : '');
    },
    loadPreview() { this.previewSrc = this.previewUrl(); },
    selectImage(url) {
      this.selectedImage = url;
      if (this.previewSrc) this.previewSrc = this.previewUrl();
    },
  }`;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      class: "rounded border border-outline bg-surface-alt/40 p-4",
      "x-data": previewAlpine,
      children: [
        /* @__PURE__ */ jsx("h3", { class: "mb-3 text-sm font-semibold text-on-surface-strong", children: title }),
        /* @__PURE__ */ jsx("p", { class: "mb-1 text-xs text-on-surface line-clamp-2", children: subtitle }),
        tagsLine ? /* @__PURE__ */ jsx("p", { class: "mb-3 text-xs text-on-surface-weak", children: tagsLine }) : /* @__PURE__ */ jsx("div", { class: "mb-3" }),
        /* @__PURE__ */ jsxs("fieldset", { class: "mb-4", children: [
          /* @__PURE__ */ jsx("legend", { class: "mb-2 block text-xs font-medium text-on-surface", children: "Story image (select one)" }),
          imageOptions.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-xs text-danger", children: "No image available." }) : /* @__PURE__ */ jsx("div", { class: "max-h-48 overflow-y-auto overscroll-contain rounded border border-outline/60 bg-surface p-2", children: /* @__PURE__ */ jsx("div", { class: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: imageOptions.map((url) => /* @__PURE__ */ jsxs(
            "label",
            {
              class: "cursor-pointer rounded border border-outline p-1 [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary relative",
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    name: checkboxName,
                    value: url,
                    checked: selectedImages.includes(url),
                    class: "sr-only",
                    "x-on:change": `selectImage(${JSON.stringify(url)})`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: url,
                    alt: "",
                    class: "aspect-[3/4] w-full rounded object-cover"
                  }
                ),
                url === artistProvidedStoryImageUrl ? /* @__PURE__ */ jsx("span", { class: "absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white", children: "Artist" }) : null
              ]
            },
            url
          )) }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { class: "block text-xs font-medium text-on-surface", children: [
          "Caption",
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: `captions[${fieldKey}]`,
              required: true,
              rows: 5,
              class: "mt-1 w-full rounded border border-outline bg-surface px-3 py-2 text-sm",
              children: caption
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "mt-4 rounded border border-outline bg-surface p-3", children: [
          /* @__PURE__ */ jsx("p", { class: "mb-2 text-xs font-medium text-on-surface", children: "Story preview" }),
          /* @__PURE__ */ jsx(
            "div",
            {
              class: "relative mx-auto w-full max-w-[240px] overflow-hidden rounded bg-gray-100",
              style: "aspect-ratio: 9/16;",
              ...{ "x-intersect.once": "loadPreview()" },
              children: /* @__PURE__ */ jsx(
                "img",
                {
                  "x-bind:src": "previewSrc",
                  alt: "Story preview",
                  class: "absolute inset-0 h-full w-full object-contain"
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
export {
  PrepareInstagramModal_default as default
};
