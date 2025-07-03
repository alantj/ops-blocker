#!/usr/bin/env node

import fetch from 'node-fetch'
import assert from 'assert'
import dotenv from 'dotenv'
dotenv.config()

// —————————————————————————————————————————————————————————————
// CONFIG / ENV
// —————————————————————————————————————————————————————————————
const { SCHEDULER_API_URL, RR_API_KEY } = process.env;
if (!SCHEDULER_API_URL) {
  console.error('✗ Please set SCHEDULER_API_URL in your .env');
  process.exit(1);
}
if (!RR_API_KEY) {
  console.error('✗ Please set RR_API_KEY in your .env');
  process.exit(1);
}

// map Scheduler userId → Zendesk user ID
const ZENDESK_IDS = {
  1: 370017496412,
  2: 417743175252,
  3: 424114733631,
  4: 10201236907028,
  5: 13225530481300,
  6: 14966965553044,
  7: 17464622881556,
};

async function setAvailability(zendeskId, mode) {
  const cacheBuster = '5.5-' + Math.floor(Math.random() * 10000);
  const url =
    'https://pod4.roundrobin-assignment.com/call/16262/_zui5_set_agent_avail_mode' +
    `?p1=${RR_API_KEY}&p2=${zendeskId}&p3=${zendeskId}&p4=${mode}&p5=${cacheBuster}`;

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    console.error(`✗ RoundRobin API returned ${res.status}`, await res.text());
  }
}

function resolveZendeskId(userId) {
  return ZENDESK_IDS[userId] ?? null;
}

async function main() {
  // 1) fetch the JSON from your Scheduler endpoint
  const res = await fetch(SCHEDULER_API_URL);
  if (!res.ok) {
    console.error(`✗ Scheduler API error: ${res.status}`, await res.text());
    process.exit(1);
  }
  const { current, next } = await res.json();

  // 2) look up their Zendesk IDs
  const nextZendeskId = resolveZendeskId(next.userId);
  const currZendeskId = resolveZendeskId(current.userId);

  // 3) flip them Unavailable/By%20Schedule
  if (nextZendeskId) {
    console.log(`→ Marking ${nextZendeskId} Unavailable (next ops)`);
    await setAvailability(nextZendeskId, 'Unavailable');
  } else {
    console.warn('⚠️  No upcoming ops shift found');
  }

  if (currZendeskId) {
    console.log(`→ Marking ${currZendeskId} By Schedule (current ops)`);
    await setAvailability(currZendeskId, 'By%20Schedule');
  } else {
    console.warn('⚠️  No current ops shift found');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
