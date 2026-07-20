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
      <div class="flex items-center justify-between gap-3">
        <span class="kicker text-accent">Books</span>
        <a
          href={`${action}/add-book`}
          x-target="modal-root"
          class="inline-flex items-center gap-1 border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:border-accent hover:text-accent"
        >
          + Add book
        </a>
      </div>
      <SelectedBooksList issue={issue} action={action} />
    </section>
  );
};

export default SelectedBooks;
