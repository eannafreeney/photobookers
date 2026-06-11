import SectionTitle from "../components/app/SectionTitle";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";
import Button from "../components/app/Button";
import { AuthUser } from "../../types";

const NotFoundPage = ({
  currentPath,
  user,
}: {
  currentPath: string;
  user?: AuthUser | null;
}) => {
  return (
    <AppLayout title="Page not found" currentPath={currentPath} user={user}>
      <Page>
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
          <p class="kicker text-accent">Out of Print</p>
          <p class="font-display text-8xl md:text-9xl font-medium leading-none text-on-surface-strong">
            404
          </p>
          <SectionTitle className="mb-0">Page not found</SectionTitle>
          <p class="text-on-surface max-w-md text-pretty">
            The page you’re looking for doesn’t exist or has been moved.
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

export default NotFoundPage;
