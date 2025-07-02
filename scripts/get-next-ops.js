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
      throw new Error(
        `Failed to fetch ${SCHEDULER_API_URL}: ${res.status} ${res.statusText}`
      );
    }
    const data = await res.json();

    const USER_ID_TO_NAME = {
      1: 'Alan Pugh',
      2: 'Marissa Kern',
      3: 'Heather Jaynes',
      4: 'Chelsey Moise',
      5: 'Caitlin Bennett',
      6: 'Cody Bauer',
      7: 'Lenore Boles',
    };

    const addName = (obj) => {
      if (obj && obj.userId) {
        obj.name = USER_ID_TO_NAME[obj.userId] || obj.name;
      }
    };

    addName(data.next);
    addName(data.current);

    process.stdout.write(JSON.stringify(data));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
