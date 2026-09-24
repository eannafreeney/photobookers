import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import SectionTitle from "../../../../components/app/SectionTitle";
import Link from "../../../../components/app/Link";
import Button from "../../../../components/app/Button";
import Table from "../../../../components/app/Table";
import { getFlash, getUser } from "../../../../utils";
import {
  getPrintersAdmin,
  getRecentQuoteRequests,
} from "../../../../features/dashboard/admin/printers/services";
import InfoPage from "../../../../pages/InfoPage";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const [listError, printers] = await getPrintersAdmin();
  if (listError) {
    return c.html(<InfoPage errorMessage={listError.reason} user={user} />);
  }
  const [requestsError, requests] = await getRecentQuoteRequests();
  if (requestsError) {
    return c.html(<InfoPage errorMessage={requestsError.reason} user={user} />);
  }

  return c.html(
    <AppLayout title="Printers" user={user} flash={flash} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <div class="flex flex-col gap-8">
            <div class="flex items-center justify-between gap-4">
              <SectionTitle>Printers</SectionTitle>
              <Link href="/dashboard/admin/printers/create">
                <Button variant="solid" color="primary" width="auto">
                  New printer
                </Button>
              </Link>
            </div>
            <Table id="printers-table">
              <Table.Head>
                <tr>
                  <Table.HeadRow>Name</Table.HeadRow>
                  <Table.HeadRow>Status</Table.HeadRow>
                  <Table.HeadRow>Requests</Table.HeadRow>
                  <Table.HeadRow>People</Table.HeadRow>
                  <Table.HeadRow>Failed emails</Table.HeadRow>
                  <Table.HeadRow>Notes</Table.HeadRow>
                </tr>
              </Table.Head>
              <Table.Body>
                {printers.map((printer) => (
                  <tr>
                    <Table.BodyRow>
                      <Link href={`/dashboard/admin/printers/${printer.id}`}>
                        {printer.name}
                      </Link>
                      <div class="text-xs text-on-surface-weak">
                        {printer.city}, {printer.country}
                      </div>
                    </Table.BodyRow>
                    <Table.BodyRow>{printer.status}</Table.BodyRow>
                    <Table.BodyRow>{printer.requests}</Table.BodyRow>
                    <Table.BodyRow>{printer.people}</Table.BodyRow>
                    <Table.BodyRow>{printer.failed}</Table.BodyRow>
                    <Table.BodyRow>{printer.notes}</Table.BodyRow>
                  </tr>
                ))}
              </Table.Body>
            </Table>

            <SectionTitle>Recent requests</SectionTitle>
            <Table id="printer-requests-table">
              <Table.Head>
                <tr>
                  <Table.HeadRow>When</Table.HeadRow>
                  <Table.HeadRow>From</Table.HeadRow>
                  <Table.HeadRow>Printers</Table.HeadRow>
                </tr>
              </Table.Head>
              <Table.Body>
                {requests.map((request) => (
                  <tr>
                    <Table.BodyRow>
                      {request.createdAt.toISOString().slice(0, 10)}
                    </Table.BodyRow>
                    <Table.BodyRow>
                      {[request.user.firstName, request.user.lastName]
                        .filter(Boolean)
                        .join(" ") || request.user.email}
                    </Table.BodyRow>
                    <Table.BodyRow>
                      {request.recipients
                        .map((recipient) => {
                          const status = recipient.emailError
                            ? "failed"
                            : recipient.emailSentAt
                              ? "sent"
                              : "pending";
                          return `${recipient.printer.name} (${status})`;
                        })
                        .join(", ")}
                    </Table.BodyRow>
                  </tr>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
