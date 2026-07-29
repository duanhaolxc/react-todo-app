# Spec: Add Persistent Todo Storage and New Item Input

**Issue:** [duanhaolxc/react-todo-app#1](https://github.com/duanhaolxc/react-todo-app/issues/1)
**Date:** 2026-07-29
**Base Branch:** `master`
**Scope:** Medium — touches service layer, state provider, UI component, and adds tests

## Problem

The current todo app has two deficiencies:

1. **No visible add button** — `InputBox` is mode-gated (toggled by keyboard shortcut `N` or the icon in the footer). The input has no submit button; users must press Enter. This is undiscoverable.
2. **No data persistence** — `services/todo.js` returns hardcoded data from `getAll()`. New items vanish on page refresh because state lives only in `StateProvider` component state.

## Goals

1. Add a Bootstrap-styled "Add" button next to the existing `InputBox` input so users can submit by clicking or pressing Enter
2. Persist todo data to `localStorage` so items survive page refreshes
3. Add basic unit tests for the persistence layer and add-item flow
4. Keep all existing functionality intact: complete/uncomplete toggles, search via `/` key, filter (All/Active/Completed), mode switching, keyboard shortcuts

## Non-Goals

- Backend/API integration
- New npm dependencies
- Changing the mode-based UI architecture (search stays mode-gated; create input stays in `Header`)
- Drag-and-drop reordering, editing, or deletion of todos

## Current Architecture (baseline)

```
App
└── StateProvider          ← central state (list, filter, mode, query)
    └── KeyStrokeHandler   ← keyboard shortcuts (N=create, /=search, Esc=dismiss)
        └── TodoList        ← pure layout
            ├── Header      ← renders InputWrapper
            ├── FilteredList ← renders TodoItem list
            └── Footer      ← ButtonWrapper (add/search icons) + item count + Filter
```

**Data flow:**
- `StateProvider` constructor calls `getAll()` from `services/todo.js` (hardcoded array)
- `addNew(text)` calls `addToList(state.list, {text, completed: false})` → `setState`
- `changeStatus(itemId, completed)` calls `updateStatus()` → `setState`
- Input is mode-gated: `InputWrapper` switches between `InputBox` (MODE_CREATE), `SearchBox` (MODE_SEARCH), or nothing (MODE_NONE)
- `InputBox` uses recompose `withState`/`withHandlers` HOC for local value state and Enter-key submission

**Key files:**
| File | Role |
|---|---|
| `src/services/todo.js` | Todo CRUD operations (hardcoded data) |
| `src/components/wrappers/StateProvider.js` | Central state, actions (addNew, changeStatus, etc.) |
| `src/components/ui/InputBox.js` | Text input for new todos (Enter to submit) |
| `src/components/hoc/wrapInputBox.js` | recompose HOC wrapping InputBox |
| `src/components/ui/InputWrapper.js` | Mode-based switch between InputBox / SearchBox |
| `src/components/ui/Header.js` | Renders InputWrapper |

## Approach

### 1. localStorage Persistence Layer (`services/todo.js`)

Add two functions to `services/todo.js`:

- **`loadFromLocalStorage()`** — reads `localStorage.getItem('todos')`, parses JSON, validates the result is an array (empty or non-empty), returns parsed data or falls back to the existing hardcoded defaults (the three sample todos) on parse errors or when the result is not an array. Feature-detects `window.localStorage` before access; returns fallback defaults when localStorage is unavailable.
- **`saveToLocalStorage(list)`** — wraps `localStorage.setItem('todos', JSON.stringify(list))` in a try/catch to handle quota errors; logs a `console.warn` on failure (see risk table)

Modify `getAll()` to call `loadFromLocalStorage()` instead of returning the hardcoded array directly. The hardcoded array becomes the fallback default when localStorage is empty or corrupted.

**Why this file:** `todo.js` is already the data access layer. Keeping persistence here maintains the existing separation — callers (`StateProvider`) don't need to know about localStorage.

### 2. Save on State Change (`StateProvider.js`)

In `StateProvider`:
- **constructor:** `getAll()` now returns persisted data automatically (via change in step 1)
- **`addNew()`:** after `setState`, call `saveToLocalStorage(updatedList)`
- **`changeStatus()`:** after `setState`, call `saveToLocalStorage(updatedList)`
- **Handle `setState` callback** to ensure save happens after state is committed (use the callback form of `setState`)

### 3. Add Button in InputBox (`InputBox.js` + CSS)

Modify `InputBox` to render a Bootstrap button alongside the input:

```
<div className="input-group">
  <input ... className="form-control add-todo" />
  <span className="input-group-btn">
    <button className="btn btn-default" type="button" onClick={handleSubmit}>Add</button>
  </span>
</div>
```

The `handleSubmit` handler calls the same `addNew` logic as the Enter key handler — extract a shared `submitValue` function in `wrapInputBox.js` that both `handleKeyUp` and `handleSubmit` delegate to.

Update `src/assets/style/index.css` with minimal styling to ensure the input-group integrates with the existing Bootstrap 3 look.

### 4. Tests

Add tests in `src/services/__tests__/todo.test.js` using Jest (included with `react-scripts 0.9.0`):

- **`loadFromLocalStorage` returns parsed data when valid JSON exists**
- **`loadFromLocalStorage` returns fallback defaults when localStorage is empty**
- **`loadFromLocalStorage` returns fallback defaults when JSON is malformed**
- **`loadFromLocalStorage` returns empty array when localStorage contains `[]`**
- **`loadFromLocalStorage` returns fallback defaults when `window.localStorage` is not available** — mock by deleting `window.localStorage` or setting it to `undefined` in the test setup, then verify the function returns the hardcoded defaults without throwing
- **`saveToLocalStorage` writes JSON to localStorage**
- **`addToList` appends item with generated id**
- **`updateStatus` toggles completed without mutating original**

Mock `localStorage` with a simple in-memory store in test setup.

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Breaking existing keyboard shortcuts | Low — changes are additive | Verify N key, / key, Escape all work manually |
| localStorage quota exceeded | Very low (todos are tiny JSON) | Add try/catch in `saveToLocalStorage` that logs a `console.warn` and silently fails |
| localStorage not available (private browsing, SSR) | Low | Feature-detect `window.localStorage` before access; if unavailable, operate entirely in-memory — all todo operations work, but data won't persist across sessions. Log a `console.warn` to aid debugging. |
| Corrupted localStorage data | Low | Validate parsed data is an array; fall back to defaults on any parse error |
| Styling regression with new input-group | Low | Bootstrap 3 `input-group` + `input-group-btn` pattern is standard; test manually |
| Existing tests (none exist) | N/A | Greenfield — no regression risk |

## Validation

### Manual verification checklist

1. **Add todo via button:** Type text, click "Add" — item appears in list
2. **Add todo via Enter:** Type text, press Enter — item appears in list
3. **Empty input:** Click "Add" or press Enter with empty text — nothing happens (existing guard)
4. **Persistence:** Add items, refresh page (F5) — items still present
5. **Complete toggle:** Check/uncheck items — works, persists across refresh
6. **Filter:** Active/Completed/All filters work correctly after adding items
7. **Search:** `/` key opens search, filters items correctly
8. **Keyboard shortcuts:** `N` reveals input, `Escape` dismisses, all existing shortcuts intact
9. **localStorage inspection:** Open DevTools → Application → Local Storage — verify `todos` key exists and updates on changes

### Automated tests

```
npm test
```

Should pass all new test cases for todo service layer.

## Implementation Order

1. Add `loadFromLocalStorage` / `saveToLocalStorage` to `services/todo.js` and modify `getAll()`
2. Wire persistence calls into `StateProvider.addNew()` and `StateProvider.changeStatus()`
3. Add submit button to `InputBox` and shared submit handler in `wrapInputBox.js`
4. Add CSS for Bootstrap-friendly input-group
5. Write service-layer unit tests
6. Manual verification against checklist above
