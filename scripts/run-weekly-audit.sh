#!/bin/bash
#
# Weekly Audit Cron Wrapper
# This script ensures the proper environment is set before running the audit
#

# Exit on error
set -e

# Get the directory where this script lives
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project root
cd "$PROJECT_ROOT"

# Load environment variables (adjust path if you use .env file)
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Ensure CURSOR_API_KEY is set
if [ -z "$CURSOR_API_KEY" ]; then
  echo "Error: CURSOR_API_KEY not set" >&2
  exit 1
fi

# Log start time
echo "$(date): Starting weekly audit" >> "$PROJECT_ROOT/logs/audit.log"

# Run the audit script using tsx (or node if compiled)
npx tsx "$SCRIPT_DIR/weekly-audit.ts" 2>&1 | tee -a "$PROJECT_ROOT/logs/audit.log"

# Log completion
echo "$(date): Audit completed" >> "$PROJECT_ROOT/logs/audit.log"
