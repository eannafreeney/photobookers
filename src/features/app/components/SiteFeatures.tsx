import Card from "../../../components/app/Card";
import {
  bookIcon,
  editIcon,
  fullHeartIcon,
  mailIcon,
  stars,
  usersIcon,
} from "../../../lib/icons";
import type { ChildType } from "../../../../types";
import { log } from "console";

export const tickerItems = [
  {
    title: "Follow your favorite artists and publishers",
    icon: usersIcon,
  },
  {
    title: "Wishlist your favorite books",
    icon: fullHeartIcon(),
  },
  {
    title: "Collect your favorite books",
    icon: bookIcon,
  },
  {
    title: "Join the Newsletter",
    icon: stars,
  },
  {
    title: "Share what you loved about a book",
    icon: editIcon,
  },
  {
    title: "Join the Newsletter and be updated about new books",
    icon: mailIcon,
  },
];

const SiteFeatures = () => {
  return (
    <div class="grid grid-cols-2 gap-4 mx-auto">
      {tickerItems.map((item) => (
        <FeatureCard key={item.title} item={item} />
      ))}
    </div>
  );
};

export default SiteFeatures;

const FeatureCard = ({
  item,
}: {
  item: { title: string; icon: ChildType };
}) => {
  return (
    <Card className="">
      <Card.Body>
        <div className="flex items-center justify-center gap-2 min-w-64">
          <span className="text-xs">{item.icon}</span>
          <Card.Title>{item.title}</Card.Title>
        </div>
      </Card.Body>
    </Card>
  );
};
