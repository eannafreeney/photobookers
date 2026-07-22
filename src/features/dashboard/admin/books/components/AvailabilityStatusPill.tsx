import Pill from "../../../../../components/app/Pill";
import { capitalize } from "../../../../../utils";
import { BookAvailabilityStatus } from "../../../../../db/schema";

type Props = { availabilityStatus: BookAvailabilityStatus };

const AvailabilityStatusPill = ({
  availabilityStatus = "available",
}: Props) => {
  if (!availabilityStatus) return null;
  return (
    <Pill
      variant={
        availabilityStatus === "available"
          ? "success"
          : availabilityStatus === "sold_out"
            ? "danger"
            : "warning"
      }
    >
      {availabilityStatus === "sold_out"
        ? "Sold Out"
        : capitalize(availabilityStatus)}
    </Pill>
  );
};

export default AvailabilityStatusPill;
