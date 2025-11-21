#!/usr/bin/env node

import fetch from 'node-fetch'
import assert from 'assert'
import dotenv from 'dotenv'
import { existsSync, readFileSync } from 'fs'
dotenv.config()

// —————————————————————————————————————————————————————————————
// CONFIG / ENV
// —————————————————————————————————————————————————————————————
const { SCHEDULER_API_URL } = process.env;
if (!SCHEDULER_API_URL) {
  console.error('✗ Please set SCHEDULER_API_URL in your .env');
  process.exit(1);
}

// Determine if this is the 20:00 UTC scheduled run
const TWENTY_CRON = '0 20 * * 1-5';
let is20Cron = false;
const eventPath = process.env.GITHUB_EVENT_PATH;
if (eventPath && existsSync(eventPath)) {
  try {
    const eventData = JSON.parse(readFileSync(eventPath, 'utf8'));
    if (eventData.schedule === TWENTY_CRON) {
      is20Cron = true;
    }
  } catch (err) {
    console.warn('⚠️  Could not parse GitHub event payload for schedule');
  }
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

// map Zendesk user ID → Triage Bot Agent UUID
const ZENDESK_TO_TRIAGE = {
  '370017496412': '9efc78e4-25c0-4f6b-8471-ef4261691387',
  '417743175252': '7ab5af5c-a243-4778-acf7-996ec8b915f4',
  '424114733631': '861a7fc9-e1c1-43b6-b3df-c579d804eeec',
  '10201236907028': 'c06a9380-5e56-4ffb-9b5e-59cc56af2072',
  '13225530481300': 'f4ea4a63-759c-4f18-9216-20a31ca18da6',
  '14966965553044': 'd95c6d45-bef4-40be-925e-f05055c30e29',
  '17464622881556': '8b789476-7998-4197-8e7f-c7adc52be306',
};

function resolveZendeskId(userId) {
  return ZENDESK_IDS[userId] ?? null;
}

function resolveTriageId(userId) {
  const zendeskId = resolveZendeskId(userId);
  if (!zendeskId) return null;
  return ZENDESK_TO_TRIAGE[String(zendeskId)] ?? null;
}

const TRIAGE_URL = 'https://dispute-assigner.vercel.app/api/agents/update';

async function setTriageActive(agentId, active) {
  const res = await fetch(TRIAGE_URL, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: agentId, active }),
  });
  if (!res.ok) {
    console.error(`✗ Triage Bot error: ${res.status}`, await res.text());
    return null;
  }
  const updated = await res.json();
  console.log(`✓ Triage Bot: ${updated.id} active=${updated.active}`);
  return updated;
}

async function main() {
  // 1) fetch the JSON from your Scheduler endpoint
  const res = await fetch(SCHEDULER_API_URL);
  if (!res.ok) {
    console.error(`✗ Scheduler API error: ${res.status}`, await res.text());
    process.exit(1);
  }
  const { current, next } = await res.json();

  // 2) resolve Triage agent IDs for current/next users
  const nextTriageId = resolveTriageId(next.userId);
  const currTriageId = resolveTriageId(current.userId);

  // 3) set explicit active true/false
  if (current.userId === next.userId) {
    if (currTriageId) {
      if (is20Cron && current.userId === 6) {
        console.log('→ 20:00 cron with userId 6; leaving status unchanged');
      } else {
        console.log(`→ Current and next user match (${currTriageId}); marking active=false`);
        await setTriageActive(currTriageId, false);
      }
    } else {
      console.warn('⚠️  No ops shift found for matching current/next user');
    }
    return;
  }

  if (currTriageId) {
    if (is20Cron && current.userId === 6) {
      console.log('→ 20:00 cron for userId 6; skipping status change');
    } else {
      console.log(`→ Marking ${currTriageId} active=true (current ops)`);
      await setTriageActive(currTriageId, true);
    }
  } else {
    console.warn('⚠️  No current ops shift found');
  }

  if (nextTriageId) {
    console.log(`→ Marking ${nextTriageId} active=false (next ops)`);
    await setTriageActive(nextTriageId, false);
  } else {
    console.warn('⚠️  No upcoming ops shift found');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
