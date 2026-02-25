import RegisterCreatorForm from "../../components/cms/forms/RegisterCreatorForm";
import RegisterFanForm from "../../components/cms/forms/RegisterFanForm";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import { capitalize } from "../../utils";

type RegisterPageProps = {
  type: "fan" | "artist" | "publisher";
  redirectUrl?: string;
};

const RegisterPage = ({ type, redirectUrl }: RegisterPageProps) => {
  const intendedCreatorType = type === "artist" || type === "publisher";

  return (
    <HeadlessLayout title="Create Account">
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-96 bg-base-100 shadow-none border-none my-4">
          <div class="card-body">
            <h2 class="text-2xl font-bold text-center mb-4">
              Create {type === "fan" ? "" : capitalize(type)} Account
            </h2>
            {intendedCreatorType ? (
              <RegisterCreatorForm type={type} />
            ) : (
              <RegisterFanForm redirectUrl={redirectUrl} />
            )}
          </div>
        </div>
      </div>
    </HeadlessLayout>
  );
};

export default RegisterPage;
