import RegisterForm from "../../components/cms/forms/RegisterForm";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import { capitalize } from "../../utils";

type RegisterPageProps = {
  type: "fan" | "artist" | "publisher";
};

const RegisterPage = ({ type = "fan" }: RegisterPageProps) => {
  return (
    <HeadlessLayout title="Create Account">
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-96 bg-base-100 shadow-none border-none my-4">
          <div class="card-body">
            <h2 class="text-2xl font-bold text-center mb-0">
              Create {capitalize(type)} Account
            </h2>
            <RegisterForm type={type} />
          </div>
        </div>
      </div>
    </HeadlessLayout>
  );
};

export default RegisterPage;
