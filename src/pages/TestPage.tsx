import TestForm from "../components/cms/forms/TestForm";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";

const TestPage = () => {
  return (
    <AppLayout title="Test">
      <Page>
        <TestForm />
        <div id="test-form-content"></div>
      </Page>
    </AppLayout>
  );
};
export default TestPage;
