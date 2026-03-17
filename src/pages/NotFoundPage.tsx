import SectionTitle from "../components/app/SectionTitle";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";

const NotFoundPage = ({ currentPath }: { currentPath: string }) => {
  return (
    <AppLayout title="Page not found" currentPath={currentPath}>
      <Page>
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
          <p class="text-6xl font-bold text-base-content/60">404</p>
          <SectionTitle>Page not found</SectionTitle>
          <p class="text-base-content/80 max-w-md">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
          <a href="/featured" class="btn btn-primary">
            Back to home
          </a>
        </div>
      </Page>
    </AppLayout>
  );
};

export default NotFoundPage;
