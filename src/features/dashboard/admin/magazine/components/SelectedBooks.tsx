import { MagazineIssueView } from "@/domain/magazine/queries";
import IssueBookCard from "./IssueBookCard";

type Props = {
  issue: MagazineIssueView;
  action: string;
};

const SelectedBooks = ({ issue, action }: Props) => {
  return (
    <section class="flex flex-col gap-6 border-t border-outline pt-4">
      <ul class="flex flex-col gap-2">
        {issue.placements.map((item) => (
          <IssueBookCard
            number={item.number}
            bookId={item.bookId}
            book={item.book}
            blurb={item.blurb}
            action={action}
            artistPrompt={item.artistPrompt}
            artistQuote={item.artistQuote}
            artistEmailSentAt={item.artistEmailSentAt}
          />
        ))}
      </ul>
    </section>
  );
};

export default SelectedBooks;
