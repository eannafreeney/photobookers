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
      <div class="min-h-screen flex items-center justify-center bg-surface">
        <div class="card w-96 bg-surface shadow-none border-none my-4">
          <div class="card-body">
            <div id="register-form">
              <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4 mb-6 text-center">
                <span class="kicker text-accent">Join Photobookers</span>
                <h2 class="font-display text-3xl font-medium text-on-surface-strong">
                  Create{" "}
                  {registerType === "fan" ? "" : capitalize(registerType)}{" "}
                  Account
                </h2>
              </div>
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
