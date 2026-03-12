import { AuthUser } from "../../../../types";
import { loadingIcon } from "../../../components/app/Pagination";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { capitalize } from "../../../utils";
import Intersector from "../components/Intersector";

type TagPageProps = {
  user: AuthUser | null;
  tag: string;
  currentPath: string;
};

const TagPage = async ({ user, tag, currentPath }: TagPageProps) => {
  return (
    <AppLayout
      title={`# ${capitalize(tag)}`}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <Intersector
          id="tag-books-fragment"
          endpoint={`/fragments/tags?tag=${encodeURIComponent(tag)}`}
        />
      </Page>
    </AppLayout>
  );
};
export default TagPage;
