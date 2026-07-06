import { SITE_APP } from "../../constants/siteSocial.js";
import { err, ok } from "../../lib/result.js";
function normalizePrivateKey(raw) {
  return raw.replace(/\\n/g, "\n").trim();
}
function getAscConfig() {
  const keyId = process.env.ASC_KEY_ID?.trim();
  const issuerId = process.env.ASC_ISSUER_ID?.trim();
  const privateKeyRaw = process.env.ASC_PRIVATE_KEY?.trim();
  const vendorNumber = process.env.ASC_VENDOR_NUMBER?.trim();
  const appId = process.env.ASC_APP_ID?.trim() || SITE_APP.ios.appStoreId;
  if (!keyId || !issuerId || !privateKeyRaw || !vendorNumber) {
    return err({ reason: "App Store Connect is not configured" });
  }
  const privateKey = normalizePrivateKey(privateKeyRaw);
  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
    return err({ reason: "ASC_PRIVATE_KEY is missing required PEM markers" });
  }
  return ok({
    keyId,
    issuerId,
    privateKey,
    vendorNumber,
    appId
  });
}
export {
  getAscConfig
};
