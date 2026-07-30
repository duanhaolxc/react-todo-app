# Plan: Add strikethrough style for completed todo items

**Issue**: [duanhaolxc/react-todo-app#5](https://github.com/duanhaolxc/react-todo-app/issues/5)
**Branch**: `looper/planner/5-add-strikethrough-style-for`
**Status**: planning

## Problem

Current completed and uncompleted todo items differ only by the checkbox state. Users need a clearer visual distinction so they can quickly scan which items are done.

## Current State

The CSS and component logic already partially address the issue:

- `src/assets/style/index.css` lines 46-49: defines `li.completed label` with `text-decoration: line-through` and `color: #aaa`.
- `src/components/ui/TodoItem.js` line 7: applies the `completed` CSS class when `data.completed === true`.

What is missing:

- **localStorage persistence**: `StateProvider` initializes state from hardcoded `getAll()` and never reads or writes localStorage. On page refresh, all todo completion state is lost — violating the acceptance criterion "page refresh state correctly maintained."

## Goals

1. Persist the todo list state (completed statuses, added items) across page refreshes via localStorage.
2. Keep the existing CSS class toggling and styles unchanged (they already satisfy the visual requirements).

Non-goals:
- Server-side persistence or backend integration.
- Changing how the strikethrough itself is styled (already done).

## Approach

### 1. localStorage persistence in StateProvider

Add `componentDidMount` to read persisted state from localStorage, and `componentDidUpdate` to write state changes back.

```js
// On mount: load from localStorage or fall back to getAll()
componentDidMount() {
    const saved = localStorage.getItem('todo-list');
    if (saved) {
        try {
            this.setState({ list: JSON.parse(saved) });
        } catch (_) {
            // corrupted data, fall through to defaults
        }
    }
}

// On update: persist list to localStorage
componentDidUpdate(prevProps, prevState) {
    if (prevState.list !== this.state.list) {
        localStorage.setItem('todo-list', JSON.stringify(this.state.list));
    }
}
```

**Files changed**: `src/components/wrappers/StateProvider.js` only.

### 2. No CSS or TodoItem changes needed

The existing styles and class toggling already satisfy the visual acceptance criteria. No changes to `index.css` or `TodoItem.js`.

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| localStorage quota exceeded | Very low (tiny JSON payload) | Wrap `setItem` in try/catch, silently ignore write failures |
| Corrupted localStorage data | Low | Wrap `JSON.parse` in try/catch, fall back to `getAll()` defaults |
| localStorage not available (private browsing, SSR) | Low | `localStorage` access is already in try/catch paths |

## Validation

1. **Unit/Manual** - Toggle a todo completed, refresh the page, verify it stays completed.
2. **Unit/Manual** - Toggle a todo back to uncompleted, refresh, verify it stays uncompleted.
3. **Unit/Manual** - Add a new todo, mark it completed, refresh, verify both the item and its status persist.
4. **Manual** - Clear localStorage, refresh, verify app loads with default items.
5. **Visual** - Verify completed items show gray text with line-through, pending items show black text without line-through.
