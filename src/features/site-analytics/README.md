# GA4 site traffic (admin analytics)

Server-side Google Analytics 4 reports for the admin analytics dashboard (`/dashboard/admin/analytics`).

## Environment variables

| Variable | Description |
|----------|-------------|
| `GA4_PROPERTY_ID` | Numeric GA4 property ID (Admin → Property settings). Not the `G-XXXX` measurement ID. |
| `GA4_SERVICE_ACCOUNT_JSON` | Full service account key JSON as a single-line string. Never commit this value. |

Client pageviews use `GA_MEASUREMENT_ID` / `VITE_GA_MEASUREMENT_ID` in `Head.tsx` (separate from the Data API).

## One-time Google Cloud + GA4 setup

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Google Analytics Data API** for your project.
2. Create a **service account** and generate a JSON key.
3. In GA4 → **Admin** → **Property access management**, add the service account email as **Viewer**.
4. Copy the numeric **Property ID** from GA4 property settings.
5. Set `GA4_PROPERTY_ID` and `GA4_SERVICE_ACCOUNT_JSON` in production (e.g. `.env.production`).

If these variables are unset, the Site traffic section shows a friendly “not configured” message; book analytics still works.

## Local development

Omit the GA4 env vars to skip API calls. Set them when you want to verify reports against the GA4 UI.
