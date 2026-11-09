---
name: validate-changes
description: "Validate CineScope implementation changes with relevant tests, TypeScript, ESLint, and regression checks. Use after code changes or before merging a PR."
argument-hint: "Describe the changes or files to validate"
---

# CineScope Change Validation

Use this workflow to verify CineScope code changes. Follow `AGENTS.md`, validate the requested change rather than a proxy, and do not modify code without explicit approval.

## Workflow

1. Read `AGENTS.md`, inspect `package.json`, and identify the changed files and affected behavior.
2. Locate the most relevant existing tests and choose the narrowest checks that cover the change.
3. Run focused tests first. Expand to broader tests or project checks when the changes affect shared behavior or targeted results indicate a need.
4. Review the diff and relevant surrounding code for regressions not covered by automated checks.
5. Report results and remaining risks. Never claim a check passed unless it was actually executed.
6. If a check fails, explain the failure and propose the smallest appropriate fix. Do not make changes without explicit approval.

## CineScope regression areas

Consider the applicable areas, rather than checking every area for every change:

- Home collections and mixed movie/series behavior.
- Media Details and route parameter handling.
- Expo Router navigation and returning to Home.
- OMDb requests, mapping, cancellation, and TanStack Query caching.
- Loading, error, empty, retry, and poster fallback states.
- Accessibility and responsive behavior across supported platforms.

## Verification and reporting

Use the scripts that exist in `package.json` and that are relevant to the change:

```bash
npm test -- --runInBand <relevant-test-file>
npm run check
```

Run `npm run check` when dependencies and the environment permit. Run the full test suite when the scope or targeted results justify it. Clearly list:

- Checks passed.
- Checks failed, with relevant output or cause.
- Checks not run, and why.
- Remaining risks or unverified behavior.
