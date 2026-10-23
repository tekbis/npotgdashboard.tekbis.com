# NPOTG website + NPOTG Dashboard (Vercel)

Designed by Tekbis LLC.

Full website plus a private dashboard at **/admin**. Edits publish via Vercel Serverless APIs
and are stored in **Vercel Blob** (or local `.data/` while developing).

## Deploy on Vercel

1. Push this folder to GitHub and import the repo in Vercel (Framework: **Other**).
2. Add environment variables:
   - `ADMIN_PASSWORD` — client password
   - `SESSION_SECRET` — optional random string
   - `BLOB_READ_WRITE_TOKEN` — create a **Blob** store in Vercel → Storage and connect it
3. Deploy, then open `https://YOUR-PROJECT.vercel.app/admin`.

## Local development

```bash
npm install
npx vercel dev
```

Open `http://localhost:3000/admin`. Password from `.env` (`ADMIN_PASSWORD`).

Locally, content saves under `.data/` (Blob token not required).

## Client link

`https://YOUR-PROJECT.vercel.app/admin` + password.

## Files

| Path | What |
|---|---|
| `index.html`, `assets/` | Website |
| `admin/index.html` | Dashboard |
| `api/` | Login, content, upload, history, media |
| `vercel.json` | Headers + `/admin` rewrite |
