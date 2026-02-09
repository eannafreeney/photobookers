import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";

const ErrorPage = ({ errorMessage }: { errorMessage: string }) => (
  <AppLayout title="Error">
    <Page>
      <div class="flex flex-col items-center justify-center min-h-screen">
        <div class="text-center text-2xl font-medium">{errorMessage}</div>
        <a href="/" class="link link-primary">
          Go Home
        </a>
      </div>
    </Page>
  </AppLayout>
);

export default ErrorPage;
