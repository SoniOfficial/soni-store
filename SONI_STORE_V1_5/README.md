# SONI STORE V1.5

Static digital app marketplace for GitHub Pages.

## Features
- Responsive black/gold interface
- Search, category filters and sorting
- App detail modal and screenshot gallery
- Local favorites, ratings, reviews and recently viewed
- Admin panel to add/edit/delete apps
- Import/export `apps.json`
- GitHub Issues app-request form

## Install/update
Extract this ZIP over your existing repository folder, then run:

```bash
git add .
git commit -m "SONI STORE V1.4"
git push origin main
```

GitHub Pages URL: https://SoniOfficial.github.io/soni-store/

## Add a real APK
1. Upload your APK to a GitHub Release in this repository.
2. Copy the release asset download URL.
3. Edit `data/apps.json` and set `downloadUrl` to that URL.
4. Commit and push the JSON file.

Example:
```json
{
  "id": "my-app",
  "name": "My App",
  "category": "Tools",
  "version": "1.0.0",
  "size": "20 MB",
  "developer": "SoniOfficial",
  "description": "App description",
  "downloadUrl": "https://github.com/SoniOfficial/soni-store/releases/download/v1.0/my-app.apk",
  "icon": "assets/my-app.png",
  "screenshots": [],
  "featured": true,
  "updated": "2026-11-12"
}
```

## Admin panel limitations
The admin panel is browser-local and does not write directly to GitHub. Use **Export apps.json**, replace `data/apps.json` in the repository, then commit and push. Never put a GitHub Personal Access Token in frontend JavaScript.

Favorites, ratings, reviews, recently viewed, and local admin changes are stored in the current browser only. They are not shared between visitors.

## Request form
The request form opens a prefilled GitHub Issue. The visitor needs a GitHub account to submit it.

## Validation
The JavaScript file is syntax-checked with Node.js. JSON data is parsed during package generation.


## V1.5 PWA notes
The install prompt is browser-dependent and is usually available on supported Chromium browsers after the site meets installability requirements. Service worker/offline mode requires HTTPS (GitHub Pages provides HTTPS). First visit needs internet access so core files can be cached. External fonts, remote images, and APK downloads may still require internet.

## Publish
Update the existing repository; do not run `git init` again:
```bash
git add .
git commit -m "SONI STORE V1.5"
git push origin main
```
