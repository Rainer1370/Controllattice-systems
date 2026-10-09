# Engineering Exchange — production setup

The public landing page is a **preview**, not a live posting system. Do not turn on write routes until these steps are complete.

## Hosting blocker
The repository currently has `.openai/hosting.json` with `"d1": null`. The deployment binding is not configured. The route /discussions has also returned Not Found on the production site, so verify deployment routing/build logs first.

## Database
Create a dedicated Cloudflare D1 database for the community. Configure a binding named `EXCHANGE_DB` through the hosting provider and apply `db/exchange-schema.sql` via an authorized migration. Keep private email addresses out of public API responses.

## Google OAuth
Create a Google Cloud OAuth consent screen and web OAuth client for controllattice.com. Set authorized redirect URI to the actual server callback route when implemented. Configure client ID and client secret as deployment secrets, never in GitHub. Verify Google ID token issuer, audience, expiry, and subject on the server; use a signed, HttpOnly, Secure, SameSite=Lax session cookie and CSRF protection. Do not trust display name, email, or role supplied by a browser.

## Posting and moderation
- Public read of **published** threads/replies only.
- Google sign-in required for all writes.
- First-time posts and replies enter pending moderation.
- Only authorized admin/moderator accounts can approve, hide, pin, or ban.
- Promote trusted members only after approved participation; never based on user-controlled fields.
- Add rate limits, anti-spam, length limits, content sanitization, and abuse reporting.
- Assign the admin role through a verified Google subject ID in a protected migration, not by matching an editable display name.
- Add a privacy notice and deletion/export process before collecting accounts.

## Release gates
1. Production /discussions route loads.
2. Google sign-in and logout tested, including rejected tokens.
3. Database migrations and backups verified.
4. Unauthorized posting and moderation requests rejected.
5. First-time moderation queue and published-only reads tested.
6. Mobile accessibility and privacy notice reviewed.
7. Enable posting only after all tests pass.
