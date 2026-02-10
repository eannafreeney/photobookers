import { AuthUser } from "../../../types";
import Button from "../../components/app/Button";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";

type ErrorPageProps = {
  errorMessage: string;
  user?: AuthUser | null;
};

const ErrorPage = ({ errorMessage, user }: ErrorPageProps) => (
  <AppLayout title="Error" user={user} currentPath="/">
    <Page>
      <div class="flex flex-col gap-4 items-center justify-center min-h-screen">
        <div class="text-center text-2xl font-medium">{errorMessage}</div>
        <a href="/">
          <Button variant="solid" color="primary">
            Go Home
          </Button>
        </a>
      </div>
    </Page>
  </AppLayout>
);

export default ErrorPage;
