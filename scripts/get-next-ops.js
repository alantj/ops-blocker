#!/usr/bin/env node

const { SCHEDULER_API_URL } = process.env;

if (!SCHEDULER_API_URL) {
  console.error('SCHEDULER_API_URL environment variable not set');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch(SCHEDULER_API_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${SCHEDULER_API_URL}: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    process.stdout.write(JSON.stringify(data));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
