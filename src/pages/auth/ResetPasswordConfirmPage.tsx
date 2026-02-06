import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import Input from "../../components/cms/ui/Input";
import Button from "../../components/app/Button";

const ResetPasswordConfirmPage = ({ code }: { code: string }) => {
  return (
    <AppLayout title="Reset Password">
      <Page>
        <div class="flex flex-col items-center justify-center min-h-[60vh]">
          <div class="w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6">Reset Your Password</h1>
            <p class="text-on-surface-weak mb-6">
              Enter your new password below.
            </p>
            
            <form action="/auth/reset-password/confirm" method="post" x-target="toast">
              <input type="hidden" name="code" value={code} />
              
              <div class="flex flex-col gap-4">
                <Input
                  type="password"
                  label="New Password"
                  name="password"
                  required
                  placeholder="At least 8 characters"
                />
                
                <Input
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  required
                  placeholder="Re-enter your password"
                />
                
                <Button type="submit" variant="solid" color="primary" className="w-full">
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default ResetPasswordConfirmPage;