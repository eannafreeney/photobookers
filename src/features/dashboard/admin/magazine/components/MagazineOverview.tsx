import type { AdminIssueListItem } from "@/domain/magazine/queries";
import ThemeGenerator from "./ThemeGenerator";
import MagazineTable from "./MagazineTable";

type Props = {
  issues: AdminIssueListItem[];
};

const MagazineOverview = ({ issues }: Props) => {
  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <span class="kicker text-accent">Admin</span>
        <h1 class="font-display text-3xl font-medium text-on-surface-strong">
          Magazine
        </h1>
        <p class="text-sm text-on-surface">
          Generate a themed draft from the catalogue, prune it, then approve and
          assign it an issue number.
        </p>
      </div>

      <ThemeGenerator />
      <MagazineTable issues={issues} />
    </div>
  );
};

export default MagazineOverview;
