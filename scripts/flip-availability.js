#!/usr/bin/env node

const fs = require('fs/promises');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node flip-availability.js <file>');
  process.exit(1);
}

const { RR_API_KEY } = process.env;
if (!RR_API_KEY) {
  console.error('RR_API_KEY environment variable not set');
  process.exit(1);
}

async function setAvailability(userId, status) {
  const res = await fetch('https://other.app/api/set-availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RR_API_KEY}`,
    },
    body: JSON.stringify({ userId, status }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to set availability for ${userId}: ${res.status} ${res.statusText} ${text}`);
  }
}

(async () => {
  try {
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    const nextUserId = data.next?.userId || data.userId || data.nextUserId;
    const currentUserId = data.current?.userId || data.currentUserId;

    if (nextUserId) {
      await setAvailability(nextUserId, 'Unavailable');
    } else {
      console.warn('No upcoming user found in JSON');
    }

    if (currentUserId) {
      await setAvailability(currentUserId, 'By%20Schedule');
    } else {
      console.warn('No current user found in JSON');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
