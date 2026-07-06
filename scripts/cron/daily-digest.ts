/**
 * Email a summary of recent Production cron jobs workflow runs.
 *
 *   ENV=production GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo npx tsx scripts/cron/daily-digest.ts
 *
 * Optional env: DIGEST_HOURS (default 24)
 */
import "../env";
import { sendAdminEmail } from "../../src/lib/sendEmail";

const WORKFLOW_FILE = "production-cron.yml";
const DEFAULT_HOURS = 24;

type GitHubJob = {
  name: string;
  conclusion: string | null;
  status: string;
  html_url: string;
  started_at: string | null;
  completed_at: string | null;
};

type GitHubWorkflowRun = {
  id: number;
  html_url: string;
  event: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  run_started_at: string | null;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function githubFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

function formatUtcTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function statusLabel(conclusion: string | null, status: string): string {
  if (conclusion === "success") return "OK";
  if (conclusion === "failure") return "FAILED";
  if (conclusion === "cancelled") return "cancelled";
  if (conclusion === "skipped") return "skipped";
  if (status === "in_progress" || status === "queued") return status;
  return conclusion ?? status;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function listWorkflowRuns(
  token: string,
  repo: string,
  since: Date,
): Promise<GitHubWorkflowRun[]> {
  const runs: GitHubWorkflowRun[] = [];
  let page = 1;

  while (page <= 5) {
    const data = await githubFetch<{ workflow_runs: GitHubWorkflowRun[] }>(
      token,
      `/repos/${repo}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=100&page=${page}`,
    );
    if (data.workflow_runs.length === 0) break;

    for (const run of data.workflow_runs) {
      if (new Date(run.created_at) < since) return runs;
      runs.push(run);
    }
    page += 1;
  }

  return runs;
}

async function listRunJobs(
  token: string,
  repo: string,
  runId: number,
): Promise<GitHubJob[]> {
  const data = await githubFetch<{ jobs: GitHubJob[] }>(
    token,
    `/repos/${repo}/actions/runs/${runId}/jobs?per_page=100`,
  );
  return data.jobs;
}

function buildDigestHtml(params: {
  repo: string;
  hours: number;
  since: Date;
  jobs: Array<GitHubJob & { runUrl: string; runEvent: string }>;
}): string {
  const { repo, hours, since, jobs } = params;
  const failures = jobs.filter((job) => job.conclusion === "failure");
  const actionsUrl = `https://github.com/${repo}/actions/workflows/${WORKFLOW_FILE}`;

  const rows =
    jobs.length === 0
      ? `<tr><td colspan="4" style="padding:12px;color:#666;">No cron jobs ran in the last ${hours} hours.</td></tr>`
      : jobs
          .map((job) => {
            const label = statusLabel(job.conclusion, job.status);
            const color =
              label === "FAILED"
                ? "#a22c29"
                : label === "OK"
                  ? "#2f6b3c"
                  : "#666";
            return `<tr>
  <td style="padding:8px 12px;border-top:1px solid #e4e0d5;">${escapeHtml(job.name)}</td>
  <td style="padding:8px 12px;border-top:1px solid #e4e0d5;color:${color};font-weight:600;">${escapeHtml(label)}</td>
  <td style="padding:8px 12px;border-top:1px solid #e4e0d5;">${escapeHtml(formatUtcTime(job.completed_at ?? job.started_at))}</td>
  <td style="padding:8px 12px;border-top:1px solid #e4e0d5;"><a href="${escapeHtml(job.html_url)}">logs</a></td>
</tr>`;
          })
          .join("");

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#45413a;max-width:720px;">
  <h1 style="font-size:20px;margin:0 0 8px;">Cron digest</h1>
  <p style="margin:0 0 16px;color:#666;">${escapeHtml(repo)} · last ${hours}h since ${formatUtcTime(since.toISOString())}</p>
  ${
    failures.length > 0
      ? `<p style="margin:0 0 16px;padding:12px;background:#fdeeed;border-left:4px solid #a22c29;"><strong>${failures.length} failure(s):</strong> ${failures.map((j) => escapeHtml(j.name)).join(", ")}</p>`
      : `<p style="margin:0 0 16px;padding:12px;background:#eef6ef;border-left:4px solid #2f6b3c;">All completed jobs succeeded.</p>`
  }
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f2efe8;text-align:left;">
        <th style="padding:8px 12px;">Job</th>
        <th style="padding:8px 12px;">Status</th>
        <th style="padding:8px 12px;">Completed</th>
        <th style="padding:8px 12px;">Link</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin:16px 0 0;font-size:13px;"><a href="${actionsUrl}">View all runs in GitHub Actions</a></p>
</div>`;
}

const token = requireEnv("GITHUB_TOKEN");
const repo = requireEnv("GITHUB_REPOSITORY");
const hours = Number(process.env.DIGEST_HOURS ?? DEFAULT_HOURS);
if (!Number.isFinite(hours) || hours <= 0) {
  throw new Error("DIGEST_HOURS must be a positive number");
}

const since = new Date(Date.now() - hours * 60 * 60 * 1000);
const runs = await listWorkflowRuns(token, repo, since);

const jobs: Array<GitHubJob & { runUrl: string; runEvent: string }> = [];
for (const run of runs) {
  const runJobs = await listRunJobs(token, repo, run.id);
  for (const job of runJobs) {
    if (job.conclusion === "skipped") continue;
    jobs.push({ ...job, runUrl: run.html_url, runEvent: run.event });
  }
}

jobs.sort((a, b) => {
  const aTime = a.completed_at ?? a.started_at ?? "";
  const bTime = b.completed_at ?? b.started_at ?? "";
  return bTime.localeCompare(aTime);
});

const failures = jobs.filter((job) => job.conclusion === "failure").length;
const day = new Date().toISOString().slice(0, 10);
const subject =
  failures > 0
    ? `Cron digest ${day} — ${failures} failure${failures === 1 ? "" : "s"}`
    : `Cron digest ${day} — all OK`;

const html = buildDigestHtml({ repo, hours, since, jobs });
const [error] = await sendAdminEmail(subject, html);
if (error) {
  console.error("Failed to send cron digest:", error.reason);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      subject,
      runs: runs.length,
      jobs: jobs.length,
      failures,
    },
    null,
    2,
  ),
);
