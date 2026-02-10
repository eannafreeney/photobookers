import { Flash } from "../../../types";
import LoginForm from "../../components/cms/forms/LoginForm";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";

type Props = {
  redirectUrl?: string | null;
  flash?: Flash | null;
};

const LoginPage = ({ redirectUrl, flash }: Props) => {
  return (
    <HeadlessLayout title="Sign In" flash={flash}>
      <div class="min-h-screen flex items-center justify-center bg-surface px-4">
        <div class="w-96 bg-white border-none shadow-md rounded-radius ">
          <div class="p-8">
            <h2 class="text-2xl font-bold mb-4">Sign In</h2>
            <LoginForm redirectUrl={redirectUrl} />
          </div>
        </div>
      </div>
    </HeadlessLayout>
  );
};

export default LoginPage;
