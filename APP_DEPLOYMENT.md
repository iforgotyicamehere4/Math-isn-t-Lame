# MathPop - App Deployment & Installation Guide

## ✅ PWA Setup Complete

MathPop is now configured as a **Progressive Web App (PWA)** and can be installed on Android, iOS, and desktop as a native-like app.

### What's Included:

1. **manifest.json** - App metadata (name, icons, shortcuts, display mode)
2. **service-worker.js** - Offline support and asset caching
3. **index.html** - PWA meta tags and app configuration
4. **Optimized build** - Code splitting (vendor, mathjs chunks)

---

## Installation Methods

### Android Tablet

1. **Open Chrome** and navigate to your deployed app URL
2. **Wait 2-3 seconds** for install prompt to appear
3. **Tap "Install"** in the address bar (or menu → "Install app")
4. App installs to home screen as standalone app
5. Launches in **landscape-locked mode** on game pages

### iOS (iPad/iPhone)

1. **Open Safari** and navigate to your app URL
2. **Tap Share** (bottom center)
3. **Tap "Add to Home Screen"**
4. **Tap "Add"** to confirm
5. App appears on home screen with icon

### Desktop (Windows/Mac)

1. **Open Chrome** and navigate to your app URL
2. **Click install icon** in address bar (if available)
3. Or: **Menu → More tools → Create shortcut**
4. App runs in window mode without browser UI

---

## Deployment Checklist

- [ ] Generate app icons (192×192 and 512×512 PNG files)
  - Place in `public/icon-192.png`, `public/icon-512.png`
  - Add maskable versions: `public/icon-maskable-192.png`, `public/icon-maskable-512.png`
- [ ] Generate screenshots (540×720 and 1280×720 PNG files)
  - Place in `public/screenshots/mathpop-540.png` and `mathpop-1280.png`
- [ ] Deploy to HTTPS (required for PWA)
  - PWA only works on HTTPS (or localhost)
- [ ] Test on Android:

  ```bash
  npm run build
  npm run preview  # Test locally at http://localhost:4173
  ```

- [ ] Test install flow:
  - Android: Wait for Chrome install prompt
  - iOS: Use Share → Add to Home Screen
  - Desktop: Check install icon in address bar

---

## Offline Support

- **Service Worker** caches HTML, CSS, JS on first load
- **Network-first strategy**: Always tries network, falls back to cache
- **Cache updates**: Fresh assets are fetched and cached automatically
- Users can play offline (except new content requires online fetch)

---

## App Customization

Edit `public/manifest.json` to change:

- App name and description
- Theme colors
- Start URL and scope
- App shortcuts
- Display orientation

---

## Development vs Production

**Development:**

```bash
npm run dev        # Hot reload enabled, no service worker caching
```

**Production:**

```bash
npm run build      # Optimized bundle, service worker active
npm run preview    # Test production build locally
```

---

## Troubleshooting

| Issue                             | Solution                                      |
| --------------------------------- | --------------------------------------------- |
| Install prompt not showing        | Requires HTTPS (or localhost)                 |
| App not caching offline           | Check service worker registration in DevTools |
| Landscape orientation not locking | Only works in fullscreen on mobile game pages |
| Icon not showing                  | Ensure PNG files are in `public/` folder      |

---

## Next Steps

1. **Create icons**: Use icon generator tool (e.g., favicon-generator.org)
2. **Deploy to HTTPS**: Use Vercel, Netlify, or your own server
3. **Test on Android tablet** with Chrome
4. **Monitor PWA metrics** in Chrome DevTools → Application tab

---

## Files Modified

- `index.html` - Added PWA meta tags and service worker registration
- `public/manifest.json` - App metadata configuration
- `public/service-worker.js` - Offline caching logic
- `vite.config.js` - Build optimization and code splitting
- `package.json` - Added @vitejs/plugin-react

**MathPop is app-ready!** 🎮📱
