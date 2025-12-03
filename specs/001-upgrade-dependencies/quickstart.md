# Quickstart: Dependency Upgrade Execution

**Feature**: 001-upgrade-dependencies  
**Date**: 2025-12-01  
**Status**: Complete  
**Estimated Time**: 2-3 hours (including testing)

## Overview

This guide provides step-by-step instructions for executing the coordinated upgrade of Node.js, Next.js, React, MUI, and TypeScript dependencies. Follow these steps in order to ensure a smooth upgrade process with proper validation at each stage.

---

## Prerequisites

### Required Tools
- Git (for version control and rollback)
- Node.js 20.9.0 or higher (check with `node --version`)
- Yarn package manager (check with `yarn --version`)
- Web browser with DevTools (Chrome, Firefox, or Safari)

### Before You Begin
1. **Commit all current changes**: Ensure working directory is clean
2. **Create backup branch**: Optional safety measure
3. **Note current performance baseline**: Record page load time for comparison
4. **Review spec and plan**: Familiarize yourself with [spec.md](spec.md) and [plan.md](plan.md)

---

## Phase 1: Pre-Upgrade Baseline (15 minutes)

### Step 1.1: Create Feature Branch
```bash
# Ensure you're on main branch and up to date
git checkout main
git pull origin main

# Create and checkout feature branch
git checkout -b 001-upgrade-dependencies
```

### Step 1.2: Record Performance Baseline
```bash
# Start development server
yarn dev

# Open browser to http://localhost:3000
# Open DevTools > Performance tab
# Click Record, wait for page to load, stop recording
# Note these metrics:
# - Page load time (navigation start to interactive): _______ seconds
# - Scatter plot render time (visible in timeline): _______ ms
# - Memory usage: _______ MB
```

### Step 1.3: Run Security Audit (Baseline)
```bash
# Check for vulnerabilities before upgrade
yarn audit

# Note count of vulnerabilities:
# - Critical: _______
# - High: _______
# - Moderate: _______
# - Low: _______
```

### Step 1.4: Verify Build Works
```bash
# Ensure current build is successful
yarn build

# Note build time: _______ seconds
# Note any warnings or errors (should be none)
```

---

## Phase 2: Dependency Upgrade (30 minutes)

### Step 2.1: Verify Current Package Versions
```bash
# Review current versions
cat package.json | grep -A 20 '"dependencies"'
cat package.json | grep -A 20 '"devDependencies"'
```

**Note**: Based on research.md findings, dependencies are already at target versions. This step verifies current state.

### Step 2.2: Update package.json (if needed)

The current `package.json` appears to already have target versions. Verify these match the contract:

**Expected versions** (from [contracts/package-json-schema.md](contracts/package-json-schema.md)):
- `next`: `^16.0.0` ✅
- `react`: `^19.2.0` ✅
- `react-dom`: `^19.2.0` ✅
- `@mui/material`: `^7.3.5` ✅
- `@mui/icons-material`: `^7.3.5` ✅
- `@emotion/react`: `^11.14.0` ✅
- `@emotion/styled`: `^11.14.0` ✅
- `typescript`: `^5.9.3` ✅
- `@types/react`: `^19` ✅
- `@types/react-dom`: `^19` ✅
- `@types/d3`: `^7.4.3` ✅
- `@types/node`: `^22` ✅
- `eslint-config-next`: `^16.0.0` ✅

If any versions don't match, update them manually in `package.json`.

### Step 2.3: Update Node.js Engine Requirement

Verify `package.json` contains:
```json
{
  "engines": {
    "node": ">=20.9.0"
  }
}
```

This is already set correctly ✅

### Step 2.4: Clean Install Dependencies
```bash
# Remove old node_modules and yarn.lock to ensure clean state
rm -rf node_modules
rm yarn.lock

# Fresh install with new versions
yarn install

# Check for peer dependency warnings
# Expected: No warnings (all peer dependencies satisfied)
```

### Step 2.5: Verify Installed Versions
```bash
# Check installed versions match package.json
yarn list --pattern "react|next|@mui|typescript" --depth=0
```

---

## Phase 3: Configuration Updates (15 minutes)

### Step 3.1: Update TypeScript Configuration (Optional Enhancement)

Consider adding React 19 recommended option to `tsconfig.json`:

```bash
# Backup current tsconfig.json
cp tsconfig.json tsconfig.json.backup

# Edit tsconfig.json and add to compilerOptions:
# "noUncheckedSideEffectImports": true
```

Or keep current configuration (already compatible with TypeScript 5.9.3).

### Step 3.2: Verify ESLint Configuration

Check that `eslint.config.mjs` uses correct Next.js config version:
```bash
cat eslint.config.mjs
```

Should see `eslint-config-next@16.0.0` in dependencies (already installed).

### Step 3.3: Run Type Check
```bash
# Run TypeScript compiler to check for type errors
npx tsc --noEmit

# Expected: No errors
# If errors appear, they may be due to stricter React 19 types
# Review each error and fix according to React 19 migration guide
```

---

## Phase 4: Build and Test (45 minutes)

### Step 4.1: Development Server Test
```bash
# Start development server with Turbopack
yarn dev

# Expected output:
# ✓ Ready in XXXms
# ○ Compiling / ...
# ✓ Compiled / in XXXms

# Check terminal for warnings or errors (should be none)
```

### Step 4.2: Browser Functionality Test

Open http://localhost:3000 and verify:

**Basic Functionality**:
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] No React warnings in console
- [ ] MUI theme applied correctly (check sidebar styling)

**Data Loading**:
- [ ] CSV data loads successfully
- [ ] All 4800 points render in scatter plot
- [ ] Chart axes display correctly
- [ ] Zoom and pan interactions work

**Polygon Features**:
- [ ] Click to start drawing polygon
- [ ] Click to add polygon points
- [ ] Visual feedback shows polygon outline
- [ ] Complete polygon by clicking near start point
- [ ] Sidebar shows selected point count and percentage
- [ ] Edit polygon button opens PopupEditor
- [ ] Delete polygon removes it from chart

**Performance Check**:
- [ ] Initial page load feels responsive (<5s target)
- [ ] Scatter plot renders quickly (<500ms target)
- [ ] Polygon selection feedback is immediate (<100ms target)

### Step 4.3: Production Build Test
```bash
# Stop dev server (Ctrl+C)

# Build for production
yarn build

# Expected output:
# Route (app)                              Size     First Load JS
# ┌ ○ /                                    ...      ...
# + First Load JS shared by all            ...

# Note build time: _______ seconds
# Compare to baseline (should be within 15%)
```

### Step 4.4: Production Server Test
```bash
# Start production server
yarn start

# Open http://localhost:3000
# Repeat functionality tests from Step 4.2
# Verify behavior matches development server
```

### Step 4.5: Measure Performance
```bash
# With production server running:
# Open browser to http://localhost:3000
# Open DevTools > Performance tab
# Record page load
# Compare to baseline metrics from Phase 1:

# Page load time: _______ seconds (must be ≤5s)
# Scatter plot render: _______ ms (target ≤500ms)
# Memory usage: _______ MB (should be similar to baseline)

# Performance regression check:
# All metrics should be within 15% of baseline (per SC-010)
```

---

## Phase 5: Security and Validation (15 minutes)

### Step 5.1: Security Audit
```bash
# Run security audit on upgraded dependencies
yarn audit

# Expected: Zero high or critical vulnerabilities
# If vulnerabilities found:
# 1. Check if they're in direct or transitive dependencies
# 2. Try upgrading the affected package
# 3. Use yarn resolutions if necessary
# 4. Document any accepted risks
```

### Step 5.2: Run Contract Validation

If validation scripts exist, run them:
```bash
# Validate package.json against contract
cd specs/001-upgrade-dependencies/contracts
bash validate-package-json.sh  # (if script was created)

# Validate tsconfig.json against contract
bash validate-tsconfig.sh  # (if script was created)
```

Or manually verify against checklists in:
- [contracts/package-json-schema.md](contracts/package-json-schema.md)
- [contracts/tsconfig-schema.md](contracts/tsconfig-schema.md)

### Step 5.3: Run Linter
```bash
# Check for linting issues
yarn lint

# Expected: No errors or warnings
# If errors appear, fix according to ESLint rules
```

---

## Phase 6: Commit and Documentation (15 minutes)

### Step 6.1: Review Changes
```bash
# Check what files changed
git status

# Review dependency changes
git diff package.json

# Review lockfile changes (large diff)
git diff yarn.lock | head -n 50
```

### Step 6.2: Commit Upgrade
```bash
# Stage all changes
git add package.json yarn.lock

# If tsconfig.json was modified:
git add tsconfig.json

# Commit with descriptive message
git commit -m "feat: upgrade dependencies to React 19, Next.js 16, MUI 7, TypeScript 5.9

- Upgrade Node.js requirement to >=20.9.0 (LTS)
- Upgrade Next.js to 16.0.0 (Turbopack stable)
- Upgrade React and React DOM to 19.2.0
- Upgrade MUI packages to 7.3.5 (React 19 compatible)
- Upgrade Emotion to 11.14.0 (MUI 7 peer dependency)
- Upgrade TypeScript to 5.9.3 (React 19 types)
- Upgrade all @types/* to compatible versions
- Upgrade eslint-config-next to 16.0.0

All functionality verified working:
- CSV data loading and scatter plot rendering
- Polygon drawing, selection, and editing
- Performance within targets (≤5s initial load)
- Zero high/critical vulnerabilities
- Production build successful

Closes #001"
```

### Step 6.3: Update Documentation

Mark upgrade as complete in relevant files:
```bash
# Update TODO.md or project tracking documents if applicable
# Mark spec.md as implemented
# Update CLAUDE.md with any architectural notes (if needed)
```

---

## Phase 7: Deploy to Staging (Optional - 30 minutes)

If staging environment exists:

### Step 7.1: Push to Remote
```bash
# Push feature branch to remote
git push origin 001-upgrade-dependencies
```

### Step 7.2: Deploy to Staging

Follow your deployment process (e.g., Vercel, Netlify, AWS):
```bash
# Example for Vercel:
vercel --prod

# Or create pull request and deploy preview
```

### Step 7.3: Staging Acceptance Tests

Repeat all tests from Phase 4 in staging environment:
- [ ] All 4800 data points render correctly
- [ ] All user interactions work (zoom, pan, polygon drawing)
- [ ] Performance meets targets (≤5s load time)
- [ ] No console errors or warnings
- [ ] MUI styling matches pre-upgrade
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)

---

## Rollback Procedure (Emergency Use Only)

If critical issues are discovered after upgrade:

### Option A: Revert Commit (if not pushed)
```bash
# Reset to commit before upgrade
git reset --hard HEAD~1

# Reinstall pre-upgrade dependencies
yarn install

# Verify application works
yarn dev
```

### Option B: Revert Commit (if pushed)
```bash
# Create revert commit
git revert <upgrade-commit-sha>

# Push revert
git push origin 001-upgrade-dependencies

# Reinstall pre-upgrade dependencies
yarn install

# Verify application works
yarn dev
```

### Option C: Manual Rollback
```bash
# Checkout package.json from before upgrade
git checkout HEAD~1 -- package.json

# Remove current dependencies
rm -rf node_modules yarn.lock

# Reinstall old versions
yarn install

# Test application
yarn dev

# If working, commit rollback
git commit -m "revert: rollback dependency upgrade due to [REASON]"
```

---

## Troubleshooting Guide

### Issue: `yarn install` fails with peer dependency errors

**Solution**:
```bash
# Check which packages have conflicts
yarn install 2>&1 | grep "peer dependency"

# For each conflict, check if newer version exists
yarn info <package-name> peerDependencies

# Update package.json with compatible versions
# Or use yarn resolutions to force specific versions
```

### Issue: TypeScript compilation errors after upgrade

**Solution**:
```bash
# Run type check to see specific errors
npx tsc --noEmit

# Common React 19 type issues:
# - FC children prop removed (use explicit children in Props)
# - Event types changed (use React.MouseEvent instead of any)

# Fix each error according to TypeScript/React 19 migration guide
```

### Issue: MUI components not rendering correctly

**Solution**:
```bash
# Check if Emotion packages are installed
yarn list @emotion/react @emotion/styled

# Verify versions match MUI 7 requirements (^11.14.0)
# Clear Next.js cache
rm -rf .next
yarn dev
```

### Issue: Performance regression detected

**Solution**:
```bash
# Profile application with React DevTools Profiler
# Identify which component is slow
# Check for:
# - Unnecessary re-renders (use React.memo if needed)
# - D3 scale recalculation on every render (should be memoized)
# - Large dataset issues (verify CSV parsing is efficient)

# If performance cannot be recovered:
# Consider rolling back and investigating offline
```

### Issue: `yarn build` succeeds but `yarn start` crashes

**Solution**:
```bash
# Check production server logs for error details
yarn start 2>&1 | tee build-error.log

# Common issues:
# - Environment variables missing in production
# - Dynamic imports not configured correctly
# - Next.js config incompatible with version 16

# Review Next.js 16 migration guide
# Check next.config.ts for deprecated options
```

---

## Post-Upgrade Checklist

### All Tests Passed
- [ ] `yarn install` completed without errors
- [ ] `yarn audit` shows zero high/critical vulnerabilities
- [ ] `npx tsc --noEmit` passed with zero errors
- [ ] `yarn lint` passed with zero errors
- [ ] `yarn build` completed successfully
- [ ] `yarn dev` starts without warnings
- [ ] `yarn start` runs production server successfully
- [ ] All functionality tests passed (data load, chart, polygons)
- [ ] Performance metrics within targets
- [ ] Browser console shows no errors or warnings
- [ ] MUI styling matches pre-upgrade version

### Documentation Updated
- [ ] Git commit created with descriptive message
- [ ] Changes pushed to remote repository
- [ ] Staging deployment successful (if applicable)
- [ ] Project tracking updated (TODO.md, issue closed)
- [ ] Team notified of upgrade completion

### Ready for Production
- [ ] Staging acceptance tests completed
- [ ] Performance verified in staging environment
- [ ] Multiple browser testing completed
- [ ] Rollback procedure documented and understood
- [ ] Pull request created for review (if using PR workflow)

---

## Success Criteria Verification

Map to spec.md Success Criteria:

| ID | Criterion | Verification Method | Status |
|----|-----------|---------------------|--------|
| SC-001 | Node.js >=20.9.0 | Check package.json engines field | [ ] |
| SC-002 | Next.js 16.0.0 | Check package.json dependencies | [ ] |
| SC-003 | React 19.2.0 | Check package.json dependencies | [ ] |
| SC-004 | MUI 7.3.5 | Check package.json dependencies | [ ] |
| SC-005 | TypeScript 5.9.3 | Check package.json devDependencies | [ ] |
| SC-006 | Zero vulnerabilities | Run `yarn audit` | [ ] |
| SC-007 | Build succeeds | Run `yarn build` | [ ] |
| SC-008 | Dev server no warnings | Run `yarn dev` and check output | [ ] |
| SC-009 | All features work | Manual functionality testing | [ ] |
| SC-010 | Build time within 15% | Compare build times | [ ] |
| SC-011 | No peer warnings | Check `yarn install` output | [ ] |
| SC-012 | Staging tests pass | Run acceptance tests in staging | [ ] |
| SC-013 | Load time ≤5s | Measure with browser DevTools | [ ] |

---

## Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 15 min | Pre-upgrade baseline measurement |
| Phase 2 | 30 min | Dependency upgrade execution |
| Phase 3 | 15 min | Configuration updates |
| Phase 4 | 45 min | Build and comprehensive testing |
| Phase 5 | 15 min | Security audit and validation |
| Phase 6 | 15 min | Git commit and documentation |
| Phase 7 | 30 min | Staging deployment (optional) |
| **Total** | **2-3 hours** | Including all testing and validation |

---

## Next Steps

After successful upgrade completion:

1. **Merge to main**: Create pull request or merge feature branch
2. **Deploy to production**: Follow standard deployment workflow
3. **Monitor production**: Watch for errors in production logs
4. **Move to next feature**: Proceed with next spec in pipeline

---

## References

- [Feature Specification](spec.md)
- [Implementation Plan](plan.md)
- [Research Document](research.md)
- [Data Model](data-model.md)
- [Package JSON Contract](contracts/package-json-schema.md)
- [TypeScript Config Contract](contracts/tsconfig-schema.md)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [MUI 7 Migration Guide](https://mui.com/material-ui/migration/migrating-to-v7/)

---

**Quickstart Complete**: 2025-12-01  
**Ready for Execution**: Yes ✅
