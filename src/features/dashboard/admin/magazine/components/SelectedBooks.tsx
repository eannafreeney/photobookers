import { MagazineIssueView } from "@/domain/magazine/queries";
import IssueBookCard from "./IssueBookCard";

type Props = {
  issue: MagazineIssueView;
  action: string;
};

// The reorderable list itself, carrying the `magazine-books` id so a move can
// swap the whole list in place via alpine-ajax.
export const SelectedBooksList = ({ issue, action }: Props) => {
  const count = issue.placements.length;
  return (
    <ul id="magazine-books" class="flex flex-col gap-2">
      {issue.placements.map((item) => (
        <IssueBookCard {...item} count={count} action={action} />
      ))}
    </ul>
  );
};

const SelectedBooks = ({ issue, action }: Props) => {
  return (
    <section class="flex flex-col gap-6 border-t border-outline pt-4">
      <SelectedBooksList issue={issue} action={action} />
    </section>
  );
};

export default SelectedBooks;
