# Research: Dependency Upgrade Best Practices

**Feature**: 001-upgrade-dependencies  
**Date**: 2025-12-01  
**Status**: Complete

## Research Tasks

This document resolves all "NEEDS CLARIFICATION" items from Technical Context and provides best practices for each technology upgrade.

---

## 1. React 19.2.0 Migration Strategy

### Decision: Incremental adoption with backward compatibility focus

**Research findings**:
- React 19 introduces new features (Actions, `use()` hook, ref as prop) but maintains backward compatibility for existing patterns
- Context API remains unchanged - existing ChartContext/ChartDispatchContext will work without modification
- `react-dom` client rendering APIs (`createRoot`) are stable from React 18
- Key breaking changes: removed deprecated lifecycle methods (none used in project), stricter key requirements in lists

**Rationale**:
- Project uses modern React patterns (hooks, Context API, functional components) that are fully compatible with React 19
- No class components exist in codebase that would be affected by lifecycle deprecations
- Existing D3 integration pattern (useEffect + useRef) remains valid

**Migration steps**:
1. Update `react` and `react-dom` to 19.2.0 in package.json
2. Review all list rendering for proper key props (Chart.tsx data point mapping)
3. Test Context API integration (ChartContext.tsx)
4. Verify D3 ref manipulation patterns still work

**Alternatives considered**:
- Stay on React 18: Rejected - security updates and ecosystem momentum favor React 19
- Big-bang migration with new features: Rejected - adds scope creep; basic upgrade sufficient for stability

---

## 2. Next.js 16.0.0 Migration Strategy

### Decision: Update to App Router-compatible 16.0.0 with minimal configuration changes

**Research findings**:
- Next.js 16.0.0 stabilizes App Router (already in use in this project)
- Turbopack dev server (already configured via `--turbopack` flag) is production-ready in 16.0
- Breaking changes: removed legacy `pages/` directory support (not used), updated image optimization defaults
- `next.config.ts` TypeScript support is native (already using .ts extension)
- Performance improvements: faster cold starts, improved bundling with Turbopack

**Rationale**:
- Project already uses App Router (`src/app/layout.tsx`, `src/app/page.tsx`) - no migration needed
- Turbopack is already enabled in dev script - upgrade improves stability
- No legacy Pages Router code to migrate

**Migration steps**:
1. Update `next` to 16.0.0 in package.json
2. Update `eslint-config-next` to 16.0.0 for lint rule compatibility
3. Review `next.config.ts` for deprecated options (none identified in current config)
4. Test dev server startup with Turbopack (`yarn dev`)
5. Test production build (`yarn build`)

**Alternatives considered**:
- Stay on Next.js 15: Rejected - 16.0 provides critical Turbopack stability fixes
- Migrate to Pages Router: Rejected - App Router is the modern standard and already in use

---

## 3. Material-UI 7.3.5 Migration Strategy

### Decision: Coordinated upgrade of all MUI packages to 7.3.5 with React 19 compatibility

**Research findings**:
- MUI 7.x requires React 19.x (peer dependency enforced)
- Emotion CSS-in-JS remains the styling engine (@emotion/react, @emotion/styled)
- Breaking changes from MUI 6: updated theme structure, deprecated `sx` prop patterns, icon import paths changed
- MUI 7.3.5 is stable release with full React 19 support

**Rationale**:
- Cannot upgrade React to 19 without upgrading MUI to 7.x due to peer dependencies
- Project uses minimal MUI components (primarily layout and icons) - low migration risk
- Emotion dependencies must be upgraded in sync to avoid version conflicts

**Migration steps**:
1. Update `@mui/material` and `@mui/icons-material` to 7.3.5
2. Update `@emotion/react` and `@emotion/styled` to compatible versions (^11.14.0)
3. Review theme configuration in `src/app/layout.tsx` for deprecated options
4. Test all MUI components render correctly (Sidebar.tsx, PopupEditor.tsx)
5. Verify icon imports still work

**Alternatives considered**:
- Use MUI 6 with React 18: Rejected - does not satisfy React 19 upgrade requirement
- Replace MUI with headless UI: Rejected - out of scope for dependency upgrade; adds rewrite risk

---

## 4. TypeScript 5.9.3 Best Practices

### Decision: Maintain strict mode with updated type definitions for React 19 and D3

**Research findings**:
- TypeScript 5.9.3 includes improved type narrowing and decorator support
- Strict mode already enabled in tsconfig.json - no changes needed
- `@types/react@19` provides updated type definitions for React 19 APIs
- `@types/d3@7.4.3` aligns with D3.js 7.9.0 (already in use)
- New compiler options: `noUncheckedSideEffectImports` (recommended for React 19)

**Rationale**:
- Strict mode catches type errors early and improves code quality
- React 19 type definitions require TypeScript 5.1+ - 5.9.3 ensures full compatibility
- D3 type definitions prevent coordinate system mismatches (SVG space vs data space)

**Migration steps**:
1. Update `typescript` to 5.9.3 in devDependencies
2. Update `@types/react` and `@types/react-dom` to ^19
3. Update `@types/d3` to ^7.4.3
4. Update `@types/node` to latest LTS compatible version (^22)
5. Add `noUncheckedSideEffectImports: true` to tsconfig.json compilerOptions
6. Run type check (`tsc --noEmit`) and fix any new errors

**Alternatives considered**:
- Disable strict mode: Rejected - violates Constitution Principle IV (Type Safety)
- Stay on TypeScript 5.6: Rejected - 5.9.3 provides better React 19 support

---

## 5. Peer Dependency Conflict Resolution Strategy

### Decision: Use yarn upgrade-interactive with selective pinning for incompatible packages

**Research findings**:
- Yarn 1.x provides `yarn upgrade-interactive` for semi-automated upgrades
- Peer dependency warnings are non-blocking but indicate potential runtime issues
- React 19 ecosystem maturity: most popular libraries have React 19-compatible versions as of Dec 2025
- Selective pinning strategy: pin packages at last compatible version, document in package.json comments

**Rationale**:
- Interactive mode allows reviewing each upgrade individually
- Prevents automatic upgrades that might break functionality
- Pinning provides stability while ecosystem catches up

**Resolution workflow**:
1. Run `yarn upgrade-interactive --latest` to see all available upgrades
2. Select major version upgrades for core dependencies (React, Next.js, MUI, TypeScript)
3. Review peer dependency warnings after upgrade
4. For packages with React 19 conflicts:
   - Check npm registry for React 19-compatible versions
   - If available: upgrade to compatible version
   - If unavailable: pin to last compatible version with comment
5. Document all pinned packages in package.json with rationale
6. Run `yarn install` to update yarn.lock

**Alternatives considered**:
- Automated upgrade with `yarn upgrade --latest`: Rejected - too risky without review
- Manual package.json editing: Rejected - error-prone and misses transitive dependencies
- Use npm instead of yarn: Rejected - project already uses yarn.lock

---

## 6. Node.js 20.9.0 LTS Runtime Requirements

### Decision: Enforce Node.js 20.9.0+ via package.json engines field with yarn warning

**Research findings**:
- Node.js 20.x is current LTS (Long-Term Support) with security updates until 2026-04-30
- Version 20.9.0 includes critical performance improvements for ES modules
- Yarn respects `engines` field and warns (but does not block) on version mismatch
- Next.js 16.0 requires Node.js 18.17.0+ (20.9.0 exceeds minimum)

**Rationale**:
- LTS version ensures stability and security patches
- Warning approach allows developers to self-manage runtime without blocking builds
- Next.js 16 performance optimizations require modern Node.js features

**Enforcement approach**:
1. Update `package.json` `engines` field to `"node": ">=20.9.0"`
2. Yarn will display warning if developer's Node.js version is incompatible
3. Document Node.js requirement in project README.md
4. CI/CD pipeline should enforce exact version via `.nvmrc` or Docker

**Alternatives considered**:
- Strict enforcement with package manager: Rejected - blocks developers who cannot upgrade immediately
- No enforcement: Rejected - leads to inconsistent environments and hard-to-debug issues
- Use .nvmrc only: Rejected - not all developers use nvm; engines field is standard

---

## 7. Security Vulnerability Remediation

### Decision: Eliminate all high/critical vulnerabilities through dependency updates

**Research findings**:
- `yarn audit` identifies vulnerabilities in dependency tree
- Most vulnerabilities in outdated transitive dependencies (not direct dependencies)
- Upgrading to latest versions typically resolves vulnerabilities automatically
- Some vulnerabilities may require selective resolutions in package.json

**Remediation workflow**:
1. Run `yarn audit` before upgrade to establish baseline
2. Perform dependency upgrades as planned
3. Run `yarn audit` after upgrade to identify remaining vulnerabilities
4. For remaining high/critical issues:
   - Check if newer version exists: upgrade directly
   - Check if vulnerability is in transitive dependency: use `resolutions` field
   - If no fix available: assess risk and document acceptance or seek alternative package
5. Target: zero high/critical vulnerabilities

**Alternatives considered**:
- Ignore vulnerabilities: Rejected - security risk for production application
- Use automated tools (Dependabot, Renovate): Rejected - out of scope for manual upgrade task
- Patch vulnerabilities manually: Rejected - maintenance burden and fragile

---

## 8. Performance Regression Prevention

### Decision: Establish performance baseline before upgrade, verify after upgrade

**Research findings**:
- Next.js 16 + Turbopack provides faster dev server and build times
- React 19 includes automatic memo optimizations reducing re-renders
- MUI 7 uses updated Emotion version with improved CSS generation
- D3.js 7.9.0 unchanged - no rendering performance changes expected

**Performance targets** (from spec):
- Initial page load with 4800 points: ≤5 seconds
- Scatter plot render: ≤500ms (constitution requirement)
- Polygon selection feedback: ≤100ms (constitution requirement)

**Testing approach**:
1. Measure baseline performance before upgrade using browser DevTools Performance tab:
   - Record page load time from navigation start to interactive
   - Record scatter plot render time (Chart.tsx useEffect)
   - Record polygon selection response time (click → visual feedback)
2. Perform upgrade
3. Re-measure performance with identical dataset (CD45_pos.csv - 4800 points)
4. Compare results: all metrics must be within 15% of baseline (per spec SC-010)
5. If regression detected: profile bottleneck, investigate dependency changes, rollback if unresolvable

**Alternatives considered**:
- Skip performance testing: Rejected - spec requires ≤5s load time verification
- Automated performance CI: Rejected - out of scope for upgrade task; useful future enhancement
- Synthetic testing only: Rejected - real dataset testing more accurate

---

## 9. Rollback Strategy

### Decision: Git-based rollback with yarn.lock restoration for rapid recovery

**Research findings**:
- Git provides atomic rollback via `git revert` or `git reset --hard`
- yarn.lock ensures reproducible dependency installation
- Next.js builds are deterministic when dependencies are locked
- Feature branch strategy isolates upgrade changes from main

**Rollback procedure** (from spec):
1. Create feature branch `001-upgrade-dependencies` before starting
2. Commit all upgrade changes in atomic commits
3. If critical failure detected:
   - Option A (revert): `git revert <commit-sha>` to create revert commit
   - Option B (reset): `git reset --hard <pre-upgrade-commit>` if branch not pushed
4. Run `yarn install` to restore pre-upgrade dependencies from yarn.lock
5. Verify application works with `yarn dev` and `yarn build`
6. Investigate root cause in isolated environment
7. Apply targeted fix and re-attempt upgrade

**Criteria for rollback**:
- Critical functionality broken (data loading, chart rendering, polygon selection)
- Build fails and cannot be fixed within 2 hours
- Performance regression >15% that cannot be optimized
- Unresolvable peer dependency conflicts preventing installation

**Alternatives considered**:
- Manual dependency restoration: Rejected - error-prone and slow
- No rollback plan: Rejected - spec explicitly requires rollback strategy
- Package version pinning without Git: Rejected - loses configuration and code changes

---

## 10. Testing Strategy for Staging Environment

### Decision: Manual acceptance testing in staging environment covering all user workflows

**Research findings**:
- Spec requires staging verification before production deployment
- No automated tests exist (testing is OPTIONAL per constitution)
- Manual testing sufficient for visual/interactive features (scatter plot, polygon drawing)
- Test coverage must include all functional requirements (FR-001 to FR-015)

**Test plan**:
1. **Environment setup**:
   - Deploy to staging environment (matching production config)
   - Use full CD45_pos.csv dataset (4800 points)
   - Test on target browsers (Chrome, Firefox, Safari latest)

2. **Functional test cases** (from spec acceptance scenarios):
   - ✓ Load application - verify no console errors
   - ✓ Load CSV data - verify all 4800 points render
   - ✓ Interact with scatter plot - verify zoom, pan work
   - ✓ Draw polygon - verify click-to-draw, visual feedback
   - ✓ Select points in polygon - verify count/percentage display
   - ✓ Edit polygon - verify editor opens, modifications persist
   - ✓ Delete polygon - verify removal works

3. **Performance test cases**:
   - ⏱ Measure initial page load time (must be ≤5s)
   - ⏱ Measure scatter plot render time (should be ≤500ms)
   - ⏱ Measure polygon selection feedback (should be ≤100ms)

4. **Regression test cases**:
   - Compare behavior to pre-upgrade version
   - Verify no new console warnings or errors
   - Check MUI styling matches previous version

5. **Pass criteria**: All functional tests pass, performance within targets, no regressions

**Alternatives considered**:
- Skip staging testing: Rejected - spec explicitly requires staging verification
- Automated E2E tests: Rejected - out of scope and not requested in spec
- Production testing only: Rejected - too risky for user-facing application

---

## Technology Stack Summary

### Final Dependency Versions

| Package | Current | Target | Justification |
|---------|---------|--------|---------------|
| node | >=20.9.0 | >=20.9.0 | Already set - LTS with Next.js 16 support |
| next | ^16.0.0 | ^16.0.0 | Already updated - Turbopack stability |
| react | ^19.2.0 | ^19.2.0 | Already updated - Required for MUI 7 |
| react-dom | ^19.2.0 | ^19.2.0 | Already updated - Matches React version |
| @mui/material | ^7.3.5 | ^7.3.5 | Already updated - React 19 compatibility |
| @mui/icons-material | ^7.3.5 | ^7.3.5 | Already updated - Match material version |
| @emotion/react | ^11.14.0 | ^11.14.0 | Already updated - MUI 7 peer dependency |
| @emotion/styled | ^11.14.0 | ^11.14.0 | Already updated - MUI 7 peer dependency |
| typescript | ^5.9.3 | ^5.9.3 | Already updated - React 19 type support |
| @types/react | ^19 | ^19 | Already updated - React 19 types |
| @types/react-dom | ^19 | ^19 | Already updated - React DOM 19 types |
| @types/d3 | ^7.4.3 | ^7.4.3 | Already updated - D3 7.9.0 types |
| @types/node | ^22 | ^22 | Already updated - Node.js 20 LTS types |
| eslint-config-next | ^16.0.0 | ^16.0.0 | Already updated - Next.js 16 compatibility |
| d3 | ^7.9.0 | ^7.9.0 | No change - Already latest stable |

**Note**: Current package.json analysis shows all dependencies are already at target versions. This research validates the existing dependency versions and provides migration guidance for any adjustments needed during implementation.

---

## Risk Assessment

### High Risk Items
- **React 19 Context API edge cases**: Unlikely but possible behavior changes in Context re-rendering
  - **Mitigation**: Thorough testing of ChartContext state updates and dispatch actions

### Medium Risk Items
- **MUI theme configuration changes**: Deprecated theme options may break styling
  - **Mitigation**: Review MUI 7 migration guide, test all MUI components
- **Next.js build configuration**: next.config.ts may have deprecated options
  - **Mitigation**: Review Next.js 16 changelog, test dev and production builds

### Low Risk Items
- **TypeScript strict mode errors**: New type checking rules may catch existing issues
  - **Mitigation**: Fix type errors incrementally, acceptable to refine types
- **D3 integration**: No D3 version change, React 19 hooks behavior stable
  - **Mitigation**: Test scatter plot rendering and interaction patterns

---

## Open Questions

**None** - All NEEDS CLARIFICATION items from Technical Context have been resolved through research.

---

## References

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Material-UI 7 Migration Guide](https://mui.com/material-ui/migration/migrating-to-v7/)
- [TypeScript 5.9 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)
- [Node.js 20 LTS Release Schedule](https://nodejs.org/en/about/previous-releases)
- [Yarn Upgrade Interactive Documentation](https://classic.yarnpkg.com/en/docs/cli/upgrade-interactive/)

---

**Research Complete**: 2025-12-01  
**Next Phase**: Phase 1 - Design (data-model.md, contracts/, quickstart.md)
