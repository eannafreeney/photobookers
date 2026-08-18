import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { verifyStoryUploadToken } from "../../domain/planner/storyUploadToken.js";
import { uploadImageFromBuffer } from "../../services/storage.js";
import Alert from "../../components/app/Alert.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import InfoPage from "../../pages/InfoPage.js";
import StoryUploadForm from "../../features/story-upload/components/StoryUploadForm.js";
import {
  getStoryUploadRow,
  setStoryUploadImageUrl,
  storyUploadCredits,
  storyUploadTitle
} from "../../features/story-upload/utils.js";
const GET = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: tokenError.reason }));
  }
  const row = await getStoryUploadRow(payload.kind, payload.id);
  if (!row) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Feature not found" }));
  }
  const title = storyUploadTitle(payload.kind, row);
  const credits = storyUploadCredits(payload.kind, row);
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title: "Upload Instagram Story image", children: /* @__PURE__ */ jsxs("div", { class: "mx-auto max-w-md p-6", children: [
      /* @__PURE__ */ jsx("h1", { class: "mb-2 text-xl font-semibold", children: "Upload a vertical image for Instagram Stories" }),
      /* @__PURE__ */ jsx("p", { class: "mb-4 text-sm text-gray-600", children: title }),
      /* @__PURE__ */ jsx("p", { class: "mb-4 text-sm text-gray-600", children: "Portrait/vertical (9:16 ratio, e.g. 1080 \xD7 1920 px). One strong image \u2014 JPG, PNG, or WebP." }),
      /* @__PURE__ */ jsx(
        StoryUploadForm,
        {
          token,
          kind: payload.kind,
          title,
          credits
        }
      )
    ] }) })
  );
});
const POST = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: tokenError.reason }), 400);
  }
  const form = await c.req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: "No image provided" }), 400);
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `social/story-uploads/${payload.kind}/${payload.id}`;
    const uploaded = await uploadImageFromBuffer(buffer, folder);
    await setStoryUploadImageUrl(payload.kind, payload.id, uploaded.url);
    return c.html(
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: "Image uploaded \u2014 thank you! Upload again anytime to replace it."
        }
      )
    );
  } catch (error) {
    console.error("story upload", error);
    return c.html(
      /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Upload failed \u2014 please try again" }),
      500
    );
  }
});
export {
  GET,
  POST
};
