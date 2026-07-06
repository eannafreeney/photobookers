import { err, ok } from "../../lib/result.js";
function getGa4Config() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const json = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (!propertyId || !json) {
    return err({ reason: "Google Analytics is not configured" });
  }
  try {
    const credentials = JSON.parse(json);
    if (!credentials.client_email || !credentials.private_key) {
      return err({
        reason: "GA4_SERVICE_ACCOUNT_JSON is missing required service account fields"
      });
    }
    return ok({ propertyId, credentials });
  } catch {
    return err({ reason: "GA4_SERVICE_ACCOUNT_JSON is invalid JSON" });
  }
}
export {
  getGa4Config
};
