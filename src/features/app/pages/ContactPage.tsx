import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import SectionTitle from "../../../components/app/SectionTitle";
import ContactForm from "../forms/ContactForm";

const ContactPage = ({ currentPath }: { currentPath: string }) => {
  return (
    <AppLayout title="Contact" currentPath={currentPath}>
      <Page>
        <SectionTitle>Contact</SectionTitle>
        <p class="mb-6 text-on-surface-weak">
          Send us a message and we’ll get back to you as soon as we can.
        </p>
        <ContactForm />
      </Page>
    </AppLayout>
  );
};

export default ContactPage;
