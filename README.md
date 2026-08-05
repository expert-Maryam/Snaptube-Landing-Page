# SnapTube Landing Page — GitHub + Vercel Ready

This is a static frontend project prepared for direct GitHub push and Vercel deployment.

## Project structure

- `index.html` — main page
- `css/styles.css` — complete styling and animations
- `js/script-1.js` ... — JavaScript split in the SAME order/positions as the original HTML
- `assets/images/` — place local image files here when needed
- `assets/icons/` — place local icons here when needed
- `vercel.json` — Vercel static-site configuration
- `.gitignore` — ignores local deployment/system files

## Run locally

You can open `index.html` directly, or run a simple local server:

```bash
python -m http.server 3000
```

Then visit `http://localhost:3000`.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial SnapTube landing page"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Deploy on Vercel

1. Open Vercel.
2. Click **Add New → Project**.
3. Import your GitHub repository.
4. Framework Preset: **Other**
5. Root Directory: leave as repository root.
6. Build Command: leave empty.
7. Output Directory: leave empty.
8. Click **Deploy**.

Because `index.html` is in the root, Vercel serves the project as a static website automatically.

## Important

The original `{{DOWNLOAD_URL}}` placeholders were changed to `#how` so deployment does not contain broken template placeholders.
When you have the final APK/download URL, replace `#how` on the download buttons with your real URL.

Google Fonts and any other remote resources still require internet access.
