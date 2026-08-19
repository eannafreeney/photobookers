import Banner from "../../../components/app/Banner";
import Link from "../../../components/app/Link";
import Button from "../../../components/app/Button";
import { Creator } from "../../../db/schema";

type Props = {
  creator: Pick<Creator, "id" | "slug" | "status">;
};

const checklistItems = (creator: Pick<Creator, "id" | "slug">) => [
  {
    label: "Edit your profile",
    href: `/dashboard/creators/${creator.id}`,
  },
  {
    label: "Open analytics",
    href: "/dashboard/analytics",
  },
  {
    label: "Write your first post",
    href: "/dashboard/posts",
  },
  {
    label: "View your public profile",
    href: `/creators/${creator.slug}`,
  },
];

const ClaimSuccessChecklist = ({ creator }: Props) => {
  if (creator.status !== "verified") return <></>;

  const persistKey = `claim-success-checklist-${creator.id}`;

  return (
    <div
      x-cloak
      x-data={`{ show: $persist(true).as('${persistKey}') }`}
      x-show="show"
    >
      <Banner
        type="success"
        message="You're verified! Here's how to get the most from your profile:"
      >
        <div class="flex flex-col items-center gap-3">
          <ul class="flex flex-wrap justify-center gap-2 text-sm">
            {checklistItems(creator).map((item) => (
              <li key={item.label} class="list-none">
                <Link href={item.href}>
                  <Button variant="outline" color="primary">
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            x-on:click="show = false"
            class="text-sm cursor-pointer hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      </Banner>
    </div>
  );
};

export default ClaimSuccessChecklist;
