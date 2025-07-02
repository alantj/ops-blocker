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

const ZENDESK_IDS = {
  'Alan Pugh': 370017496412,
  'Heather Jaynes': 424114733631,
  'Marissa Kern': 417743175252,
  'Chelsey Moise': 10201236907028,
  'Caitlin Bennett': 13225530481300,
  'Cody Bauer': 14966965553044,
  'Lenore Boles': 17464622881556,
};

async function setAvailability(zendeskId, mode) {
  const cacheBuster = '5.5-' + Math.floor(Math.random() * 10000);
  const url =
    'https://pod4.roundrobin-assignment.com/call/16262/_zui5_set_agent_avail_mode' +
    `?p1=${RR_API_KEY}&p2=${zendeskId}&p3=${zendeskId}&p4=${mode}&p5=${cacheBuster}`;
  try {
    await fetch(url, { method: 'GET' });
  } catch (err) {
    console.error('Failed to update RR availability', err);
  }
}

(async () => {
  try {
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    const nextZendeskId =
      ZENDESK_IDS[data.next?.name] ||
      data.next?.userId ||
      data.userId ||
      data.nextUserId;
    const currentZendeskId =
      ZENDESK_IDS[data.current?.name] ||
      data.current?.userId ||
      data.currentUserId;

    if (nextZendeskId) {
      await setAvailability(nextZendeskId, 'Unavailable');
    } else {
      console.warn('No upcoming user found in JSON');
    }

    if (currentZendeskId) {
      await setAvailability(currentZendeskId, 'By%20Schedule');
    } else {
      console.warn('No current user found in JSON');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
