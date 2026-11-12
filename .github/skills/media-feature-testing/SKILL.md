---
name: media-feature-testing
description: 'Write, improve, or troubleshoot tests for CineScope media features. Use when testing media API and repository behavior, OMDb mapping and failures, TanStack Query hooks, loading/error/empty UI states, or media navigation.'
argument-hint: 'Describe the media behavior or test failure'
---

# Media Feature Testing

Use this workflow for tests in `src/features/media` and closely related media UI. Follow the repository's `AGENTS.md` instructions and keep the change limited to the requested behavior.

## Workflow

1. Read the implementation, its existing tests, and the relevant types or fixtures before editing. Identify the user-visible or API-facing contract the test should protect.
2. Extend the nearest existing test file and reuse helpers under `src/features/media/test-utils`. Keep fixtures representative and typed; do not duplicate setup that a shared helper already provides.
3. Use the installed Jest, `jest-expo`, and React Native Testing Library setup. Do not add test dependencies or change project configuration for a feature test without approval.
4. Test observable behavior rather than private implementation details. Cover only relevant cases, including boundary or failure paths when they are part of the contract.
5. Run the focused Jest test file, then any additional checks warranted by the change. Report commands and results accurately.

## Media-specific guidance

- **OMDb client and repository:** Mock `fetch`; never call the live OMDb service. Cover request parameters and mapping where relevant, HTTP and OMDb `Response: "False"` failures, malformed or missing data, and cancellation with `AbortSignal`.
- **Mappers:** Use typed OMDb fixtures to check normalized domain values, including `"N/A"`, absent posters, optional metadata, and supported media types.
- **TanStack Query hooks:** Use the existing query provider/test patterns. Await asynchronous outcomes with Testing Library's `waitFor`; verify loading, success, error, retry, and request deduplication only where relevant to the behavior under test.
- **UI and navigation:** Prefer accessible queries and user-visible assertions. Cover loading, empty, error/retry, media labels, and route behavior as appropriate; avoid snapshots as the only evidence for interactive behavior.
- **Isolation:** Use `setupOmdbTestEnvironment` for tests that require the OMDb environment variable. Restore mocks and other changed global state, and do not put real API keys in fixtures or tests.

## Verification

Run the narrowest applicable test first, for example:

```bash
npm test -- --runInBand src/features/media/hooks/useMediaCollection.test.tsx
```

For changes that affect shared types or behavior across media features, also run the relevant broader tests and project checks such as `npm run typecheck` or `npm run lint`. Do not claim checks that were not run.
