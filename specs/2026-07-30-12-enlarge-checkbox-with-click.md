# Enlarge Checkbox with Click Animation

> **Issue:** [duanhaolxc/react-todo-app#12](https://github.com/duanhaolxc/react-todo-app/issues/12)
> **Branch:** `looper/planner/12-enlarge-checkbox-with-click`
> **Base:** `master`
> **Date:** 2026-07-30

## Problem

The current TodoItem checkbox renders as a bare native `<input type="checkbox">` with no custom
styling. It is small (browser-default ~13-14px), hard to tap on mobile, and provides no visual
feedback on click beyond the browser's default checked/unchecked toggle. Users want a larger,
easier-to-hit checkbox with a satisfying click animation.

## Current Architecture

```
App → StateProvider → FilteredList → TodoItem → CheckBox (<input type="checkbox">)
```

- **CheckBox** (`src/components/ui/CheckBox.js`): Class component. Renders a bare native
  `<input type="checkbox">`. Manages its own `checked` state, calling `props.onChange(checked)`
  on toggle.
- **TodoItem** (`src/components/ui/TodoItem.js`): Functional component. Wraps `CheckBox` inside
  `<div className="checkbox"><label>`. Passes `changeStatus(data.id, checked)` through.
- **CSS** (`src/assets/style/index.css`): Has `li.completed label` rule for strikethrough on
  completed items. No checkbox-specific styles exist.
- **No tests** exist in the project.

## Goals

1. Enlarge the checkbox to **20x20px** for easier interaction
2. Increase the **clickable area** so users don't need pixel-perfect aim
3. Add a **CSS `transform: scale()` animation** on click/toggle for satisfying visual feedback
4. Do **not** affect the text display, completed strikethrough, progress bar, or counter
5. Do **not** introduce new dependencies

## Approach

### CSS-Only Strategy (Recommended)

Use CSS to style the existing native checkbox without replacing it with a custom element.
This keeps the component tree unchanged and avoids JS complexity.

**Three changes, two files:**

#### 1. CSS — Checkbox sizing and clickable area (`src/assets/style/index.css`)

Add new rules targeting `.checkbox input[type="checkbox"]`:

| Property | Value | Purpose |
|----------|-------|---------|
| `width` / `height` | `20px` | Enlarge visual size |
| `margin` | `0` | Reset browser defaults |
| `cursor` | `pointer` | Show pointer on hover |
| `vertical-align` | `middle` | Align with text properly |
| `position` | `relative` | Anchor point for clickable area |

Add a pseudo-element or padding on the parent `<label>` to increase the clickable hit area
without changing the visual size of the checkbox.

#### 2. CSS — Scale animation (`src/assets/style/index.css`)

```css
.checkbox input[type="checkbox"] {
  transition: transform 0.2s ease;
}

.checkbox input[type="checkbox"]:active {
  transform: scale(1.3);
}
```

The `:active` pseudo-class fires during the click/pointer-down, giving an immediate "pop"
animation. On release, the transition smoothly returns to `scale(1)`.

The `:active` approach triggers on every click (both check and uncheck), which is natural —
the animation provides feedback that the click was registered.

#### 3. CheckBox component — No changes required

The animation is purely CSS-driven. The `CheckBox` class component can remain untouched since
`:active` works on the native input element without any JS intervention.

### Alternative Considered: JS-Driven Animation Class

Adding a temporary CSS class via `setTimeout` in `CheckBox.handleChange` would allow
animating on `:checked` state change rather than on click-down. This was rejected because:
- It adds JS complexity for a purely visual concern
- `:active` provides more immediate feedback (triggered on pointer-down, not after state
  change)
- It requires cleanup logic to remove the animation class after the transition ends

### Why not a custom checkbox?

A fully custom checkbox (hidden native input + styled `<span>`) would give more design
control but would require: rewriting `CheckBox` component, handling keyboard accessibility
manually, and matching the existing checked/unchecked visual correctly. For 20x20px sizing
and a scale animation, styling the native checkbox is sufficient and lower risk.

## Files to Modify

| File | Change |
|------|--------|
| `src/assets/style/index.css` | Add checkbox sizing, hit area, cursor, and scale animation rules |
| `src/components/ui/CheckBox.js` | No changes (CSS-only approach) |
| `src/components/ui/TodoItem.js` | No changes |

## Risks

| Risk | Mitigation |
|------|------------|
| Native checkbox sizing is inconsistent across browsers (Chrome vs Firefox vs Safari) | Use `appearance: none` or accept browser-native rendering at 20x20. Test in at least Chrome and Firefox. |
| `:active` scale may clip if parent has `overflow: hidden` | No overflow hidden exists in the current CSS. Verified safe. |
| Larger checkbox may misalign with text vertically | Use `vertical-align: middle` and verify against the existing `line-height` of the todo item. |
| Strikethrough on completed items must still apply to the label text, not the checkbox | Current rule `li.completed label` applies to `<label>` content only. The checkbox inside it is not affected by `text-decoration`. This is safe. |
| No test coverage to catch regressions | Manual visual verification via dev server. If CI exists (unclear), add a visual check step. |

## Validation

### Functional

1. `npm start` — app builds and runs without errors
2. Checkbox is visibly larger than before (~20x20px vs default ~13px)
3. Clicking the checkbox toggles the todo completed state
4. Completed items still show strikethrough text
5. Progress bar and counter update correctly after toggle
6. All existing todo operations (add, filter, delete) still work

### Visual

1. Checkbox renders at 20x20px in Chrome and Firefox
2. Cursor shows `pointer` when hovering over the checkbox
3. Clicking the checkbox shows a brief scale-up animation (scale ~1.3, then back to 1)
4. Text and checkbox are vertically aligned
5. Checkbox does not overlap or clip with adjacent elements

### Edge Cases

1. Click in the padding area around the checkbox (extended hit area) — should still toggle
2. Click the label text — should still toggle (label is parent of checkbox)
3. Rapid double-click — animation should not glitch or queue
4. Toggle with keyboard (Tab to focus, Space to toggle) — should still work

## Implementation Notes

- The project uses `react-scripts` (Create React App). CSS changes in `src/assets/style/index.css`
  are hot-reloaded in dev mode.
- The existing `<label>` wrapper in `TodoItem` already provides a built-in larger clickable
  area — any click on the label text toggles the wrapped checkbox. Enlarging the checkbox
  itself makes the target even bigger.
- No `appearance: none` is strictly necessary if the goal is just a larger native checkbox.
  Adding `appearance: none` with custom checked/unchecked rendering is a larger scope change
  and should be a separate issue.
