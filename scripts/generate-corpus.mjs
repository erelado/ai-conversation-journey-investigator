// Generates a synthetic corpus of ~500 bot→human handoff calls, each with
// customer/bot dialogue turns plus the system events the classifier reads.
//
// Deterministic: a fixed-seed PRNG means `node scripts/generate-corpus.mjs` always
// reproduces the same src/data/corpus.json. The data is SYNTHETIC, no real calls.
//
// The archetype mix is chosen so the deterministic classifier (src/lib/classify.ts),
// run over the output, produces a realistic spread of verdicts.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SEED = 20240626;
const COUNT = 500;

// --- deterministic PRNG (mulberry32) ---
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const int = (min, max) => min + Math.floor(rng() * (max - min + 1));
const chance = (p) => rng() < p;

// --- vocab ---
const INTENTS = {
  reschedule_appointment: 'Reschedule appointment',
  billing_inquiry: 'Unusual billing charge',
  close_account: 'Close account',
  refund_request: 'Request a refund',
  change_payment_method: 'Change payment method',
  dispute_charge: 'Dispute a charge',
  order_status: 'Order status',
  cancel_service: 'Cancel service',
  report_fraud: 'Report suspected fraud',
  update_address: 'Update address',
};
const intentKeys = Object.keys(INTENTS);

const OPENERS = {
  reschedule_appointment: 'I need to move my appointment to another day.',
  billing_inquiry: "There's a charge on my bill I don't recognize.",
  close_account: 'I want to close my account.',
  refund_request: "I'd like a refund for last month.",
  change_payment_method: 'I need to update the card on file.',
  dispute_charge: 'I want to dispute a charge.',
  order_status: 'Where is my order?',
  cancel_service: 'I want to cancel my service.',
  report_fraud: 'I think someone used my account.',
  update_address: 'I moved and need to change my address.',
};

const TOOLS = {
  reschedule_appointment: 'appointment_api',
  billing_inquiry: 'billing_api',
  refund_request: 'refund_api',
  change_payment_method: 'payments_api',
  dispute_charge: 'billing_api',
  order_status: 'orders_api',
  cancel_service: 'subscription_api',
  update_address: 'profile_api',
};

const POLICY_INTENTS = {
  close_account: 'account_closure',
  refund_request: 'large_refund_approval',
  report_fraud: 'fraud_review',
  dispute_charge: 'chargeback_approval',
};

const BOT_ACKS = ['Let me help with that.', 'Sure, I can look into that.', 'One moment.'];
const BOT_WAIT = ['Still working on it...', 'Thanks for your patience.', 'Almost there.'];
const CUST_REPEAT = [
  'I already told you that.',
  "I'm asking the same thing again.",
  'Can you just do it?',
];
const CUST_CONFUSED = [
  "That's not what I asked.",
  'You misunderstood me.',
  'No, that is the wrong thing.',
];
const BOT_HANDOFF = ['Let me connect you to an agent.', "I'll transfer you to a specialist."];

// archetype weights → realistic verdict spread
const ARCHETYPES = [
  ['business_failure', 0.3],
  ['intent_failure', 0.25],
  ['policy', 0.25],
  ['insufficient', 0.2],
];
function pickArchetype() {
  const r = rng();
  let acc = 0;
  for (const [name, w] of ARCHETYPES) {
    acc += w;
    if (r <= acc) return name;
  }
  return 'business_failure';
}

// --- clock per call ---
function makeClock() {
  let h = int(8, 18);
  let m = int(0, 58);
  let s = int(0, 50);
  return () => {
    s += int(2, 9);
    while (s >= 60) {
      s -= 60;
      m += 1;
    }
    while (m >= 60) {
      m -= 60;
      h += 1;
    }
    const p = (n) => String(n).padStart(2, '0');
    return `${p(h)}:${p(m)}:${p(s)}`;
  };
}

function buildCall(i) {
  const archetype = pickArchetype();
  const t = makeClock();
  const events = [];
  const add = (type, data) => events.push(data ? { timestamp: t(), type, data } : { timestamp: t(), type });

  // pick an intent that fits the archetype
  let intent;
  if (archetype === 'policy') intent = pick(Object.keys(POLICY_INTENTS));
  else if (archetype === 'business_failure') intent = pick(Object.keys(TOOLS));
  else intent = pick(intentKeys);

  add('call_started');
  add('customer_message', { text: OPENERS[intent] ?? 'I need some help.' });
  add('bot_message', { text: pick(BOT_ACKS) });

  if (archetype === 'business_failure') {
    add('intent_detected', { intent, confidence: round(0.82 + rng() * 0.15) });
    const tool = TOOLS[intent] ?? 'service_api';
    const failures = chance(0.7) ? int(2, 3) : 1;
    for (let f = 0; f < failures; f++) {
      add('tool_call', { tool });
      add('tool_call_failed', { tool, error: pick(['timeout', '503', 'connection_reset']) });
      if (f === 0) add('bot_message', { text: pick(BOT_WAIT) });
    }
    add('customer_message', { text: pick(CUST_REPEAT) });
    add('customer_repeated_request');
    add('bot_message', { text: pick(BOT_HANDOFF) });
    add('human_handoff');
  } else if (archetype === 'intent_failure') {
    add('intent_detected', { intent, confidence: round(0.2 + rng() * 0.28) });
    add('clarification_requested');
    add('bot_message', { text: 'Just to confirm, what would you like to do?' });
    add('customer_message', { text: OPENERS[intent] ?? 'Like I said...' });
    add('route_selected', { route: pick(['make_a_payment', 'general_info', 'account_settings']) });
    add('customer_message', { text: pick(CUST_CONFUSED) });
    add('customer_reported_misunderstanding');
    add('bot_message', { text: pick(BOT_HANDOFF) });
    add('human_handoff');
  } else if (archetype === 'policy') {
    add('intent_detected', { intent, confidence: round(0.85 + rng() * 0.12) });
    add('identity_verified');
    add('bot_message', { text: 'Thanks, your identity is verified.' });
    add('policy_check', { policy: POLICY_INTENTS[intent], result: 'requires_human' });
    add('human_approval_required');
    add('bot_message', { text: pick(BOT_HANDOFF) });
    add('human_handoff');
  } else {
    // insufficient: telemetry drops out after the opening
    add('intent_detected', { intent: 'unknown', confidence: round(0.5 + rng() * 0.1) });
    add('human_handoff');
  }

  return {
    conversation_id: `syn-${String(i + 1).padStart(4, '0')}`,
    title: INTENTS[intent] ?? 'Customer call',
    description: `Synthetic ${archetype.replace('_', ' ')} call.`,
    events,
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

const corpus = Array.from({ length: COUNT }, (_, i) => buildCall(i));

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'src', 'data', 'corpus.json');
writeFileSync(out, JSON.stringify(corpus, null, 1) + '\n');
console.log(`Wrote ${corpus.length} synthetic calls to ${out}`);
