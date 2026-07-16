# Dynamic Admin Panel — Setup Guide

## What changed
- `functions/` — Cloudflare Pages Functions (your new backend). File-based routing:
  every file is an API route, no server/router boilerplate needed.
- `schema.sql` — D1 table definitions, pre-seeded with your existing certs/projects
  so you don't lose current data when you switch over.
- `admin/` — the `/admin` dashboard (login + CRUD forms), plain HTML/JS, same visual
  language as the main site.
- `assets/js/main.js` — now fetches certs/projects from `/api/certificates` and
  `/api/projects` instead of using hardcoded arrays.
- `index.html` — the 6 hardcoded `<article>` project blocks were replaced with one
  `<div id="project-grid">` that `main.js` populates. Everything else is untouched.
- `wrangler.toml`, `_headers` — new/updated config.

Auth model: a single admin user (you), credentials stored as Cloudflare secrets
(never in code, never in the database), sessions are HMAC-signed HttpOnly cookies
(`SameSite=Strict`, `Secure`) verified on every write request. No third-party auth
library needed — it's ~50 lines of Web Crypto in `functions/_utils/auth.js`.

Read endpoints (`GET /api/certificates`, `GET /api/projects`) are public, since the
public site needs them. Write endpoints (`POST`/`PUT`/`DELETE`) require a valid
session cookie, checked via `requireAuth()` in every mutating handler.

---

## 1. Install Wrangler & log in

```bash
npm install -g wrangler
wrangler login
```

## 2. Create the D1 database

```bash
wrangler d1 create portfolio-db
```

Copy the `database_id` it prints into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_DATABASE_ID`.

Apply the schema (creates tables + seeds your existing certs/projects):

```bash
wrangler d1 execute portfolio-db --remote --file=./schema.sql
```

## 3. (Recommended) Create an R2 bucket for image uploads

This lets you attach a new cert/project image from the admin panel, instead of
manually adding files to the repo and redeploying.

```bash
wrangler r2 bucket create portfolio-assets
```

Then in the Cloudflare dashboard: **R2 → portfolio-assets → Settings → Public
Access → Allow Access**, and copy the `r2.dev` URL it gives you (or attach a
custom domain). You'll set this as `R2_PUBLIC_URL` below.

If you'd rather skip this for now, the admin form also accepts a plain image URL
(e.g. one you host elsewhere) — the upload button is optional.

## 4. Generate your admin credentials

Pick a random salt and a strong password, then hash it locally (nothing leaves
your machine):

```bash
node scripts/generate-password-hash.js "your-strong-password" "any-random-salt-string"
```

This prints a hex hash — that's your `ADMIN_PASSWORD_HASH`.

## 5. Set secrets

```bash
wrangler pages secret put SESSION_SECRET       # any long random string
wrangler pages secret put PASSWORD_SALT        # the salt you used above
wrangler pages secret put ADMIN_USERNAME       # e.g. dulith
wrangler pages secret put ADMIN_PASSWORD_HASH  # output from step 4
wrangler pages secret put R2_PUBLIC_URL        # e.g. https://pub-xxxx.r2.dev
```

(`wrangler pages secret put` prompts you to select your Pages project the first
time — pick the one this repo deploys to.)

## 6. Deploy

Push to your connected git branch as usual, or deploy directly:

```bash
wrangler pages deploy .
```

D1 and R2 bindings in `wrangler.toml` apply automatically to Pages Functions on
deploy. No extra dashboard binding step needed once `wrangler.toml` has them.

## 7. Local development

```bash
wrangler pages dev . --d1=DB=portfolio-db --r2=ASSETS=portfolio-assets
```

This runs Functions + a local D1/R2 emulation at `http://localhost:8788`.

## 8. Log in

Visit `https://yourdomain.com/admin`, sign in with the username/password from
step 4, and manage certs/projects from there. Changes appear on the main site
immediately (no redeploy needed) since it's reading live from D1.

---

## Notes / things to keep in mind
- Rotate `SESSION_SECRET` any time you want to invalidate all active sessions.
- The admin panel has no "forgot password" flow — recover by re-running step 4
  and re-setting `ADMIN_PASSWORD_HASH`.
- `/admin` itself isn't blocked by middleware (it's a static shell that shows a
  login form), but it can't do anything without a valid session — data mutation
  is gated at the API layer, which is the actual security boundary.
- If you later want multiple admins or an audit log, swap `ADMIN_USERNAME`/
  `ADMIN_PASSWORD_HASH` env vars for a `users` table in D1 — the session/cookie
  logic in `functions/_utils/auth.js` doesn't need to change.
