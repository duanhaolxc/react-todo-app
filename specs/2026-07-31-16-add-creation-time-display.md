# Spec: Add Creation Time Display on Todo Items

**Issue**: [#16](https://github.com/duanhaolxc/react-todo-app/issues/16)
**Date**: 2026-07-31
**Status**: Planned

## Problem

Users cannot see when a todo item was created. Each item should display its creation timestamp so users can track when tasks were added.

## Goals

1. Display creation time on the right side of each `TodoItem` in `MM-DD HH:mm` format
2. Completed items show the timestamp in gray (`#aaa`)
3. Newly added todos automatically record the current time
4. The time display must not interfere with checkbox, filter, or search functionality

## Approach

### Data Layer (`src/services/todo.js`)

- Add a `createdAt` field to every todo item.
- In `addToList()`, set `createdAt: new Date()` automatically when creating a new item.
- Add `createdAt` timestamps to the seed data in `getAll()` (use fixed historical dates for consistency).

### Component (`src/components/ui/TodoItem.js`)

- Add a `<span>` element to the right of the todo text that displays the formatted `createdAt` value.
- Format: `MM-DD HH:mm` (e.g., `07-31 14:30`).
- Apply Bootstrap 3 utility class `pull-right` so the time sits on the right edge of the list item.
- When the item is completed, the timestamp text color should be gray (`#aaa`), matching the existing completed-item styling.

### Styling (`src/assets/style/index.css`)

- Add a `.todo-time` CSS class to position and style the timestamp.
- Completed items: `.completed .todo-time { color: #aaa; }`.
- Ensure the time display has sufficient spacing from the text to avoid overlap.

### No Changes To

- `FilteredList.js` — already passes `data` as-is to `TodoItem`.
- `StateProvider.js` — already delegates to `addToList()`; `addNew()` passes `{text, completed: false}` and `addToList` now adds `createdAt`.
- `CheckBox`, `SearchBox`, `Filter`, `Footer` — unaffected.

## Files Modified

| File | Change |
|------|--------|
| `src/services/todo.js` | Add `createdAt` field in `addToList()` and seed data |
| `src/components/ui/TodoItem.js` | Render creation time `<span>` with formatted date |
| `src/assets/style/index.css` | Add `.todo-time` styles |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Time display could overlap checkbox on narrow screens | Use `pull-right` with `margin-right` spacing; the container is 600px wide which is sufficient |
| Existing seed data has no `createdAt` and would show "Invalid Date" | Add `createdAt` to seed data in `getAll()` |
| Format function could add unnecessary complexity | Implement a minimal inline `formatTime` helper in `TodoItem.js` — no external date library needed |

## Validation

1. **Visual**: Each todo item shows a timestamp on the right side in `MM-DD HH:mm` format
2. **Visual**: Completed items show gray timestamps
3. **Functional**: Adding a new todo records the current time
4. **Regression**: Checkbox clicking, filter switching (All/Active/Completed), and search continue to work
5. **Regression**: The "N items left" count in the footer is unaffected

## E2E Test Cases

| Priority | Case ID | 测试场景 | 验证方式 | 预期结果 |
|----------|---------|----------|----------|----------|
| P0 | E2E-001 | 页面加载后，已有的 todo 条目右侧显示创建时间，格式为 MM-DD HH:mm | Browser截图 | 每个 todo 条目右侧有格式正确的时间戳 |
| P0 | E2E-002 | 新增一条 todo 后，该条目右侧显示当前时间（与系统时间分钟级一致） | Browser截图 | 新条目右侧显示的时间与当前时间一致 |
| P0 | E2E-003 | 勾选一条 todo 为已完成后，该条目的时间显示变为灰色 (#aaa) | Browser截图 | 已完成条目的时间戳颜色变为灰色，与已完成文本样式一致 |
| P1 | E2E-004 | 同时存在已完成和未完成条目时，时间颜色区分正确 | Browser截图 | 未完成条目时间正常色，已完成条目时间灰色 |
| P1 | E2E-005 | 通过筛选器切换到"已完成"视图，所有条目的时间均为灰色 | Browser截图 | 筛选后所有可见条目的时间戳均为灰色 |
| P1 | E2E-006 | 时间显示不与复选框重叠或遮挡 | Browser截图 | 复选框可正常点击，时间在右侧独立显示 |
| P1 | E2E-007 | 搜索过滤时，匹配条目的时间显示不受影响 | Browser截图 | 搜索后匹配条目仍正常显示时间 |
| P1 | E2E-008 | 时间显示不与进度条旁文字重叠 | Browser截图 | Footer 区域布局正常，时间显示不溢出到 footer |
