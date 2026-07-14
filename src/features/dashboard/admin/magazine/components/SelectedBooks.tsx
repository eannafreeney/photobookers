import { MagazineIssueView } from "@/domain/magazine/queries";
import { deleteIcon, editIcon } from "@/lib/icons";

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
      <div class="flex items-baseline justify-between">
        <span class="kicker text-accent">
          {placements.length} books — remove any you don't want
        </span>
      </div>
      {issue.movements.map((movement) => {
        const items = byMovement.get(movement.id) ?? [];
        if (items.length === 0) return null;
        return (
          <div class="flex flex-col gap-3">
            <form
              method="post"
              action={`${action}/movement`}
              class="flex flex-wrap items-end gap-2 border-b border-outline pb-3"
            >
              <input type="hidden" name="movementId" value={movement.id} />
              <label class="flex flex-col gap-0.5">
                <span class="text-[0.6rem] font-semibold uppercase tracking-wider text-on-surface-weak">
                  Kicker
                </span>
                <input
                  name="kicker"
                  value={movement.kicker}
                  class="w-32 border border-outline bg-surface px-2 py-1 text-sm text-on-surface"
                />
              </label>
              <label class="flex flex-col gap-0.5">
                <span class="text-[0.6rem] font-semibold uppercase tracking-wider text-on-surface-weak">
                  Lead
                </span>
                <input
                  name="lead"
                  value={movement.lead}
                  class="w-44 border border-outline bg-surface px-2 py-1 text-sm text-on-surface"
                />
              </label>
              <label class="flex min-w-48 flex-1 flex-col gap-0.5">
                <span class="text-[0.6rem] font-semibold uppercase tracking-wider text-on-surface-weak">
                  Title
                </span>
                <input
                  name="title"
                  value={movement.title}
                  class="w-full border border-outline bg-surface px-2 py-1 text-sm text-on-surface"
                />
              </label>
              <button
                type="submit"
                class="border border-outline px-3 py-1.5 text-xs font-semibold text-on-surface-strong hover:border-accent hover:text-accent"
              >
                Save movement
              </button>
            </form>
            <ul class="flex flex-col gap-2">
              {items.map((p) => (
                <li class="flex items-start gap-3 border border-outline bg-surface-alt/40 p-3">
                  {p.book?.coverUrl ? (
                    <img
                      src={p.book.coverUrl}
                      alt=""
                      loading="lazy"
                      class="h-20 w-16 shrink-0 border border-outline object-cover"
                    />
                  ) : (
                    <div class="flex h-20 w-16 shrink-0 items-center justify-center border border-outline text-[0.6rem] text-on-surface-weak">
                      no cover
                    </div>
                  )}
                  <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span class="font-display text-base font-medium text-on-surface-strong">
                        {p.book?.title ?? "Untitled"}
                      </span>
                      {p.book?.artist?.status === "verified" ? (
                        <span class="text-[0.6rem] font-semibold uppercase tracking-wider text-[#4f7a4a]">
                          ✦ Verified
                        </span>
                      ) : null}
                    </div>
                    <span class="text-xs text-on-surface-weak">
                      {p.book?.artist?.displayName ?? "Unknown artist"}
                    </span>
                    <form
                      method="post"
                      action={`${action}/blurb`}
                      class="mt-1 flex flex-col gap-1"
                    >
                      <input type="hidden" name="bookId" value={p.bookId} />
                      <textarea
                        name="blurb"
                        rows={3}
                        class="w-full border border-outline bg-surface px-2 py-1.5 text-xs leading-relaxed text-on-surface"
                      >
                        {p.blurb ?? ""}
                      </textarea>
                      <div>
                        <button
                          type="submit"
                          class="text-xs font-semibold text-accent hover:underline"
                        >
                          Save description
                        </button>
                      </div>
                    </form>
                  </div>
                  <form method="post" action={`${action}/remove-book`} class="shrink-0">
                    <input type="hidden" name="bookId" value={p.bookId} />
                    <button
                      type="submit"
                      class="text-danger hover:opacity-80"
                      title="Remove from issue"
                    >
                      {deleteIcon}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
};

export default SelectedBooks;
