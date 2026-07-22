import { NewsletterCampaign } from "@/db/schema";
import FormPost from "@/components/forms/FormPost";
import Input from "@/components/forms/Input";
import TextArea from "@/components/forms/TextArea";
import FormButtons from "@/components/forms/FormButtons";

type CampaignTextFormProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignTextForm = ({ selectedCampaign }: CampaignTextFormProps) => {
  const initialForm = {
    subject: selectedCampaign.subject ?? "",
    introText: selectedCampaign.introText ?? "",
    outroText: selectedCampaign.outroText ?? "",
    ctaText: selectedCampaign.ctaText ?? "",
    ctaHref: selectedCampaign.ctaHref ?? "",
  };

  const alpineAttrs = {
    "x-data": `campaignTextForm(${JSON.stringify(initialForm)})`,
    "x-target": "newsletter-preview toast",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <FormPost
      {...alpineAttrs}
      action={`/dashboard/admin/newsletters/${selectedCampaign.id}/save`}
      className="space-y-3"
    >
      <Input
        label="Subject"
        name="form.subject"
        maxLength={180}
        validateInput="validateField('subject')"
      />
      <TextArea
        label="Intro"
        name="form.introText"
        minRows={4}
        maxLength={5000}
        validateInput="validateField('introText')"
      />
      <TextArea
        label="Outro"
        name="form.outroText"
        minRows={4}
        maxLength={5000}
        validateInput="validateField('outroText')"
      />
      <Input
        label="CTA"
        name="form.ctaText"
        maxLength={120}
        validateInput="validateField('ctaText')"
      />
      <Input
        label="CTA link"
        type="url"
        name="form.ctaHref"
        placeholder="Leave blank to link to the homepage"
        validateInput="validateField('ctaHref')"
      />
      <FormButtons buttonText="Save draft" loadingText="Saving..." />
    </FormPost>
  );
};

export default CampaignTextForm;
