import { PropsWithChildren } from "hono/jsx";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../admin/components/Breadcrumbs";
import NavTabs from "../books/components/NavTabs";
import VerifiedCreatorShareBanner from "../books/components/VerifiedCreatorShareBanner";
import VerificationStatusBanner from "./VerificationStatusBanner";
import { AuthUser } from "../../../../types";
import { CreatorClaimStatus } from "../../../db/schema";

type Props = PropsWithChildren<{
  currentPath: string;
  user: AuthUser;
  claimStatus: CreatorClaimStatus | null;
}>;

const CreatorDashboardShell = ({
  children,
  currentPath,
  user,
  claimStatus,
}: Props) => {
  const creator = user.creator!;

  return (
    <>
      <VerificationStatusBanner
        claimStatus={claimStatus}
        creatorStatus={creator.status ?? "stub"}
      />
      {creator.status === "verified" && (
        <VerifiedCreatorShareBanner creator={creator} />
      )}
      <Page>
        <NavTabs
          currentPath={currentPath}
          creatorId={creator.id}
          showProfile={creator.status === "verified"}
        />

        <div
          id="creator-dashboard-panel"
          class="flex flex-col gap-8"
          x-merge="replace"
        >
          {children}
        </div>
      </Page>
    </>
  );
};

export default CreatorDashboardShell;
