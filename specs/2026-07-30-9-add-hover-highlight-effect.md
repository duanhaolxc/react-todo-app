# Spec: Add Hover Highlight Effect on Todo Items

**Issue**: [duanhaolxc/react-todo-app#9](https://github.com/duanhaolxc/react-todo-app/issues/9)
**Date**: 2026-07-30
**Branch**: `looper/planner/9-add-hover-highlight-effect`

## Problem

Todo items (`li.ui-state-default`) have no visual feedback on mouse hover, making the UI feel static and less interactive.

## Goals

1. On hover, change the background of a todo item to light gray (`#f5f5f5`)
2. On hover, show a 3px blue (`#6299bb`) left border as a visual anchor
3. Both effects should transition smoothly over 0.2s on both enter and exit

## Non-Goals

- No changes to the TodoItem component's JSX or behavior
- No changes to the completed (strikethrough) style
- No changes to the checkbox or text rendering
- No new dependencies
- No keyboard focus indicator — `<li>` elements are not naturally focusable interactive controls, so this is a mouse-hover-only visual enhancement. Keyboard focus for interactive children (checkbox, delete button) is handled by the browser's native focus ring

## Approach

Pure CSS changes to `src/assets/style/index.css`.

Update the existing `li.ui-state-default` base rule to add a transparent left border and explicit-property transitions:

```css
li.ui-state-default {
    background: #fff;
    border: none;
    border-bottom: 1px solid #ddd;
    border-left: 3px solid transparent;
    transition: background 0.2s ease, border-left 0.2s ease;
}
```

Add a `li.ui-state-default:hover` rule for the hover state:

```css
li.ui-state-default:hover {
    background: #f5f5f5;
    border-left: 3px solid #6299bb;
}
```

### Why this approach

- The transparent left border on the base rule reserves the space so hover only changes color, not layout — no content shift
- `transition` on the base rule with explicit properties (`background, border-left`) gives smooth animation on both mouse enter and mouse exit
- Using explicit properties instead of `all` avoids page-load flash on unrelated properties (e.g. the bottom border)
- Background `#f5f5f5` is a subtle gray that contrasts against the white `#fff` default without being distracting
- Blue `#6299bb` is muted enough to not clash with the existing color scheme

### Alternative considered

- **Placing `transition` only on `:hover`**: Rejected because this causes an abrupt snap on mouse-out — the transition property is removed the instant `:hover` deactivates, so the exit is not animated. Putting `transition` on the base rule is required for smooth exit.
- **Using `transition: all` on the base rule**: Rejected because it would animate every property change, including the initial page-load render of the bottom border.
- **Using `box-shadow: inset` instead of `border-left`**: Also valid (no layout impact), but the transparent-border approach is simpler and more conventional for this pattern.

## Files Changed

| File | Change |
|------|--------|
| `src/assets/style/index.css` | Add `border-left: 3px solid transparent` and `transition: background 0.2s ease, border-left 0.2s ease` to the existing `li.ui-state-default` rule; add `li.ui-state-default:hover` rule |

## Risks

- **Low risk**: Pure CSS change, no logic or markup changes. The completed strikethrough style (`.completed label`) is on a child element and unaffected by the parent's `:hover` background.

## Validation

1. **Visual**: Open the app, hover over todo items — background turns light gray, left blue border appears with smooth animation; on mouse-out, both revert smoothly
2. **No content shift**: Todo item text position does not change on hover — the transparent base border prevents layout jitter
3. **Completed items**: Hover over a completed (strikethrough) todo — strikethrough remains visible, hover effect still applies
4. **Checkbox**: Checkbox interaction is unaffected by the hover style
5. **No regression**: Existing styles (white background, bottom border separators, last-child no-border) still apply correctly; no page-load flash on unrelated properties
