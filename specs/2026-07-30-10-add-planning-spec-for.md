# Planning Spec: App Title Bar with Current Date

**Issue:** [#7 — App title bar with current date](https://github.com/duanhaolxc/react-todo-app/issues/7)
**Spec for:** [#10 — Add planning spec for issue #7](https://github.com/duanhaolxc/react-todo-app/pull/10)
**Date:** 2026-07-30
**Status:** Ready for implementation

## Problem Statement

The application currently has no page-level title indicator. When a user opens the app, there is no visual cue identifying what the page is or when they are viewing it. This is a basic UX expectation for any application page.

## Goals

1. Add a title bar displaying "Todo 任务列表" at the top of the todo list page
2. Display the current date in `YYYY-MM-DD` format alongside the title
3. Use Bootstrap 3's built-in `page-header` component for styling — no new dependencies
4. Keep the change minimal: modify only `src/components/ui/TodoList.js`

## Non-Goals

- No localization or i18n for the title text
- No dynamic date refresh (static on page load is sufficient)
- No configuration or props for the title content

## Approach

### Single-file change to `TodoList.js`

Add a Bootstrap 3 `page-header` div above the existing `.row` container inside `TodoList.js`. The date is computed once at render time using `new Date()`.

**Current structure (simplified):**

```jsx
<div className="container">
    <div className="row">
        <div className="todolist">
            <Header ... />
            <FilteredList ... />
            <Footer ... />
            <Info ... />
        </div>
    </div>
</div>
```

**Proposed change:**

```jsx
<div className="container">
    <div className="page-header">
        <h1>Todo 任务列表 <small>{currentDate}</small></h1>
    </div>
    <div className="row">
        <div className="todolist">
            ...
        </div>
    </div>
</div>
```

### Date formatting

Use a helper to format `new Date()` as `YYYY-MM-DD`:

```js
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
```

The helper is defined inside `TodoList.js` to keep the change self-contained. The date is computed as a `const` at the top of the render function so it's evaluated once per render.

### Why Bootstrap 3 `page-header`

- Bootstrap 3 is already a project dependency (`^3.4.1` in `package.json`)
- The `page-header` class provides a standard, styled page title with a bottom border and proper spacing
- The `<small>` tag nested inside `<h1>` is the Bootstrap 3 convention for subtitle text, rendered smaller and lighter

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `page-header` class removed/deprecated in future Bootstrap | Low | Low | Bootstrap 3 is pinned; no upgrade planned |
| `String.padStart` not available in older browsers | Low | Medium | The project uses `react-scripts 0.9.0` which includes a polyfill for ES2017; verify in target browsers |
| Date rendered server-side could differ from client timezone | Low | Low | This is a client-only React app with no SSR; date always reflects the user's local time |

## Validation Criteria

1. **Visual check:** The page renders a title bar with "Todo 任务列表" and the current date (e.g., "Todo 任务列表 2026-07-30") at the top
2. **Bootstrap styling:** The title has the `page-header` bottom border and proper typography from Bootstrap 3
3. **No regressions:** All existing todo functionality (add, filter, search, complete, delete) still works
4. **No new warnings:** The browser console and test output show no new errors or warnings
5. **Existing tests pass:** `npm test` exits with zero failures

## Test Plan

### Manual verification

1. Run `npm start` to launch the dev server
2. Confirm the page header appears above the todo input with "Todo 任务列表" and today's date
3. Confirm the header uses Bootstrap 3 `page-header` styling (bottom border, proper font sizing)
4. Add a todo item — confirm functionality is unaffected
5. Filter, search, complete, and delete items — confirm all operations work
6. Resize the browser — confirm the header is responsive within the Bootstrap container

### Automated

- Run `npm test` to confirm all existing test suites pass
- No new test file is required for this change; the scope is presentation-only

## Implementation Summary

- **Files changed:** `src/components/ui/TodoList.js` (1 file)
- **New dependencies:** None
- **Lines of code:** ~12 lines added (date helper + page-header markup)
- **Estimated effort:** Small (single-session implementation)
