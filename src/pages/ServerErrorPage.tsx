import SectionTitle from "../components/app/SectionTitle";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";
import Button from "../components/app/Button";
import { AuthUser } from "../../types";

type ServerErrorPageProps = {
  currentPath: string;
  user?: AuthUser | null;
};

const ServerErrorPage = ({ currentPath, user }: ServerErrorPageProps) => {
  return (
    <AppLayout title="Under maintenance" currentPath={currentPath} user={user}>
      <Page>
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
          <p class="kicker text-accent">Opps, something went wrong</p>

          <SectionTitle className="mb-0">
            Currently under maintenance
          </SectionTitle>
          <p class="text-on-surface max-w-md text-pretty">
            Something went wrong on our side. We&apos;re working on it — please
            try again in a few minutes.
          </p>
          <a href="/featured">
            <Button variant="solid" color="primary" width="lg">
              Back home
            </Button>
          </a>
        </div>
      </Page>
    </AppLayout>
  );
};

export default ServerErrorPage;
