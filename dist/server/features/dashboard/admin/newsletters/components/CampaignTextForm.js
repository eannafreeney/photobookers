import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import Input from "../../../../../components/forms/Input.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const CampaignTextForm = ({ selectedCampaign }) => {
  const initialForm = {
    subject: selectedCampaign.subject ?? "",
    introText: selectedCampaign.introText ?? "",
    outroText: selectedCampaign.outroText ?? "",
    ctaText: selectedCampaign.ctaText ?? "",
    ctaHref: selectedCampaign.ctaHref ?? ""
  };
  const alpineAttrs = {
    "x-data": `campaignTextForm(${JSON.stringify(initialForm)})`,
    "x-target": "newsletter-preview toast",
    "x-on:submit": "submitForm($event)"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      ...alpineAttrs,
      action: `/dashboard/admin/newsletters/${selectedCampaign.id}/save`,
      className: "space-y-3",
      children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Subject",
            name: "form.subject",
            maxLength: 180,
            validateInput: "validateField('subject')"
          }
        ),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Intro",
            name: "form.introText",
            minRows: 4,
            maxLength: 5e3,
            validateInput: "validateField('introText')"
          }
        ),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Outro",
            name: "form.outroText",
            minRows: 4,
            maxLength: 5e3,
            validateInput: "validateField('outroText')"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "CTA",
            name: "form.ctaText",
            maxLength: 120,
            validateInput: "validateField('ctaText')"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "CTA link",
            type: "url",
            name: "form.ctaHref",
            placeholder: "Leave blank to link to the homepage",
            validateInput: "validateField('ctaHref')"
          }
        ),
        /* @__PURE__ */ jsx(FormButtons, { buttonText: "Save draft", loadingText: "Saving..." })
      ]
    }
  );
};
var CampaignTextForm_default = CampaignTextForm;
export {
  CampaignTextForm_default as default
};
