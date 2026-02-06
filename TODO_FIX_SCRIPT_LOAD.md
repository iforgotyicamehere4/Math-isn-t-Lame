# Fix Script Loading Errors for BennyWorld Page

## Issue

The page tries to load `public/js/bennyworld-babylon.js` which is empty (0 bytes), causing script loading errors.

## Plan

- [x] 1. Remove empty `public/js/bennyworld-babylon.js` file
- [x] 2. Update `BennyWorld.jsx` to remove redundant `useScriptOnce` call for bennyworld-babylon
- [x] 3. Verify the fix works

## Files Modified

- `public/js/bennyworld-babylon.js` - Removed (empty file)
- `src/pages/BennyWorld.jsx` - Removed redundant script load

## Notes

The Babylon 3D placeholder code is already embedded inside `bennyworld.js`, so removing the empty file and redundant load call will fix the errors.
