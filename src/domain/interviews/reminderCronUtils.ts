export const REMINDER_INTERVAL_DAYS = 14;

export type OpenInterviewRow = {
  id: string;
  creatorId: string;
  creatorSlug: string;
  recipientEmail: string;
  inviteToken: string;
  invitedAt: Date;
  reminderSentAt: Date | null;
  creatorDisplayName: string;
};

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toUtcStartOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function reminderAnchorDate(
  row: Pick<OpenInterviewRow, "invitedAt" | "reminderSentAt">,
): Date {
  return row.reminderSentAt ?? row.invitedAt;
}

export function isDueForInterviewReminder(
  row: Pick<OpenInterviewRow, "invitedAt" | "reminderSentAt">,
  runDate: Date,
  intervalDays = REMINDER_INTERVAL_DAYS,
  force = false,
): boolean {
  if (force) return true;
  const cutoff = addUtcDays(toUtcStartOfDay(runDate), -intervalDays);
  return reminderAnchorDate(row) <= cutoff;
}

/** One reminder per creator — keep the most recently invited open interview. */
export function pickInterviewsForReminder(
  rows: OpenInterviewRow[],
): OpenInterviewRow[] {
  const byCreator = new Map<string, OpenInterviewRow>();
  for (const row of rows) {
    const existing = byCreator.get(row.creatorId);
    if (!existing || row.invitedAt > existing.invitedAt) {
      byCreator.set(row.creatorId, row);
    }
  }
  return [...byCreator.values()];
}
