import Button from "../../../components/app/Button";
import HeadlessLayout from "../../../components/layouts/HeadlessLayout";
import Page from "../../../components/layouts/Page";

type SignUpSuccessPageProps = {
  name: string;
  message?: string;
};

const SignUpSuccessPage = ({
  name,
  message = "Check your email for verification.",
}: SignUpSuccessPageProps) => {
  return (
    <HeadlessLayout title="Sign Up Success">
      <Page>
        <h1>Sign Up Success</h1>
        <p>Hi ${name}! Your account has been created successfully.</p>
        <p>{message}</p>
        <a href="/">
          <Button variant="solid" color="primary">
            Go to Homepage
          </Button>
        </a>
      </Page>
    </HeadlessLayout>
  );
};
export default SignUpSuccessPage;
