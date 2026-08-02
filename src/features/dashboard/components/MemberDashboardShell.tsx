import { PropsWithChildren } from "hono/jsx";
import { AuthUser } from "../../../../types";
import { CreatorClaimStatus } from "../../../db/schema";
import CollectorDashboardShell from "./CollectorDashboardShell";
import CreatorDashboardShell from "./CreatorDashboardShell";

type Props = PropsWithChildren<{
  user: AuthUser;
  currentPath: string;
  claimStatus?: CreatorClaimStatus | null;
}>;

/** Picks creator vs collector dashboard chrome for shared member routes. */
const MemberDashboardShell = ({
  user,
  currentPath,
  claimStatus = null,
  children,
}: Props) => {
  if (user.creator) {
    return (
      <CreatorDashboardShell
        currentPath={currentPath}
        user={user}
        claimStatus={claimStatus}
      >
        {children}
      </CreatorDashboardShell>
    );
  }

  return (
    <CollectorDashboardShell currentPath={currentPath}>
      {children}
    </CollectorDashboardShell>
  );
};

export default MemberDashboardShell;
