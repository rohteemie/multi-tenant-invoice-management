# Progressive Web App (PWA) Features

This application is a fully functional Progressive Web App that can be installed on any device and used like a native application.

## Features

### 🚀 Installation
- **Install on any device**: Works on iOS, Android, Windows, macOS, and Linux
- **Custom install prompt**: User-friendly notification with dismiss option
- **One-click installation**: Easy install process across all platforms

### 📱 Native App Experience
- **Standalone mode**: Opens in its own window without browser UI
- **App icon**: Custom branded icon on your home screen or app launcher
- **Splash screen**: Professional loading experience
- **Theme integration**: Matches your system theme

### 🔌 Offline Support
- **Service worker caching**: Critical assets cached for offline access
- **Runtime caching**: Pages and resources cached as you use them
- **Automatic updates**: Service worker updates automatically in the background

## Installation Guide

### Desktop (Chrome, Edge, Brave)
1. Click the install icon in the address bar, OR
2. Look for the "Install App" notification at the bottom right
3. Click "Install" to add the app to your system

### Mobile (iOS Safari)
1. Tap the Share button (square with arrow)
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to install

### Mobile (Android Chrome)
1. Look for the "Install App" notification
2. Tap "Install" to add to your home screen
3. Find the app in your app drawer

## For Developers

### Service Worker
The service worker is located at `public/sw.js` and automatically:
- Caches critical assets on installation
- Implements a cache-first strategy for performance
- Updates cache in the background
- Handles offline scenarios gracefully

### Manifest
The web app manifest is at `public/manifest.json` and defines:
- App name and description
- Icons and theme colors
- Display mode (standalone)
- Start URL and scope

### Testing PWA Features

**Check Service Worker Registration:**
```javascript
navigator.serviceWorker.getRegistrations().then(console.log)
```

**Check if App is Installed:**
```javascript
window.matchMedia('(display-mode: standalone)').matches
```

**Manual Testing:**
1. Run `npm run build`
2. Serve the `dist` folder (e.g., `npx serve dist`)
3. Open in browser and test install functionality

**Lighthouse Audit:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run PWA audit
4. Check for PWA installation criteria

### Customization

**Update Icons:**
1. Modify `public/icon.svg`
2. Run icon generation script to create PNGs
3. Update `manifest.json` if changing icon paths

**Update Service Worker Caching:**
- Edit `PRECACHE_ASSETS` in `public/sw.js` to change cached files
- Increment `CACHE_NAME` version when making changes
- Test offline functionality after changes

**Modify Install Prompt:**
- Edit `src/components/pwa/InstallPWA.tsx`
- Customize styling, text, or behavior
- Add analytics tracking if desired

## Browser Support

| Browser | Desktop | Mobile | Install |
|---------|---------|--------|---------|
| Chrome  | ✅ | ✅ | ✅ |
| Edge    | ✅ | ✅ | ✅ |
| Safari  | ✅ | ✅ | ✅* |
| Firefox | ✅ | ✅ | ⚠️** |

\* iOS Safari requires manual "Add to Home Screen"  
\*\* Firefox supports service workers but has limited install UI

## Troubleshooting

**Install prompt not showing:**
- Check that you're using HTTPS or localhost
- Clear browser cache and reload
- Check DevTools Console for errors

**Service worker not registering:**
- Verify `sw.js` is in the `public` folder
- Check that the path `/sw.js` is accessible
- Inspect Application tab in Chrome DevTools

**Icons not displaying:**
- Verify icon files exist in `public` folder
- Check manifest.json icon paths are correct
- Clear cache and hard reload (Ctrl+Shift+R)

## Resources

- [MDN Web Docs: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: Learn PWA](https://web.dev/learn/pwa/)
- [Chrome Developers: PWA Checklist](https://web.dev/pwa-checklist/)
