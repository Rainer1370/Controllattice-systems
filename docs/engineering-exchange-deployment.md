# Engineering Exchange deployment and operations

## Hosting diagnosis

The public domain belongs to Sites project `appgprj_6a8fc66bb6388191bbed371877bc0518`.
Its production source repository was on `ad5933bb0511c4dc2bc5b8584fbf7c60d45f593e`, while GitHub main was on `ae5744fe2cde5baf239f40f8b2ad628315606842` after PRs #1 and #2. GitHub merges do not automatically update this Sites repository. Production version 48 deployed the existing Contact / Exchange changes and `/discussions` then returned HTTP 200.

Use the Sites source workflow to synchronize tested changes and publish an archive built from that exact commit. Preserve the project ID, public audience and custom domains. A GitHub merge alone is insufficient for this hosting project.

## Database

`.openai/hosting.json` declares the logical binding `EXCHANGE_DB`; Sites provisions the project's D1 resource and applies the generated Drizzle migration before Worker upload. This project previously had no D1 binding. No unrelated database is targeted. `worker/index.ts` passes its real environment to the Exchange API; a missing binding fails closed.

The schema replaces the PR #3 proposal: no stored email; nullable Google subject for organization/deleted accounts; hashed sessions; OAuth state and PKCE records; reports; moderation audit records; locks; indexes; and durable rate counters. PR #3 should be closed as superseded, not merged alongside the generated migration.

Schema migrations contain no seed data. `/api/exchange/setup` seeds only the five categories and three clearly labeled Control Lattice starters. It requires a temporary secret `EXCHANGE_SETUP_TOKEN` through a Bearer authorization header. Seed is idempotent. Remove the runtime secret immediately after initialization, redeploy, and verify setup returns 403. The endpoint can never assign administrator privileges.

## Google configuration — required before sign-in

Create a Google OAuth web application client for the Engineering Exchange.
- Home/origin: `https://controllattice.com`
- Callback: `https://controllattice.com/api/exchange/auth/callback`
- Privacy: `https://controllattice.com/discussions/privacy`
- Scopes: `openid email` only; email is verified transiently and not stored.

Configure runtime values with Sites environment tools or the hosting secret interface:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (secret)
- `EXCHANGE_ORIGIN=https://controllattice.com`
- `EXCHANGE_RATE_SALT` (secret, random)
- `EXCHANGE_POSTING_ENABLED=false` until release gates pass.

Never put secrets in GitHub, source manifests, screenshots or chat. Do not set the Google callback to the generated hosting domain unless testing that separate origin with a separate configured client/origin.

OAuth validates state, nonce, PKCE, signature against Google's signing keys, issuer, audience, authorized party, expiry, issue time, verified-email claim and subject. Sessions use 256-bit opaque tokens, only their SHA-256 hashes are stored. Cookies use `__Host-`, Secure, HttpOnly, SameSite=Lax and seven-day expiry. Writes check exact Origin and a per-session CSRF token. Roles always come from the database.

## Initial administrator

First sign in with the owner's authorized Google account and verify that Google shows `rainer1370@gmail.com`. Confirm the successful session belongs to that account, then retrieve its subject through the signed-in private `/api/exchange/account/identity` endpoint. Set that verified immutable subject as secret runtime `EXCHANGE_ADMIN_SUB` and redeploy. Sign in again and verify administrator access. Never infer the subject from the email, display name, a client request or another app's user ID. Do not grant administrator access until the account has actually been verified.

## Release gates

Automated API tests use Miniflare D1 and synthetic signed tokens. They are **not** evidence of a live Google login.

Before setting `EXCHANGE_POSTING_ENABLED=true`, test real Google sign-in, account creation/name choice, sign-out, moderation authorization, pending thread/reply approval, nested replies, trusted posting, edit review, reports, pin/lock, bans, reactions and restart persistence on a staging origin if one is available. Review desktop/mobile layout and accessibility. Confirm anonymous writes and forged tokens fail. Check the existing Contact transport with a clearly identified, authorized test submission.

The administrator can promote a participant to trusted only after reviewing their positive contribution history. Edits always return to moderation. Limits are 12 contribution requests/10 minutes, three threads/hour, five reports/hour and twenty OAuth starts/10 minutes per salted network hash. Request bodies are bounded at 18 KB, content at 12,000 characters and five links. Text is rendered through React escaping, not raw HTML. Public feeds have bounded pagination; each thread has a 500-reply limit. Administrators can clean expired state through the moderation page.

## Backups and migration strategy

1. Inspect the hosting-provisioned D1 resource and its actual Time Travel retention before opening posting. Cloudflare documents plan-dependent retention; do not assume a particular plan or that exported backups are scheduled.
2. Before later migrations, take a protected logical export at `/api/exchange/admin/backup` (administrator only). It excludes sessions, OAuth transactions and rate-limit records. Treat Google subject identifiers and reports as private; keep exports encrypted with access limited to the owner. Restore to a separate D1 database first and validate counts and representative threads/replies.
3. Keep applied SQL, Drizzle snapshots and journal entries immutable. Append migrations. Verify schema compatibility with both old and new Workers because rollback does not undo schema changes. Never drop production tables to repair deployment.
4. If deployment fails, inspect whether its migration already applied before changing anything. Reuse a known good Sites version for code rollback. A code rollback is not a data restore.
5. Use Cloudflare Time Travel only through an authorized recovery workflow, first recording the current bookmark and taking a backup. Restores affect all data in that database.

References: https://developers.cloudflare.com/d1/reference/time-travel/ and https://developers.google.com/identity/openid-connect/openid-connect

## Current limitations

Google Cloud showed “Site Unavailable” in the available browser. Production browser navigation to controllattice.com was blocked by the browser's client policy; HTTP route checks were possible. Real OAuth, owner verification, mobile visual QA, and actual Contact delivery are release blockers. Keep posting disabled until they are resolved. Automatic exported backups and periodic expired-record cleanup are not scheduled.

## First contribution approval and email alerts

Members can compose replies before sign-in; their draft is retained in session storage in that browser tab through OAuth. Signed-in authors see their pending replies, while other readers cannot. Approving a contribution marks the author trusted; administrators can restore review requirements using Require review. Existing pending contributions still require individual approval.

Configure `RESEND_API_KEY` as a hosted secret, `EXCHANGE_EMAIL_FROM` as a sender verified in Resend, and `EXCHANGE_MODERATION_EMAIL` as the private administrator recipient. New untrusted thread/reply submissions atomically enqueue a generic moderation email in the existing moderation log. The message links to the protected administrator queue and contains no comment body, user email, or approval bearer token. Delivery failures stay queued; new submissions and the administrator Retry queued email alerts control retry delivery with provider idempotency keys. No notification delivery is claimed until these runtime values are configured and actual delivery is tested.
