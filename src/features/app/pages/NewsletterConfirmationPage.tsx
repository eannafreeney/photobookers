import Button from "../../../components/app/Button";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";

const NewsletterConfirmationPage = () => {
  return (
    <AppLayout
      title="Newsletter Confirmation"
      currentPath="/newsletter-confirmation"
    >
      <Page>
        <div class="flex flex-col items-center justify-center min-h-[80vh] text-center gap-6">
          <h1 class="text-2xl font-bold">Newsletter Confirmation</h1>
          <p class="text-lg">
            Your newsletter subscription has been confirmed.
          </p>
          <a href="/">
            <Button variant="solid" color="primary">
              Go to home
            </Button>
          </a>
        </div>
      </Page>
    </AppLayout>
  );
};

export default NewsletterConfirmationPage;
