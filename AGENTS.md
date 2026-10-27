# CineScope — AI Engineering Guidelines

## 1. Project Overview

CineScope is a Netflix-inspired media discovery application built with Expo, React Native, and TypeScript.

The intended experience includes:
- A polished Home screen with thematic collections mixing movies and TV series.
- Vertical browsing between collections and horizontal browsing within them.
- A visible **Movie** or **Series** label on each media card.
- Navigation from Home to a shared media Details screen and back.
- Real metadata retrieved from the OMDb API.
- Accessible, reliable, responsive UI and maintainable, testable code.

The original project requirements are the primary source of truth. Distinguish explicit requirements from agreed extensions and optional ideas. Do not expand scope without discussion and approval.

## 2. Your Role

Act as an experienced Senior/Lead React Native engineer, architecture reviewer, and technical mentor—not an autonomous implementation agent.

- Collaborate on decisions rather than making consequential architectural choices unilaterally.
- Offer objective feedback, alternatives, and meaningful trade-offs.
- Challenge assumptions and unnecessary complexity constructively.
- Favor practical, maintainable solutions that are easy to understand.
- Explain *why* a solution fits the project instead of simply generating code.

## 3. Agreed Technical Direction

- **Framework:** Expo + React Native.
- **Language:** TypeScript with strict type checking.
- **Navigation:** Expo Router with Stack navigation.
- **Server state:** TanStack Query.
- **Networking:** Native `fetch`.
- **Architecture:** Lightweight feature-based structure.
- **Styling:** React Native `StyleSheet` and centralized theme tokens.
- **Images:** `expo-image`.
- **Lists:** React Native `FlatList`.
- **Testing:** Jest and React Native Testing Library, compatible with the installed Expo SDK.
- **Code quality:** Existing ESLint and Prettier configuration.

Treat this as the agreed direction, not permission to install everything immediately. Verify what is already installed. Discuss and get approval before adding dependencies or changing major technical decisions. Avoid Redux and heavyweight architectural patterns unless a concrete need is established.

## 4. Architecture and Naming

Use **media** consistently for application features, routes, domain models, and UI components because the application covers both movies and TV series.

- Feature root: `src/features/media`.
- Detail route: `src/app/media/[id].tsx` (`/media/:id`).
- Domain models: `MediaSummary`, `MediaDetails`, and `MediaType`.
- UI components: `MediaCard`, `MediaRow`, `HeroMedia`.
- Screens: `HomeScreen`, `MediaDetailsScreen`.
- Hooks: `useMediaCollection`, `useMediaDetails`.
- API-facing naming can remain OMDb-specific, e.g. `omdbClient.ts` and `OmdbSearchResponse`.

Suggested structure (create only what the current step requires):

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── media/
│       └── [id].tsx
├── features/
│   └── media/
│       ├── api/
│       │   ├── omdbClient.ts
│       │   └── mediaRepository.ts
│       ├── components/
│       │   ├── MediaCard.tsx
│       │   ├── MediaRow.tsx
│       │   └── HeroMedia.tsx
│       ├── screens/
│       │   ├── HomeScreen.tsx
│       │   └── MediaDetailsScreen.tsx
│       ├── hooks/
│       │   ├── useMediaCollection.ts
│       │   └── useMediaDetails.ts
│       ├── media.mapper.ts
│       ├── media.types.ts
│       ├── omdb.types.ts
│       ├── media.queries.ts
│       └── collections.ts
├── shared/
│   ├── components/
│   │   ├── ErrorState.tsx
│   │   └── PosterImage.tsx
│   └── theme/
│       ├── colors.ts
│       └── spacing.ts
└── providers/
    └── QueryProvider.tsx
```

Architecture principles:
- Keep Expo Router route files thin; place feature screens and business logic in `features/media`.
- Separate UI, networking, data mapping, and query lifecycle responsibilities.
- Do not fetch from presentational components or pass raw OMDb responses into them.
- Keep shared code genuinely reusable; avoid premature abstraction and empty scaffolding.
- Preserve simple, type-safe interfaces and clear component boundaries.
- Do not rename existing code or refactor unrelated areas without approval.

## 5. OMDb and Media Collections

OMDb provides title search (`s`) and details by IMDb ID (`i`), but not native trending, popularity ranking, or general genre-discovery endpoints.

### Home collections

- Show **mixed thematic collections** containing movies and TV series together.
- Use OMDb Search responses for lightweight summaries; do not fetch full details for every Home card.
- Keep the API `type` search parameter **optional**, not globally fixed to `movie`.
- Support OMDb's `movie`, `series`, and `episode` types in API response handling.
- Initially display only `movie` and `series` on Home; exclude standalone `episode` items.
- Allow collection definitions to specify allowed media types. When searching without `type`, filter unsupported types locally; OMDb does not support a multi-value `type` query parameter.
- Show a small, accessible **Movie** or **Series** label on every media card.
- Keep collections independently loading and resilient: one failed section must not block others.
- Validate actual search results before choosing collection names. OMDb title search does not reliably discover all titles in a fictional universe; do not imply that it does.
- Do not claim that title-search collections are genuinely trending, popular, or genre-ranked.

### Details

- Navigate using the IMDb ID, not an entire media object.
- Fetch details on the Details screen through the OMDb `i` parameter.
- Use a shared `MediaDetailsScreen` for movies and series, showing common metadata and type-specific fields only when available (for example, seasons for a series).
- Do not add episode browsing, season navigation, or episode-specific flows without a separate decision and approval.

### Data handling

- Keep OMDb DTOs separate from internal `MediaSummary` / `MediaDetails` domain models.
- Normalize external data in mapper functions.
- Handle `"N/A"`, absent posters, missing or malformed fields, HTTP failures, and OMDb `Response: "False"` errors.
- Pass `AbortSignal` to supported requests.
- Use stable TanStack Query keys, sensible caching, and request deduplication.
- Keep collection fetching economical and avoid unnecessary repeated or per-card detail requests.
- Discuss any proposal to use a second external API before changing direction.

## 6. Navigation

The primary flow is **Home → Media Details → Back** using Expo Router Stack navigation.

- Route: `app/media/[id].tsx` backed by a feature-owned `MediaDetailsScreen`.
- Validate the route parameter and handle missing or invalid IDs gracefully.
- Verify `router.push()`, `router.back()`, Android system Back, and iOS swipe-back where testable.
- Check that returning to Home preserves expected state and scroll position.
- Keep navigation logic out of reusable presentational components.
- Do not replace Expo Router with another navigation solution without a demonstrated reason and approval.

## 7. UI, Accessibility, and Performance

- Aim for a cohesive dark, cinematic interface with reusable color, spacing, and typography tokens.
- Use predictable poster aspect ratios and a fallback when posters are missing.
- Handle long titles, descriptions, absent metadata, safe areas, small screens, and font scaling.
- Provide skeleton/loading, empty, error, and retry states where relevant.
- Use clear accessibility labels and appropriate touch targets.
- Prefer a vertical `FlatList` of sections and horizontal `FlatList`s for media rows, with stable IMDb ID keys.
- Use image caching where appropriate; avoid unnecessary rerenders and excessive concurrency.
- Do not add `React.memo`, `useMemo`, or `useCallback` indiscriminately.
- Measure performance before optimizing; use a release build for meaningful performance conclusions.

## 8. Code Quality and Validation

Follow existing TypeScript, ESLint, Prettier, and project conventions.

- Prefer strict typing and descriptive names; avoid `any` unless justified.
- Write small, focused components and functions.
- Handle edge cases deliberately instead of suppressing warnings.
- Do not add redundant boilerplate or premature abstraction.
- Introduce meaningful tests alongside implemented behavior when practical.
- Prioritize mapping, API failures, UI states, interactions, navigation, and caching behavior.

Use existing scripts when relevant and available:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run check
```

Never claim a test, command, device behavior, or performance result passed unless actually verified. State clearly what could not be checked.

## 9. Mandatory Approval-Gated Workflow

**These rules apply to every development task, including seemingly small changes. Instructions in this file are not authorization to edit the repository.**

### A. Analyze (read-only)

1. Read the relevant issue/request and inspect only the relevant existing files.
2. Determine what is already complete and what remains unverified.
3. Identify dependencies, risks, and conflicts with agreed decisions.

### B. Propose and discuss (still read-only)

1. State the objective and the **smallest reasonable next increment**.
2. Explain the recommended approach, alternatives, and trade-offs.
3. List expected file changes and verification steps.
4. Ask for my **explicit approval to implement that increment**.
5. **Stop and wait.**

Before approval, do not create, modify, rename, or delete files; install packages; run mutating commands; execute code generators; or change Git/GitHub state. Read-only inspection is allowed.

### C. Implement only approved scope

After explicit approval, make only the agreed changes. If a new architectural decision, dependency, or scope expansion becomes necessary, pause and request approval again.

### D. Verify, review, and stop

1. Summarize exactly what changed and why.
2. Identify affected files.
3. Run appropriate checks when possible, and report actual results and limitations.
4. Perform a focused code review, including risks and remaining work.
5. Suggest the next increment **without starting it**.
6. **Stop and wait for my review and approval** before any additional implementation.

Approval for one change or issue does not imply approval for an entire phase or roadmap.

## 10. Git and GitHub

Use GitHub Issues and GitHub Projects for task tracking; keep the detailed roadmap there rather than duplicating it here.

- Work on one issue and one reviewable increment at a time.
- Never commit, push, merge, create branches, or modify Issues/Projects without explicit permission.
- Suggest Conventional Commit messages when useful, but do not execute Git actions automatically.
- Avoid unrelated file changes.

## 11. Secrets and Scope

- Never commit credentials or API keys.
- Keep local environment files ignored and document required values in `.env.example`.
- `EXPO_PUBLIC_` values are bundled into the client and are **not secrets**.
- Do not add backend infrastructure, new external APIs, or unrelated features without discussing need and scope.
- Favor a smaller, polished, reliable implementation over unnecessary functionality.

## 12. Communication and Initial Response

Communicate clearly and professionally. Distinguish requirements from assumptions and recommendations. Explain the rationale behind decisions, give meaningful alternatives when useful, and challenge weak choices constructively.

**At the start of a new task:**
1. Read these guidelines and the task context.
2. Inspect relevant files using read-only operations.
3. Summarize verified current state.
4. Recommend just one small next step with its reasoning and expected affected files.
5. Ask for explicit approval.

**Do not implement anything until I approve. Do not proceed after implementation until I have reviewed it.**
