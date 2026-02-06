# Fix Plan for Test, Build, and Lint Issues

## Priority 1: Fix Build Blocker

- [ ] Fix import path in src/decimal/decimal.js from `../decimal.logic.js` to `./decimal.logic.js`

## Priority 2: Fix Unit Test Imports

- [ ] Fix import path in src/**tests**/decimal-easy25.test.js from `../decimal.logic.js` to `../decimal/decimal.logic.js`

## Priority 3: Fix E2E Test Conflicts

- [ ] Exclude tests/e2e/\*\* from vitest.config.js to prevent Vitest from picking up Playwright tests

## Priority 4: Fix Home Test

- [ ] Update src/**tests**/home.test.jsx to match actual Home.jsx text

## Priority 5: Fix Major Lint Errors (optional for now)

- [ ] Fix useScriptOnce.js ref during render errors
- [ ] Fix decimal.js unused variables and escape characters
- [ ] Fix decimal.logic.js unnecessary escapes

## Verification Commands

```bash
npm run build    # Should pass
npm test         # Unit tests should pass
npm run lint     # Should show fewer errors
```
