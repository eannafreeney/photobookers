import Button from "../../components/app/Button";
import SectionTitle from "../../components/app/SectionTitle";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import Page from "../../components/layouts/Page";

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

const features = [
  {
    name: "Follow Artists & Publishers",
    fan: true,
    artist: true,
    publisher: true,
  },
  { name: "Wishlist Books", fan: true, artist: true, publisher: true },
  { name: "Add Books to Collection", fan: true, artist: true, publisher: true },
  { name: "View Your Feed", fan: true, artist: true, publisher: true },
  { name: "View Your Profile", fan: true, artist: true, publisher: true },
  { name: "Upload Your Books", fan: false, artist: true, publisher: true },
  { name: "Manage Your Books", fan: false, artist: true, publisher: true },
];

const mobileFeatures = [
  {
    type: "Fan" as const,
    slug: "fan",
    features: features.filter((f) => f.fan),
  },
  {
    type: "Artist" as const,
    slug: "artist",
    features: features.filter((f) => f.artist),
  },
  {
    type: "Publisher" as const,
    slug: "publisher",
    features: features.filter((f) => f.publisher),
  },
];

const AccountsPage = () => {
  return (
    <HeadlessLayout title="Accounts">
      <Page>
        <SectionTitle>Accounts</SectionTitle>
        {/* Mobile: cards */}
        <div class="md:hidden space-y-4">
          {mobileFeatures.map((account) => (
            <div
              key={account.slug}
              class="rounded-radius border border-outline bg-surface-alt p-4 flex flex-col gap-4"
            >
              <h3 class="text-lg font-semibold text-on-surface-strong">
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
        <div class="hidden md:block overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
          <table class="w-full text-left text-sm text-on-surface">
            <thead class="border-b border-outline bg-surface-alt text-sm text-on-surface-strong">
              <tr>
                <th scope="col" class="p-4">
                  Feature
                </th>
                <th scope="col" class="p-4 text-center">
                  Fan
                </th>
                <th scope="col" class="p-4 text-center">
                  Artist
                </th>
                <th scope="col" class="p-4 text-center">
                  Publisher
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline dark:divide-outline-dark">
              {features.map((feature) => (
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
                    <Button variant="solid" color="primary">
                      Sign up
                    </Button>
                  </a>
                </td>
                <td class="p-4 text-center">
                  <a href="/auth/register?type=artist">
                    <Button variant="solid" color="primary">
                      Sign up
                    </Button>
                  </a>
                </td>
                <td class="p-4 text-center">
                  <a href="/auth/register?type=publisher">
                    <Button variant="solid" color="primary">
                      Sign up
                    </Button>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Page>
    </HeadlessLayout>
  );
};

export default AccountsPage;
