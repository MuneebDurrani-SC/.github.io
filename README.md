
# Solar Calor — ClickUp-Embeddable Dashboard

This repo publishes a **single-file HTML** dashboard to GitHub Pages (no Jekyll build).
You can embed the published URL directly in ClickUp (**Embed** view).

## Quick start (Deploy from a branch — no Actions)
1. Keep these two files in the repo root:
   - `index.html`
   - `.nojekyll` (empty file)
2. Go to **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your chosen branch)
   - Folder: `/` (root)
3. Wait for Pages to publish, then open the URL it prints (e.g., `https://<user>.github.io/<repo>/`).  
   Use that URL in ClickUp’s Embed view.

## Alternative: GitHub Actions workflow (no Jekyll build)
This repo also includes a workflow at `.github/workflows/pages.yml`.  
It uploads the repository contents as static files and deploys them to Pages—no Jekyll, no SCSS.

Steps:
1. Push to the branch configured in the workflow (default: `main`).
2. The workflow deploys to GitHub Pages and prints the published URL.

## Notes
- The dashboard is **self-contained** (CDN scripts + inline app). No backend required.
- State is stored in **localStorage** (per browser). You can export/import config under **☰ → Admin → Backup**.
- If you want to serve from `/docs` instead, move `index.html` and `.nojekyll` to `/docs` and update your Pages settings, or change the `path:` in the workflow.
