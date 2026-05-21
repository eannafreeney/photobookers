/** @type {import("@expo/config").ExpoConfig} */
const base = require("./app.json").expo;

function appTransportSecurity() {
  const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  const isLocalDevServer = serverUrl.startsWith("http://");

  if (isLocalDevServer) {
    // Dev: allow HTTP to localhost and LAN IPs (e.g. http://192.168.x.x:5173).
    return {
      NSAllowsLocalNetworking: true,
      NSExceptionDomains: {
        localhost: {
          NSExceptionAllowsInsecureHTTPLoads: true,
        },
      },
    };
  }

  // Production: default ATS (HTTPS only). No NSAllowsArbitraryLoads.
  return {
    NSExceptionDomains: {
      localhost: {
        NSExceptionAllowsInsecureHTTPLoads: true,
      },
    },
  };
}

/** @param {import("@expo/config").ConfigContext} ctx */
module.exports = ({ config }) => ({
  ...config,
  ...base,
  extra: {
    ...base.extra,
    ...config.extra,
  },
  ios: {
    ...base.ios,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: appTransportSecurity(),
    },
  },
});
