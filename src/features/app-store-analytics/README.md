# App Store Connect downloads (admin analytics)

Server-side App Store Connect Sales and Trends reports for the admin analytics dashboard (`/dashboard/admin/analytics`, App analytics tab).

## Environment variables

| Variable | Description |
|----------|-------------|
| `ASC_KEY_ID` | 10-character App Store Connect API key ID |
| `ASC_ISSUER_ID` | Issuer ID UUID from Users and Access → Integrations |
| `ASC_PRIVATE_KEY` | Contents of the downloaded `.p8` file (use `\n` for newlines in a single-line env value) |
| `ASC_VENDOR_NUMBER` | Vendor number from Payments and Financial Reports |
| `ASC_APP_ID` | Optional. Defaults to the public App Store ID (`6771879476`) |

The API key needs **Finance** (or Sales) access to read download reports.

If these variables are unset, the App analytics tab shows a friendly “not configured” message.

## Notes

- Data comes from Apple's daily Sales `SUMMARY` reports.
- Reports are typically delayed 24–48 hours.
- Recent days may return no report yet (treated as zero downloads).
