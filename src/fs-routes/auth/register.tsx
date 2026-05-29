import { createRoute } from "hono-fsr";
import { capitalize, getUser } from "../../utils";
import { Context } from "hono";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import RegisterCreatorForm from "../../features/auth/forms/RegisterCreatorForm";
import RegisterFanForm from "../../features/auth/forms/RegisterFanForm";
import { parseRegisterType } from "../../features/auth/schema";

export const GET = createRoute(async (c: Context) => {
  const registerType = parseRegisterType(c.req.query("type"));
  const user = await getUser(c);
  const redirectUrl = c.req.query("redirectUrl") ?? "";
  if (user) return c.redirect("/");

  const intendedCreatorType =
    registerType === "artist" || registerType === "publisher";

  return c.html(
    <HeadlessLayout title="Create Account">
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-96 bg-base-100 shadow-none border-none my-4">
          <div class="card-body">
            <div id="register-form">
              <h2 class="text-2xl font-bold text-center mb-4">
                Create{" "}
                {registerType === "fan" ? "" : capitalize(registerType)} Account
              </h2>
              {intendedCreatorType ? (
                <RegisterCreatorForm type={registerType} />
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
