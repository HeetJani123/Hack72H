# CareBridge

A responsive 72-hour hospital-to-home care coordination demonstration. Start with `npm run dev`, then open http://127.0.0.1:4173. No dependencies or build step required. Run core workflow checks with `npm test`.

## Demo accounts

The welcome page has three demo profiles: Emma Davis (nurse), Maya Patel (caregiver), and Eleanor Bennett (patient). These are role previews, not authenticated clinical accounts. Sign out to change roles. All people and records are fictional.

## Working flows

Create patient referrals, assign caregivers, schedule visits with overlap checks, complete task checklists, save visit notes, raise concerns, acknowledge and resolve alerts, review patient records, filter patients, search, and view a shared timeline. Changes persist in this browser and synchronize across tabs. Reset demo data from Settings.

## Boundaries

This is a browser-local prototype. Role filtering is a UI demonstration, not an authorization boundary. Do not enter real patient information. The context summary is deterministic and explicitly labeled a demo; no AI provider is connected. No external notifications are sent. Caregiver credentials are seeded, not verified. Use the nurse profile to explore every patient; caregivers and patients see their associated records.

Production work requires real authentication, server-side authorization, a durable database, verified caregiver eligibility, clinical supervision and escalation protocols, appropriate privacy/security arrangements, and a configured model service using permission-scoped source retrieval. The hosted Site remains private to its owner.
