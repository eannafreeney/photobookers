import { MagazineIssueView } from "@/domain/magazine/queries";
import MovementForm from "./MovementForm";
import MovementBookCard from "./MovementBookCard";

type Props = {
  issue: MagazineIssueView;
  action: string;
};

const SelectedBooks = ({ issue, action }: Props) => {
  const placements = issue.placements;
  const byMovement = new Map(
    issue.movements.map((m) => [
      m.id,
      placements.filter((p) => p.movementId === m.id),
    ]),
  );

  return (
    <section class="flex flex-col gap-6 border-t border-outline pt-4">
      {issue.movements.map((movement) => {
        const items = byMovement.get(movement.id) ?? [];
        if (items.length === 0) return null;
        return (
          <div class="flex flex-col gap-3">
            <MovementForm movement={movement} action={action} />
            <ul class="flex flex-col gap-2">
              {items.map((item) => (
                <MovementBookCard
                  number={item.number}
                  bookId={item.bookId}
                  book={item.book}
                  blurb={item.blurb}
                  action={action}
                  artistPrompt={item.artistPrompt}
                  artistEmailSentAt={item.artistEmailSentAt}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
};

export default SelectedBooks;
