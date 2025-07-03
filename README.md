A tiny standalone Node.js utility and GitHub Actions workflow that, twice a day (Mon–Fri at 4 pm and 6 pm ET),

Fetches “next Ops” from our Scheduler app’s public API (no auth),

Calls our “Round Robin”–style app to mark that user Unavailable,

Flips Ops user back to Available (“By Schedule”) at the end of their day.

## Usage

Set the following secrets in your GitHub repository settings:

- `SCHEDULER_API_URL` – URL to the Scheduler endpoint returning the next Ops shift.
- `RR_API_KEY` – API token for the Round Robin availability service.

The workflow `.github/workflows/ops-availability.yml` runs Monday–Friday at 4 pm and 6 pm ET. It now calls `flip-availability.js` directly to fetch the next Ops user and update their availability.

Run the script locally with:

```bash
node scripts/flip-availability.js
```
