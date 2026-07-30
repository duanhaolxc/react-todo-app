# Spec: Add Hover Highlight Effect on Todo Items

**Issue**: [duanhaolxc/react-todo-app#9](https://github.com/duanhaolxc/react-todo-app/issues/9)
**Date**: 2026-07-30
**Branch**: `looper/planner/9-add-hover-highlight-effect`

## Problem

Todo items (`li.ui-state-default`) have no visual feedback on mouse hover, making the UI feel static and less interactive.

## Goals

1. On hover, change the background of a todo item to light gray (`#f5f5f5`)
2. On hover, show a 3px blue (`#6299bb`) left border as a visual anchor
3. Both effects should transition smoothly over 0.2s using CSS transition

## Non-Goals

- No changes to the TodoItem component's JSX or behavior
- No changes to the completed (strikethrough) style
- No changes to the checkbox or text rendering
- No new dependencies

## Approach

Pure CSS addition to `src/assets/style/index.css`.

Add a `li.ui-state-default:hover` rule block with:

```css
li.ui-state-default:hover {
    background: #f5f5f5;
    border-left: 3px solid #6299bb;
    transition: all 0.2s ease;
}
```

### Why this approach

- Single rule block, no component changes needed
- `transition: all 0.2s ease` on hover provides smooth enter animation; on mouse-out the transition reverts naturally since the base state has no left border
- Background `#f5f5f5` is a subtle gray that contrasts against the white `#fff` default without being distracting
- Blue `#6299bb` is muted enough to not clash with the existing color scheme

### Alternative considered

- Adding `transition` to the base `li.ui-state-default` rule instead of the hover rule. Rejected because it would cause a visible transition on initial page load when the border snaps from nothing to the computed default.

## Files Changed

| File | Change |
|------|--------|
| `src/assets/style/index.css` | Add `li.ui-state-default:hover` rule |

## Risks

- **Low risk**: Pure CSS change, no logic or markup changes. The completed strikethrough style (`.completed label`) is on a child element and unaffected by the parent's `:hover` background.

## Validation

1. **Visual**: Open the app, hover over todo items — background turns light gray, left blue border appears with smooth animation
2. **Completed items**: Hover over a completed (strikethrough) todo — strikethrough remains visible, hover effect still applies
3. **Checkbox**: Checkbox interaction is unaffected by the hover style
4. **No regression**: Existing styles (white background, bottom border separators, last-child no-border) still apply correctly
