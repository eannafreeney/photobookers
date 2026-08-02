import { AuthUser } from "../../../../types";
import MemberDashboardShell from "../components/MemberDashboardShell";
import { PropsWithChildren } from "hono/jsx";
import { CreatorClaimStatus } from "../../../db/schema";

type Props = PropsWithChildren<{
  user: AuthUser;
  currentPath: string;
  claimStatus?: CreatorClaimStatus | null;
}>;

/** Lists pages share member dashboard chrome (creator or collector). */
const ListsDashboardShell = ({
  user,
  currentPath,
  claimStatus = null,
  children,
}: Props) => {
  return (
    <MemberDashboardShell
      user={user}
      currentPath={currentPath}
      claimStatus={claimStatus}
    >
      {children}
    </MemberDashboardShell>
  );
};

export default ListsDashboardShell;
