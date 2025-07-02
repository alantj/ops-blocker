A tiny standalone Node.js utility and GitHub Actions workflow that, twice a day (Mon–Fri at 4 pm and 6 pm ET),

Fetches “next Ops” from our Scheduler app’s public API (no auth),

POSTs to our “Round Robin”–style app to mark that user Unavailable,

Flips Ops user back to Available (“By Schedule”) at the end of their day.
