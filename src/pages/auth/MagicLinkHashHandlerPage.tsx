import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import Page from "../../components/layouts/Page";

const MagicLinkHashHandlerPage = () => (
  <HeadlessLayout title="Signing you in...">
    <Page>
      <div
        class="min-h-screen flex items-center justify-center bg-base-200"
        x-data="magicLinkHashHandler()"
        x-init="init()"
      >
        <div class="card w-96 bg-base-100 shadow-none border-none my-4">
          <div class="card-body">
            <p class="text-center">Setting up your session...</p>
            <span class="loading loading-dots loading-lg mx-auto block" />
          </div>
        </div>
      </div>
    </Page>
  </HeadlessLayout>
);

export default MagicLinkHashHandlerPage;
