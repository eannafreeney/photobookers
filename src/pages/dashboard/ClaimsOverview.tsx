import { CreatorClaim, Creator } from "../../db/schema";
import ClaimsTable from "../../components/cms/ui/ClaimsTable";

type ClaimsOverviewProps = {
  claims: CreatorClaim[];
  creatorsWithClaims: Creator[];
};

const ClaimsOverview = ({
  claims,
  creatorsWithClaims,
}: ClaimsOverviewProps) => {
  return (
    <div>
      <ClaimsTable claims={claims} creatorsWithClaims={creatorsWithClaims} />
    </div>
  );
};
export default ClaimsOverview;
