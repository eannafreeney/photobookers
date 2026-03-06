import { getHostname } from "../../services/verification";

export const emailMatchesWebsite = (
  email: string,
  websiteUrl: string,
): boolean => {
  const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
  const websiteHost = getHostname(websiteUrl);
  return emailDomain.length > 0 && emailDomain === websiteHost;
};
