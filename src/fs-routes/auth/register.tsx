import { createRoute } from "hono-fsr";
import { capitalize, getUser } from "../../utils";
import { Context } from "hono";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import RegisterCreatorForm from "../../features/auth/forms/RegisterCreatorForm";
import RegisterFanForm from "../../features/auth/forms/RegisterFanForm";

export const GET = createRoute(async (c: Context) => {
  const type = c.req.query("type") as "fan" | "artist" | "publisher";
  const user = await getUser(c);
  const redirectUrl = c.req.query("redirectUrl") ?? "";
  if (user) return c.redirect("/");

  const intendedCreatorType = type === "artist" || type === "publisher";

  return c.html(
    <HeadlessLayout title="Create Account">
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-96 bg-base-100 shadow-none border-none my-4">
          <div class="card-body">
            <div id="register-form">
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
      </div>
    </HeadlessLayout>,
  );
});
