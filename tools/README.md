# Image sources

These pages are the sources for the two PNGs in `assets/`. They are not linked from the site.

- `og-card.html` → `assets/og.png` (1200×630 link preview)
- `icon.html` → `assets/favicon-32.png`, `assets/favicon-192.png` (`?v=tile`) and `assets/apple-touch-icon.png` (`?v=full`). Render at 512×512, then scale down.

To re-render, serve the site folder locally (for example `python -m http.server 4173`) and run headless Edge or Chrome:

```
msedge --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=8000 --screenshot=og.png http://127.0.0.1:4173/tools/og-card.html
msedge --headless=new --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 --window-size=512,512 --virtual-time-budget=6000 --screenshot=icon-512.png "http://127.0.0.1:4173/tools/icon.html?v=tile"
```
