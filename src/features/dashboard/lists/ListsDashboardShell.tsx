import { AuthUser } from "../../../../types";
import CollectorDashboardShell from "../components/CollectorDashboardShell";
import { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  user: AuthUser;
  currentPath: string;
}>;

/** Lists are collector-only. */
const ListsDashboardShell = ({ currentPath, children }: Props) => {
  return (
    <CollectorDashboardShell currentPath={currentPath}>
      {children}
    </CollectorDashboardShell>
  );
};

export default ListsDashboardShell;
