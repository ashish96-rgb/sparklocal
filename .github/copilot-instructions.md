# SparkLocal project notes

- Keep the app dependency-light: browser code is vanilla JavaScript; server modules use Node ES modules.
- Keep model credentials on the server. Preserve the explicit demo-mode label whenever Gemma is not connected.
- Preserve the shared community board API and its validation when changing participation features.
- Run `npm test` and `node --check public/app.js` after behavior changes.
- Avoid collecting sensitive personal data. AI plans are drafts for community review, not professional advice.