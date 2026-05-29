import { FC } from "hono/jsx";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";

/** Element id for `replace` after submit — must not match any `<style id="…">`. */
export const NEWSLETTER_FORM_FIELDS_ID = "newsletter-form-fields";

type NewsletterFormFieldsProps = {
  baseUrl: string;
  email?: string;
  submitLabel?: string;
  showSubmitBehavior?: boolean;
};

export const HyperviewNewsletterFormFields: FC<NewsletterFormFieldsProps> = ({
  baseUrl,
  email = "",
  submitLabel = "Sign up",
  showSubmitBehavior = true,
}) => (
  <View id={NEWSLETTER_FORM_FIELDS_ID} xmlns="https://hyperview.org/hyperview">
    <TextField
      style="newsletter-input"
      name="email"
      placeholder="you@example.com"
      keyboard-type="email-address"
      value={email}
    />
    <View style="newsletter-btn" id="newsletter-submit">
      <Text style="newsletter-btn-label">{submitLabel}</Text>
      {showSubmitBehavior ? (
        <Behavior
          action="replace"
          verb="post"
          href={`${baseUrl}/newsletter`}
          target={NEWSLETTER_FORM_FIELDS_ID}
        />
      ) : null}
    </View>
  </View>
);

type NewsletterCardProps = {
  baseUrl?: string;
};

const NewsletterCard: FC<NewsletterCardProps> = ({ baseUrl = "" }) => (
  <View style="newsletter-card">
    <Text style="newsletter-title">✉ Join the mailing list</Text>
    <Form id="newsletter-form">
      <HyperviewNewsletterFormFields baseUrl={baseUrl} />
    </Form>
  </View>
);

export default NewsletterCard;

export const newsletterCardStyles = () => (
  <>
    <Style
      id="newsletter-card"
      backgroundColor="#e0f2fe"
      borderRadius={12}
      padding={20}
      flexDirection="column"
      gap={14}
      marginBottom={24}
    />
    <Style
      id="newsletter-title"
      fontSize={16}
      fontWeight="700"
      color="#111111"
      textAlign="center"
    />
    <Style
      id="newsletter-input"
      borderWidth={1}
      borderColor="#bbb"
      borderRadius={8}
      padding={10}
      fontSize={15}
      backgroundColor="#ffffff"
      marginBottom={10}
    />
    <Style
      id="newsletter-btn"
      backgroundColor="#111111"
      borderRadius={8}
      paddingTop={12}
      paddingBottom={12}
      alignItems="center"
    />
    <Style
      id="newsletter-btn-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={15}
    />
  </>
);
