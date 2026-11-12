---
name: code-review
description: 'Review CineScope code changes for correctness, architecture, React Native compatibility, and regressions. Use for PR reviews or when asked to review an implementation.'
argument-hint: 'Describe the change or provide the files or diff to review'
---

# CineScope Code Review

Use this workflow for CineScope pull request reviews or when asked to review an implementation. Follow `AGENTS.md` and project requirements. Review only the requested change and directly related code; do not modify files unless explicitly approved.

## Workflow

1. Read `AGENTS.md` and the relevant project requirements.
2. Inspect the changed files and enough surrounding implementation to understand the behavior and its callers.
3. Evaluate correctness and regressions, prioritizing issues that can cause observable failures or break agreed project requirements.
4. Verify suspected findings against the code and tests. Distinguish confirmed issues from potential risks.
5. Report actionable findings in severity order, with precise locations and the smallest recommended fix.
6. If no actionable issues are found, state that clearly and mention meaningful coverage limitations.

## CineScope review areas

Consider the areas relevant to the change:

- TypeScript correctness and type safety.
- React and React Native behavior and feature-based architecture.
- OMDb requests, data mapping, error handling, and TanStack Query caching.
- Expo Router navigation and route parameter handling.
- iOS, Android, and Web compatibility.
- Accessibility, responsive behavior, and loading/error/empty states.
- Missing or insufficient tests.

Do not suggest unrelated refactoring or new features.

## Findings format

For each finding, include:

- **Severity:** P0, P1, P2, or P3.
- **Location:** File and relevant line or code location.
- **Issue:** What is wrong and the potential impact.
- **Recommended fix:** The smallest change that addresses it.

Order findings from highest to lowest severity. Avoid reporting stylistic preferences as bugs, and do not present an unverified risk as a confirmed issue.
