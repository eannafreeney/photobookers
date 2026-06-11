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
  <View
    id={NEWSLETTER_FORM_FIELDS_ID}
    xmlns="https://hyperview.org/hyperview"
    style="newsletter-form-row"
  >
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
    <View style="newsletter-header">
      <View style="newsletter-icon-wrap">
        <Text style="newsletter-icon">✉</Text>
      </View>
      <View style="newsletter-copy">
        <Text style="newsletter-heading">Join the mailing list</Text>
        <Text style="newsletter-subheading">
          Discover new books and creators.
        </Text>
      </View>
    </View>
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
      backgroundColor="#f2efe8"
      borderTopWidth={2}
      borderBottomWidth={2}
      borderColor="#191613"
      padding={16}
      gap={16}
    />
    <Style
      id="newsletter-header"
      flexDirection="row"
      alignItems="flex-start"
      gap={12}
    />
    <Style
      id="newsletter-icon-wrap"
      width={40}
      height={40}
      backgroundColor="#fbfaf7"
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor="#e4e0d5"
      flexShrink={0}
    />
    <Style
      id="newsletter-icon"
      fontSize={18}
      color="#a22c29"
      textAlign="center"
    />
    <Style id="newsletter-copy" flex={1} gap={4} />
    <Style
      id="newsletter-heading"
      fontFamily="Fraunces-Medium"
      fontSize={17}
      color="#191613"
    />
    <Style
      id="newsletter-subheading"
      fontSize={13}
      color="#45413a"
      lineHeight={18}
    />
    <Style
      id="newsletter-form-row"
      flexDirection="row"
      alignItems="center"
      gap={8}
    />
    <Style
      id="newsletter-input"
      flex={1}
      borderWidth={1}
      borderColor="#e4e0d5"
      borderRadius={0}
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={12}
      paddingRight={12}
      fontSize={14}
      backgroundColor="#fbfaf7"
      minHeight={40}
    />
    <Style
      id="newsletter-btn"
      backgroundColor="#a22c29"
      borderRadius={0}
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={16}
      paddingRight={16}
      alignItems="center"
      justifyContent="center"
      minHeight={40}
      flexShrink={0}
    />
    <Style
      id="newsletter-btn-label"
      color="#fbfaf7"
      fontWeight="600"
      fontSize={14}
    />
  </>
);
