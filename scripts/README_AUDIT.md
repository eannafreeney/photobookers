# Weekly Code Audit Setup

This directory contains scripts for automated weekly code audits using the Cursor SDK.

## Files

- `weekly-audit.ts` - Main audit script that calls Cursor AI
- `run-weekly-audit.sh` - Shell wrapper for cron execution

## Setup

### 1. Get Your Cursor API Key

Visit https://cursor.com/dashboard/integrations to generate an API key.

For team projects, you can also use service account keys from Team Settings → Service accounts.

### 2. Set the API Key

Add to your environment or `.env` file:

```bash
export CURSOR_API_KEY="cursor_..."
```

**Important:** Never commit your API key to git. Add `.env` to `.gitignore`.

### 3. Test the Script Manually

```bash
# From project root
./scripts/run-weekly-audit.sh
```

This will generate a file like `AUDIT_2026-06-22.md` in your project root.

### 4. Set Up the Cron Job

Run `crontab -e` and add:

```cron
# Run every Monday at 9:00 AM
0 9 * * 1 /Users/eannafreeney/Code/photobookers/scripts/run-weekly-audit.sh

# Or run every Sunday at 11:00 PM
0 23 * * 0 /Users/eannafreeney/Code/photobookers/scripts/run-weekly-audit.sh
```

Cron format: `minute hour day month weekday`

### Verify Cron Job

```bash
# List your cron jobs
crontab -l

# Check audit logs
tail -f logs/audit.log
```

## Customization

### Change the Audit Focus

Edit `AUDIT_PROMPT` in `weekly-audit.ts` to focus on specific areas:
- Security vulnerabilities
- Performance issues
- TypeScript type coverage
- Test coverage gaps
- Documentation quality

### Post-Audit Actions

The script can be extended to:

1. **Email the report:**
```typescript
import nodemailer from 'nodemailer';
// Send email with audit results
```

2. **Create a GitHub issue:**
```typescript
import { Octokit } from '@octokit/rest';
// Create issue with audit findings
```

3. **Post to Slack:**
```typescript
import { WebClient } from '@slack/web-api';
// Post summary to Slack channel
```

4. **Auto-commit to git:**
```bash
git add AUDIT_*.md
git commit -m "chore: weekly audit $(date +%Y-%m-%d)"
git push origin main
```

### Use Cloud Runtime

For longer audits or to avoid tying up your local machine, use cloud agents:

```typescript
const result = await Agent.prompt(AUDIT_PROMPT, {
  apiKey: CURSOR_API_KEY,
  model: { id: "composer-2.5" },
  cloud: {
    repos: [{
      url: "https://github.com/your-org/photobookers",
      branch: "main"
    }],
    autoCreatePR: false, // Set to true to create PR with fixes
    skipReviewerRequest: true // Don't notify reviewers
  },
});
```

## Troubleshooting

### "CURSOR_API_KEY not set"
- Make sure the key is exported in your shell environment
- For cron, add the key to the shell script or use absolute path to `.env`

### Cron job not running
- Check system logs: `grep CRON /var/log/system.log` (macOS)
- Ensure full absolute paths in crontab
- Test the shell script manually first

### TypeScript errors
- Run `npm install` to ensure `@cursor/sdk` and `tsx` are installed
- Check Node.js version: `node --version` (requires Node 16+)

## Cost Considerations

Each audit uses Cursor AI API credits. Monitor usage at https://cursor.com/dashboard

Typical audit cost depends on:
- Project size
- Model chosen (composer-2.5 is efficient)
- Complexity of analysis

Consider running bi-weekly or monthly for larger projects.
