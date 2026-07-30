# Spec: Add Task Counter and Progress Bar in Footer

Issue: [duanhaolxc/react-todo-app#3](https://github.com/duanhaolxc/react-todo-app/issues/3)

## Problem

The current Footer only displays filter buttons (All / Active / Completed) and a generic "X items left" text. Users have no visual indication of overall task completion progress. They must manually count checked items or eyeball the list to gauge how much is done.

## Goals

1. Replace the existing "X items left" text with a Chinese-format counter: "已完成 X / 总数 Y"
2. Add a Bootstrap 3 progress bar that visually represents the completion percentage
3. Counter and progress bar must update in real time as items are checked/unchecked
4. No new npm dependencies; use only Bootstrap 3 classes already in the project

## Current Architecture

```
StateProvider (state: list, filter, mode, query)
  └─ TodoList (computes activeItemCount, filtered items)
       └─ Footer (receives: activeItemCount, filter, changeFilter, mode, changeMode)
```

- `StateProvider` at `src/components/wrappers/StateProvider.js` holds the `list` array of `{id, text, completed}` objects
- `TodoList` at `src/components/ui/TodoList.js` computes `activeItemCount = applyFilter(list, FILTER_ACTIVE).length` and passes it as a prop to Footer
- `Footer` at `src/components/ui/Footer.js` renders `{activeItemCount} items left` in a `pull-left` div

## Approach

Two files need changes:

### 1. `src/components/ui/TodoList.js`

Compute `totalCount` and `completedCount` and pass them to Footer instead of `activeItemCount`:

```js
const totalCount = list.length;
const completedCount = list.filter(item => item.completed === true).length;
```

Pass `{totalCount, completedCount}` to Footer. The existing `activeItemCount` prop is no longer needed and can be replaced.

### 2. `src/components/ui/Footer.js`

Replace the "items left" display with two new elements:

- **Counter text**: `已完成 {completedCount} / 总数 {totalCount}` in a `pull-left` div
- **Progress bar**: Bootstrap 3 progress bar in a `pull-left` div next to the counter

The progress bar percentage is `(completedCount / totalCount) * 100` (0% when no items exist, 100% when all are completed). Use Bootstrap classes `progress` and `progress-bar` with `progress-bar-success` for green styling.

Footer props change from `activeItemCount` to `completedCount` and `totalCount`.

### Component tree after changes

```
TodoList
  └─ Footer (receives: completedCount, totalCount, filter, changeFilter, mode, changeMode)
       ├─ .pull-left: ButtonWrapper
       ├─ .pull-left: "已完成 X / 总数 Y" counter
       ├─ .pull-left: Bootstrap progress bar (green, percentage width)
       └─ .pull-right: Filter buttons
```

## Edge Cases

| Case | Counter | Progress Bar |
|------|---------|-------------|
| All items completed | 已完成 Y / 总数 Y | 100% width, green |
| No items completed | 已完成 0 / 总数 Y | 0% width |
| Empty list (0 items) | 已完成 0 / 总数 0 | 0% width (guard against division by zero) |
| Single item checked then unchecked | Real-time decrement | Real-time shrink |

## Risks

- **Low risk**: Changes are localized to two files (TodoList and Footer). The Footer prop signature changes from `activeItemCount` to `{completedCount, totalCount}`, which is a direct swap with no downstream consumers to worry about since Footer is a leaf component.
- **Division by zero**: Guard `totalCount === 0` when computing the percentage; default to 0%.

## Validation

1. **Unit/manual tests**: Verify Footer renders "已完成 0 / 总数 3" on fresh load (3 hardcoded todos, all uncompleted)
2. Check a todo → counter shows "已完成 1 / 总数 3", progress bar at 33%
3. Add a new todo → total increments; counter shows "已完成 1 / 总数 4", progress bar at 25%
4. Uncheck the todo → counter returns to "已完成 0 / 总数 4", progress bar at 0%
5. Check all todos → counter shows "已完成 4 / 总数 4", progress bar at 100%
6. Filter buttons (All / Active / Completed) still work correctly
7. No console errors, no new npm warnings

## Implementation Notes

- Use `let` or `const` for progress percentage, guarding `totalCount === 0`
- Bootstrap 3 progress bar markup: `<div className="progress"><div className="progress-bar progress-bar-success" style={{width: `${percent}%`}}></div></div>`
- Add inline `marginLeft: '10px'` and a fixed `width` (e.g., `200px`) on the progress bar wrapper to keep layout tidy
- Remove the `activeItemCount` computation in TodoList since it's replaced by `completedCount` and `totalCount`
