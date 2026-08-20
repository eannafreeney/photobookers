import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import Button from "../../../components/app/Button";
import PromotedListCard from "@/features/app/components/PromotedListCard";
import { getPromotedLists } from "@/domain/lists/services";

export const GET = createRoute(async (c) => {
  const [error, lists] = await getPromotedLists(8);

  if (error || !lists?.length) return c.html(<></>);

  return c.html(
    <div id="lists-fragment">
      <SectionHeader kicker="From collectors" action={<ViewAllLink href="/lists" />}>
        Lists
      </SectionHeader>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex min-w-max items-stretch gap-4 pr-4">
          {lists.map((list) => (
            <PromotedListCard list={list} />
          ))}
        </div>
      </div>
      <div class="mt-8 flex md:hidden justify-center">
        <a href="/lists">
          <Button variant="solid" color="primary" width="xl">
            View All Lists →
          </Button>
        </a>
      </div>
    </div>,
  );
});
