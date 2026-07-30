# Planning Spec: Add App Title Bar with Current Date

**Issue:** [duanhaolxc/react-todo-app#7](https://github.com/duanhaolxc/react-todo-app/issues/7)  
**Date:** 2026-07-30  
**Status:** Draft

## Problem

The current Todo application has no page title. When a user opens the app, there is no visual indicator of what the application is or what it does. The first visible element is the input box for adding todos, which assumes the user already knows the context.

## Goals

1. Add a prominent title bar at the top of the TodoList displaying "Todo 任务列表"
2. Display the current date (formatted as YYYY-MM-DD) on the right side of the title bar
3. Use Bootstrap 3 `page-header` class for consistent styling — no new dependencies
4. Maintain appropriate spacing between the title bar and existing content
5. Preserve all existing functionality (add, toggle, search, filter, progress bar)

## Non-Goals

- Changing the existing `<Header>` component (the "Things To Do" / input area)
- Adding any new npm dependencies
- Modifying any files other than `TodoList.js`

## Approach

### Single-file change: `src/components/ui/TodoList.js`

Add a Bootstrap 3 `page-header` element inside the `.todolist` div, above the existing `<Header>` component.

```jsx
<div className="page-header">
    <h1>
        Todo 任务列表
        <small className="pull-right">{currentDate}</small>
    </h1>
</div>
```

- Compute `currentDate` at render time using `new Date().toISOString().slice(0, 10)` to produce the `YYYY-MM-DD` format
- Use Bootstrap 3's `.pull-right` utility class to right-align the date
- Bootstrap 3's `page-header` class provides the bottom border and vertical spacing automatically
- No state, no lifecycle methods, no new imports required — just a computed local variable

### Why this approach

- **Minimal change surface**: Only `TodoList.js` is touched, reducing regression risk
- **Leverages existing dependency**: Bootstrap 3 is already in `package.json`; `page-header` and `pull-right` are built-in utility classes
- **Idiomatic React**: Computing `currentDate` as a local variable in the render path is straightforward for a functional component; no need for `useState`/`useEffect` since the date only needs to be computed once per render
- **No breaking changes**: The new element is additive only; existing child components and their props are untouched

## Implementation Details

| Aspect | Detail |
|---|---|
| **File changed** | `src/components/ui/TodoList.js` |
| **Lines added** | ~5 lines (page-header div + date computation) |
| **New imports** | None |
| **New dependencies** | None |
| **State changes** | None |
| **Props changes** | None |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `page-header` styles conflict with existing Bootstrap overrides | Low | Low | Verify visually; Bootstrap 3 `page-header` is a simple bottom-border + margin style unlikely to conflict |
| Date format doesn't match user expectations | Low | Low | YYYY-MM-DD is specified in the acceptance criteria and is locale-agnostic |
| Title bar pushes content below the fold on small screens | Low | Low | Bootstrap 3 `page-header` adds minimal vertical space (~40px); test on mobile viewport |

## Validation Criteria

1. **Visual check**: Page renders "Todo 任务列表" as a page header above the input area
2. **Date display**: Current date shown in YYYY-MM-DD format, right-aligned in the header
3. **Spacing**: Clear visual separation between the title bar and the input/controls below
4. **Regression check**: All existing features continue to work:
   - Add a new todo item
   - Toggle todo completion (checkbox)
   - Search/filter todos
   - Progress bar updates correctly
5. **No console errors**: DevTools console is clean on page load

## Test Plan

- [ ] Manual verification: start the app (`yarn start`) and confirm the title bar renders correctly
- [ ] Manual verification: confirm the date matches the current system date
- [ ] Manual verification: smoke-test add, toggle, search, filter, and progress bar
- [ ] Automated: run `yarn test` to confirm no existing tests break
