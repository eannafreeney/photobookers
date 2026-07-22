import Button from "../../../../../components/app/Button";
import SectionTitle from "../../../../../components/app/SectionTitle";
import FormPost from "../../../../../components/forms/FormPost";
import AdminNewslettersTableAndFilter from "./AdminNewslettersTableAndFilter";

type Props = {
  currentPath: string;
  currentPage: number;
};

const AdminNewslettersTableContainer = async ({
  currentPath,
  currentPage,
}: Props) => {
  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Newsletters</SectionTitle>
      <FormPost
        action="/dashboard/admin/newsletters/create"
        className="flex flex-col gap-1"
      >
        <Button variant="solid" color="primary" width="auto">
          Add next week
        </Button>
        <p class="text-xs text-on-surface-muted">
          Creates the next Thu–Wed edition after your latest newsletter.
        </p>
      </FormPost>
      <AdminNewslettersTableAndFilter
        currentPath={currentPath}
        currentPage={currentPage}
      />
    </div>
  );
};

export default AdminNewslettersTableContainer;
