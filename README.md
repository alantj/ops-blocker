A tiny standalone Node.js utility and GitHub Actions workflow that, twice a day (Mon–Fri at 4 pm and 6 pm ET),

Fetches “next Ops” from our Scheduler app’s public API (no auth),

Updates agent status in our Triage Bot to explicitly set them active (available) or inactive (unavailable),
and flips the Ops user back to active at the end of their day.

## Usage

Set the following secret in your GitHub repository settings:

- `SCHEDULER_API_URL` – URL to the Scheduler endpoint returning the current and next Ops shift.

The workflow `.github/workflows/ops-availability.yml` runs Monday–Friday at 4 pm and 6 pm ET. It calls `flip-availability.js` to fetch the current/next Ops users and update their availability via Triage Bot:

- Endpoint: `https://dispute-assigner.vercel.app/api/agents/update`
- Method: `PUT`
- Body: `{"id":"<agent-uuid>","active":true|false}`
- Auth: none

Run the script locally with:

```bash
node scripts/flip-availability.js
```
