import type { MagazineIssueView } from "@/domain/magazine/queries";
import IssueActions from "./IssueActions";
import DetailsForm from "./DetailsForm";
import SelectedBooks from "./SelectedBooks";
import IssueHeader from "./IssueHeader";

type Props = {
  issue: MagazineIssueView;
  nextNumber: number;
};

export const AdminIssueEditor = ({ issue, nextNumber }: Props) => {
  const action = `/dashboard/admin/magazine/${issue.id}`;

  return (
    <div class="flex flex-col gap-6">
      <IssueHeader issue={issue} />
      <IssueActions issue={issue} action={action} nextNumber={nextNumber} />
      <DetailsForm issue={issue} action={action} />
      <SelectedBooks issue={issue} action={action} />
    </div>
  );
};
