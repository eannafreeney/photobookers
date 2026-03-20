import { AuthUser } from "../../types";
import Button from "../components/app/Button";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";
import { thumbsDownIcon, thumbsUpIcon } from "../lib/icons";

type Props = {
  errorMessage: string;
  user?: AuthUser | null;
  isSuccess?: boolean;
  redirectUrl?: string;
  redirectText?: string;
};

const InfoPage = ({
  errorMessage,
  user,
  isSuccess,
  redirectUrl = "/",
  redirectText = "Go Home",
}: Props) => (
  <AppLayout title="Error" user={user} currentPath="/">
    <Page>
      <div class="flex flex-col gap-6 items-center justify-center min-h-screen">
        <div>{isSuccess ? thumbsUpIcon() : thumbsDownIcon()}</div>
        <div class="text-center text-2xl font-medium max-w-4xl">
          {errorMessage}
        </div>
        <a href={redirectUrl}>
          <Button variant="solid" color="primary" width="lg">
            {redirectText}
          </Button>
        </a>
      </div>
    </Page>
  </AppLayout>
);

export default InfoPage;
