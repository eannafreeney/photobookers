import { BookAvailabilityStatus } from "../../db/schema";
import Badge from "./Badge";

type BadgeVariant = "success" | "danger" | "warning";

type Props = {
  availabilityStatus: BookAvailabilityStatus;
};

const AvailabilityBadge = ({ availabilityStatus = "available" }: Props) => {
  let text;
  let variant: BadgeVariant;
  switch (availabilityStatus) {
    case "available":
      text = "Available";
      variant = "success";
      break;
    case "sold_out":
      text = "Sold Out";
      variant = "danger";
      break;
    case "unavailable":
      text = "Unavailable";
      variant = "warning";
      break;
  }

  return <Badge variant={variant}>{text}</Badge>;
};
export default AvailabilityBadge;
