import { err, ok, type Result } from "../../lib/result";

export type Ga4Config = {
  propertyId: string;
  credentials: Record<string, unknown>;
};

export function getGa4Config(): Result<Ga4Config, { reason: string }> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const json = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();

  if (!propertyId || !json) {
    return err({ reason: "Google Analytics is not configured" });
  }

  try {
    const credentials = JSON.parse(json) as Record<string, unknown>;
    if (!credentials.client_email || !credentials.private_key) {
      return err({
        reason: "GA4_SERVICE_ACCOUNT_JSON is missing required service account fields",
      });
    }
    return ok({ propertyId, credentials });
  } catch {
    return err({ reason: "GA4_SERVICE_ACCOUNT_JSON is invalid JSON" });
  }
}
