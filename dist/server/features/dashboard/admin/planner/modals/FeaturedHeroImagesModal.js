import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import { toDateString } from "../../../../../lib/utils.js";
import {
  collectBookImageOptions,
  collectCreatorImageOptions
} from "../instagramCaption.js";
import {
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY
} from "../instagramUtils.js";
import { formatDayLabel } from "../utils.js";
const FeaturedHeroImagesModal = ({
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
  const hasContent = entries.length > 0 || artistOfTheWeek || publisherOfTheWeek;
  const artistCreator = artistOfTheWeek?.creator ?? null;
  const publisherCreator = publisherOfTheWeek?.creator ?? null;
  return /* @__PURE__ */ jsx(Modal, { title: `Featured hero images \u2013 week ${week}`, maxWidth: "max-w-2xl", children: !hasContent ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Schedule books of the day, artist of the week, or publisher of the week before choosing featured hero images." }) : /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { class: "mb-4 text-sm text-on-surface", children: "These images appear in the featured page hero carousel and on spotlight pages. Instagram posts use the same image when prepared." }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/admin/planner/featured-hero/${week}/prepare`,
        ...saveAlpineAttrs,
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "week", value: week }),
          /* @__PURE__ */ jsxs("div", { class: "max-h-[min(55vh,calc(100dvh-12rem))] space-y-6 overflow-y-auto overscroll-contain pr-1", children: [
            entries.map((entry) => {
              const dateKey = toDateString(entry.date);
              const book = entry.book;
              if (!book) return null;
              const imageOptions = collectBookImageOptions(book);
              const selectedImage = entry.instagramImageUrl ?? imageOptions[0] ?? "";
              return /* @__PURE__ */ jsx(
                HeroImageSection,
                {
                  title: formatDayLabel(entry.date),
                  subtitle: book.title,
                  fieldKey: dateKey,
                  imageOptions,
                  selectedImage
                },
                entry.id
              );
            }),
            artistCreator && artistOfTheWeek ? /* @__PURE__ */ jsx(
              HeroImageSection,
              {
                title: "Artist of the week",
                subtitle: artistCreator.displayName,
                fieldKey: INSTAGRAM_SPOTLIGHT_AOTW_KEY,
                imageOptions: collectCreatorImageOptions(
                  artistCreator,
                  artistBookCoverUrls
                ),
                selectedImage: artistOfTheWeek.instagramImageUrl ?? collectCreatorImageOptions(
                  artistCreator,
                  artistBookCoverUrls
                )[0] ?? ""
              },
              "aotw"
            ) : null,
            publisherCreator && publisherOfTheWeek ? /* @__PURE__ */ jsx(
              HeroImageSection,
              {
                title: "Publisher of the week",
                subtitle: publisherCreator.displayName,
                fieldKey: INSTAGRAM_SPOTLIGHT_POTW_KEY,
                imageOptions: collectCreatorImageOptions(
                  publisherCreator,
                  publisherBookCoverUrls
                ),
                selectedImage: publisherOfTheWeek.instagramImageUrl ?? collectCreatorImageOptions(
                  publisherCreator,
                  publisherBookCoverUrls
                )[0] ?? ""
              },
              "potw"
            ) : null
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
    )
  ] }) });
};
var FeaturedHeroImagesModal_default = FeaturedHeroImagesModal;
const HeroImageSection = ({
  title,
  subtitle,
  fieldKey,
  imageOptions,
  selectedImage
}) => /* @__PURE__ */ jsxs("section", { class: "rounded border border-outline bg-surface-alt/40 p-4", children: [
  /* @__PURE__ */ jsx("h3", { class: "mb-1 text-sm font-semibold text-on-surface-strong", children: title }),
  /* @__PURE__ */ jsx("p", { class: "mb-3 text-xs text-on-surface line-clamp-2", children: subtitle }),
  /* @__PURE__ */ jsxs("fieldset", { children: [
    /* @__PURE__ */ jsx("legend", { class: "mb-2 block text-xs font-medium text-on-surface", children: "Image" }),
    imageOptions.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-xs text-danger", children: "No image available." }) : /* @__PURE__ */ jsx("div", { class: "max-h-48 overflow-y-auto overscroll-contain rounded border border-outline/60 bg-surface p-2", children: /* @__PURE__ */ jsx("div", { class: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: imageOptions.map((url) => /* @__PURE__ */ jsxs(
      "label",
      {
        class: "cursor-pointer rounded border border-outline p-1 [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary",
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "radio",
              name: `imageUrl[${fieldKey}]`,
              value: url,
              required: true,
              checked: url === selectedImage,
              class: "sr-only"
            }
          ),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: url,
              alt: "",
              class: "aspect-[3/4] w-full rounded object-cover"
            }
          )
        ]
      },
      url
    )) }) })
  ] })
] });
export {
  FeaturedHeroImagesModal_default as default
};
