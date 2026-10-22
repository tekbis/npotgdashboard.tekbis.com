# NPOTG website + NPOTG Dashboard

Designed by Tekbis LLC.

This folder is the full website plus a private dashboard at **/admin** where the client can change
any text, photo, service, review, FAQ, opening hours, contact details, colours and Google text,
then press **Publish** to update the live site within seconds.

Edits are stored with Netlify itself (Netlify Blobs), so there is no extra service or database to pay for.

---

## 1. Put the site on Netlify (one time, about 10 minutes)

The dashboard runs small server functions, so the site must be deployed from GitHub
(or the Netlify CLI). A plain drag-and-drop deploy shows the website but the dashboard cannot save.

**Using GitHub (no coding needed)**

1. Create a free account at github.com and click **New repository** (make it Private).
2. On the new repository page click **uploading an existing file** and drag in *everything inside this folder*
   (index.html, admin, assets, netlify, netlify.toml, package.json, README.md, robots.txt). Click **Commit changes**.
3. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repository and click **Deploy**.
   Netlify reads `netlify.toml`, so leave the build settings as they are.

**Using the Netlify CLI (developers)**

```
npm install
npx netlify-cli deploy --build --prod
```

## 2. Set the dashboard password

1. In Netlify open the site → **Site configuration → Environment variables → Add a variable**.
2. Key: `ADMIN_PASSWORD`  Value: a long password only the client knows.
3. Optional: add `SESSION_SECRET` with any long random text (keeps sign-ins valid if the password changes).
4. Go to **Deploys → Trigger deploy → Deploy site** so the password takes effect.

## 3. Use the dashboard

Open `https://YOUR-SITE.netlify.app/admin` and sign in.

- **Pages**: every section of Home, Services, About and Contact, top to bottom. Each section can be hidden.
- **Click to edit**: click any text or photo in the live preview and the dashboard jumps to that field.
- **Accent colour**: in headings, words wrapped in `*stars*` show in the accent colour.
- **Lists**: Services, Reviews, FAQs, Values, Opening hours, Service area, Booking options. Drag to reorder, add or delete.
- **Settings**: phone, email and social links (updated everywhere at once), brand colours, Google title and description.
- **Images**: upload JPG, PNG or WebP. Large photos are resized automatically. Uploads are kept in the Image library.
- **Publish** (or Ctrl/⌘ + S) puts changes live. **Discard** throws away unpublished edits.
- **Publish history** keeps the last 40 versions. Restore any of them with one click.
- Unpublished edits are kept in the browser, so closing the tab does not lose work.

To change the password, update `ADMIN_PASSWORD` and redeploy. Everyone is signed out.

## Files

| Path | What it is |
|---|---|
| `index.html`, `assets/` | The website |
| `admin/index.html` | NPOTG Dashboard (website editor) |
| `netlify/functions/` | Sign-in, save, image upload, history (Netlify Functions) |
| `netlify/lib/core.mjs` | Shared helpers: password check, storage, cache refresh |
| `netlify.toml` | Caching, security headers, functions settings |
| `package.json` | Netlify packages the functions use |

API routes: `GET/PUT /api/content`, `POST /api/login`, `GET/POST /api/history`, `GET/POST/DELETE /api/upload`, `GET /api/media/:id`.

## Before handing over

- Remove the "TEKBIS LLC · DO NOT COPY" watermark: delete `<div class="wm" aria-hidden="true"></div>` in `index.html`.
- The booking form is a demo. To receive requests, add `name="booking" data-netlify="true"` to `<form id="bookForm">`
  and a `name` attribute to each field, or connect a booking tool.
- Replace the placeholder reviews and demo photos (both can now be done from the dashboard).
