# Spec: Add App Title Bar with Current Date

- **Issue:** [#7 — Add app title bar with current date](https://github.com/duanhaolxc/react-todo-app/issues/7)
- **Branch:** `looper/planner/7-add-app-title-bar`
- **Date:** 2026-07-30

## Problem

The Todo app has no visible app-level title. Users land on the page and see a todo input and list with no context about what the application is. The existing `<h1>Things To Do</h1>` inside `Header.js` labels the input section, not the application itself.

## Goals

1. Add a prominent app title bar **above** the existing todo-list container showing "Todo 任务列表"
2. Display the current date (format `YYYY-MM-DD`) on the right side of the title bar
3. Maintain proper visual spacing between the title bar and the existing `.todolist` container
4. Zero impact on existing functionality (add, toggle, search, filter, progress bar)

## Approach

**Modify `TodoList.js` only.** The title bar is an app-level chrome element, not part of the todo input header. Adding it in `TodoList.js` keeps the change surface minimal and avoids conflating the app title with the existing `<Header/>` component that labels the input area.

### Implementation

Add a Bootstrap 3 `page-header` element inside the `.container` div, **above** the `.row > .todolist` block:

```html
<div class="page-header">
  <div class="row">
    <div class="col-xs-6">
      <h1>Todo 任务列表</h1>
    </div>
    <div class="col-xs-6 text-right">
      <h3><!-- current date YYYY-MM-DD --></h3>
    </div>
  </div>
</div>
```

- Uses Bootstrap 3's built-in `page-header` class for a styled horizontal rule separator
- Bootstrap grid (`col-xs-6`) for left/right layout — title on left, date on right
- `text-right` for right-aligned date
- Date computed in the render function using the user's local timezone:
  ```js
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  ```

### What changes

| File | Change |
|------|--------|
| `src/components/ui/TodoList.js` | Add page-header block above `.row > .todolist` |

No other files are modified. No CSS changes required — Bootstrap 3 provides all needed styling.

### What stays the same

- `Header.js` — untouched; continues to render "Things To Do" + input wrapper
- `Footer.js`, `FilteredList.js`, `Info.js`, `InputWrapper.js` — untouched
- All services (`filter.js`, `mode.js`, `todo.js`) — untouched
- CSS — untouched; Bootstrap 3 `.page-header` handles the visual separator

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Title bar pushes content down, reducing visible list area | Low | `.page-header` is compact (~40px). The existing container already has `margin: 30px auto`, providing breathing room. |
| Date display breaks server-side rendering or timezone assumptions | None | This is a client-side-only React app. `Date` runs in the browser in the user's local timezone — exactly what we want. |
| Bootstrap 3 `.page-header` style may conflict with custom CSS | Low | The custom CSS only targets `.todolist` and its children. The `page-header` sits outside `.todolist` and won't be affected. |

## Validation

1. **Visual check:** Page renders with "Todo 任务列表" title bar above the todo list, with current date right-aligned
2. **Regression check:** Adding, toggling, searching, filtering, and the progress bar all work as before
3. **Spacing check:** Title bar has a clear visual separator (Bootstrap page-header bottom border) from the todo list below
4. **Date format check:** Date displays as `YYYY-MM-DD` (e.g., `2026-07-30`)
