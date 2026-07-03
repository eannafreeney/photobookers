import { execSync } from "node:child_process";

// Render sets RENDER=true on every service (production and staging). Build client
// bundles during `npm ci` so both deploys serve fresh admin/dashboard/main.js.
if (process.env.RENDER === "true") {
  execSync("npm run build", { stdio: "inherit" });
}
