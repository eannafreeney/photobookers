import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Sidebar from "../../../components/app/Sidebar";
import PageHeader from "../../../components/app/PageHeader";
import {
  getContributorLeaderboard,
  type LeaderboardEntry,
} from "../../../domain/contributors/services";

function displayName(entry: LeaderboardEntry) {
  return (
    [entry.firstName, entry.lastName].filter(Boolean).join(" ") || "Anonymous"
  );
}

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const leaderboard = await getContributorLeaderboard();

  return c.html(
    <AppLayout title="Contributor Leaderboard" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <PageHeader title="Contributor Leaderboard" />
          {leaderboard.length > 0 ? (
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-outline text-on-surface-weak">
                  <th class="py-2 pr-4 w-8">#</th>
                  <th class="py-2 pr-4">Name</th>
                  <th class="py-2 pr-4 text-right">Books</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr class="border-b border-outline">
                    <td class="py-2 pr-4 text-on-surface-weak">{i + 1}</td>
                    <td class="py-2 pr-4">
                      <a
                        href={`/dashboard/admin/users/${entry.id}`}
                        class="font-medium text-on-surface-strong hover:underline"
                      >
                        {displayName(entry)}
                      </a>
                    </td>
                    <td class="py-2 pr-4 text-right">{entry.bookCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p class="text-on-surface-weak mt-4">No contributors yet.</p>
          )}
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
