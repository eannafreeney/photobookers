import PublisherForm from "../components/cms/forms/PublisherForm";
import { DashboardLayout } from "../components/layouts/DashboardLayout";

const PublisherNewPage = () => {
  return (
    <DashboardLayout title="Create Publisher Profile">
      Sign Up as a publisher on Photobookers
      <PublisherForm />
    </DashboardLayout>
  );
};
export default PublisherNewPage;
