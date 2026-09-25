/**
 * G.S. Construction — Node.js server
 * ------------------------------------------------------------------
 * This does NOT change a single line of the website's HTML/CSS/JS.
 * It simply serves the existing static files (index.html, admin.html,
 * /assets) through Express so the site can run as a Node.js app.
 *
 * Responsive behaviour (mobile/tablet/desktop, Android/iOS/Mac/Windows)
 * is already handled inside index.html itself (viewport meta tag +
 * CSS/JS in that file) — nothing here touches that.
 * ------------------------------------------------------------------
 */

const path = require('path');
const express = require('express');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Gzip/deflate compression for faster loads on mobile networks.
app.use(compression());

// Serve the site exactly as it is (index.html, admin.html, /assets/*).
// `express.static` natively supports HTTP Range requests, which is
// required for the hero videos (mp4/webm) to scrub/stream correctly
// on iOS Safari, Android Chrome, macOS and Windows browsers alike.
app.use(
  express.static(PUBLIC_DIR, {
    extensions: ['html'],
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      // Long-lived caching for large, versioned-by-content assets.
      if (['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm'].includes(ext)) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
      }

      // Never cache the HTML shell so content updates show up immediately.
      if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// The whole site (including the admin panel) lives inside index.html
// and is navigated with a hash (index.html#admin), so any unknown path
// should fall back to index.html rather than 404-ing.
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`G.S. Construction site running at http://localhost:${PORT}`);
});
