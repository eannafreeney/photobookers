import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import Button from "../../components/app/Button";
import { Context } from "hono";
import {
  accountFeatures,
  accountMobileCards,
} from "../../features/auth/accountsContent";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (user) return c.redirect("/");

  return c.html(
    <HeadlessLayout title="Accounts">
      <Page>
        <PageHeader
          kicker="Join Photobookers"
          title="Choose your account"
          intro="Collector, artist, or publisher — pick the account that fits how you live with photobooks."
        />
        {/* Mobile: cards */}
        <div class="md:hidden space-y-4">
          {accountMobileCards.map((account) => (
            <div
              key={account.slug}
              class="border-t-2 border-on-surface-strong bg-surface pt-4 pb-6 flex flex-col gap-4"
            >
              <h3 class="font-display text-2xl font-medium text-on-surface-strong">
                {account.type}
              </h3>
              <ul class="list-disc list-inside text-sm text-on-surface space-y-1">
                {account.features.map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
              <a href={`/auth/register?type=${account.slug}`} class="mt-auto">
                <Button variant="solid" color="primary" width="full">
                  Sign up
                </Button>
              </a>
            </div>
          ))}
        </div>
        {/* Desktop View */}
        <div class="hidden md:block overflow-hidden w-full overflow-x-auto border-y-2 border-on-surface-strong">
          <table class="w-full table-fixed text-left text-sm text-on-surface">
            <thead class="border-b border-outline-strong kicker text-on-surface-strong">
              <tr>
                <th scope="col" class="p-4">
                  Feature
                </th>
                <th scope="col" class="p-4 text-center">
                  Collector
                </th>
                <th scope="col" class="p-4 text-center">
                  Artist / Self-Publisher
                </th>
                <th scope="col" class="p-4 text-center">
                  Publisher
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline dark:divide-outline-dark">
              {accountFeatures.map((feature) => (
                <tr>
                  <td class="p-4 font-medium">{feature.name}</td>
                  <td class="p-4 text-center">{feature.fan && <Check />}</td>
                  <td class="p-4 text-center">{feature.artist && <Check />}</td>
                  <td class="p-4 text-center">
                    {feature.publisher && <Check />}
                  </td>
                </tr>
              ))}
              {/* Sign up row */}
              <tr class="bg-surface-alt/50 dark:bg-surface-dark-alt/50">
                <td class="p-4"></td>
                <td class="p-4 text-center">
                  <a href="/auth/register?type=fan">
                    <Button variant="solid" color="primary" width="md">
                      Sign up
                    </Button>
                  </a>
                </td>
                <td class="p-4 text-center">
                  <a href="/auth/register?type=artist">
                    <Button variant="solid" color="primary" width="md">
                      Sign up
                    </Button>
                  </a>
                </td>
                <td class="p-4 text-center">
                  <a href="/auth/register?type=publisher">
                    <Button variant="solid" color="primary" width="md">
                      Sign up
                    </Button>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Page>
    </HeadlessLayout>,
  );
});

const Check = () => (
  <svg
    class="w-5 h-5 text-green-500 mx-auto"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fill-rule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clip-rule="evenodd"
    />
  </svg>
);
