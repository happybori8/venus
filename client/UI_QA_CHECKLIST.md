# UI QA Checklist

## 1) Global Design Consistency

- [ ] All pages use consistent corner radius for cards, inputs, and buttons.
- [ ] Primary actions are visually consistent (dark solid button style).
- [ ] Secondary/outline actions are visually consistent across pages.
- [ ] Text hierarchy is clear (page title > section title > body text > meta text).
- [ ] Spacing rhythm is consistent across major sections.

## 2) Navigation and Header

- [ ] Header remains readable and aligned on desktop/tablet/mobile.
- [ ] Active menu state is visible and correct for current route.
- [ ] Cart button/badge updates correctly and remains visually aligned.
- [ ] Auth actions (login/register/mypage/admin/logout) look and behave consistently.

## 3) Product Flow

### Product List
- [ ] Category filters render correctly and selected state is obvious.
- [ ] Search and sort controls are aligned and responsive.
- [ ] Product cards have consistent image ratio and text spacing.
- [ ] Pagination buttons show hover/active states correctly.

### Product Detail
- [ ] Main image and thumbnail selection states are clear.
- [ ] Quantity controls and action buttons are aligned.
- [ ] Free-shipping progress area updates and remains readable.
- [ ] Accordion sections open/close smoothly and preserve layout.
- [ ] Review form and review items are visually consistent.

### Cart
- [ ] Item row layout remains stable with long product names.
- [ ] Quantity controls are easy to tap/click on mobile.
- [ ] Summary panel remains readable and sticky behavior is correct.
- [ ] Empty cart view uses same visual language as main pages.

### Checkout
- [ ] Section accordion open/close behavior is stable.
- [ ] Form field focus/disabled/readonly states are distinguishable.
- [ ] Payment method selection state is clear.
- [ ] Summary panel values and CTA are always visible and readable.

## 4) Account Flow

### Login / Register
- [ ] Validation and server error messages are readable.
- [ ] Input focus state is visible and consistent.
- [ ] Submit/loading/disabled states are clear.

### My Page / Orders
- [ ] Sidebar/tab active state is clear.
- [ ] Orders list, badges, and detail transitions remain consistent.
- [ ] Empty states and loading states match the design system.

## 5) Brand / Support / Admin

- [ ] Brand page hero/story/values sections keep visual rhythm.
- [ ] Support cards/faq items follow common card and border style.
- [ ] Admin cards, tables, and actions are consistent with the new neutral style.
- [ ] Admin pagination, tab states, and button interactions are clear.

## 6) Responsive QA

- [ ] 360px width: no horizontal scroll on key pages.
- [ ] 768px width: layout shifts from multi-column to single-column cleanly.
- [ ] 1024px width: cards/grids maintain balanced spacing.
- [ ] Image crops and text wrapping look natural at all breakpoints.

## 7) Accessibility and Interaction

- [ ] Keyboard tab order is logical on all key pages.
- [ ] Focus-visible outline appears on links, buttons, and form controls.
- [ ] Hover/active feedback is present but not distracting.
- [ ] Reduced-motion preference does not break interactions.
- [ ] Color contrast remains readable for body text and controls.

## 8) Regression Safety

- [ ] No backend API contract changes caused by UI updates.
- [ ] Cart -> Checkout -> Payment -> Success/Fail flow still works.
- [ ] Login/logout and role-based admin navigation still work.
- [ ] Existing error handling messages still appear where expected.

## 9) Quick Commands

Run these before release:

```bash
npm run build
npm run lint
```

Note: this repository currently contains pre-existing lint issues outside the UI styling scope.

## 10) Quick QA Table (Top 10)

| # | Check Item | Result (PASS/FAIL) | Notes |
|---|---|---|---|
| 1 | Home -> Products -> Detail -> Cart -> Checkout flow works end-to-end |  |  |
| 2 | Primary CTA button states (hover/active/disabled) are consistent |  |  |
| 3 | Product/list/detail image ratios remain stable on mobile |  |  |
| 4 | Header active nav state matches current route |  |  |
| 5 | Focus-visible is clear on inputs/buttons/links |  |  |
| 6 | Cart quantity, delete selected, and order actions work correctly |  |  |
| 7 | Checkout amount summary (items/shipping/total) is accurate |  |  |
| 8 | MyPage order list/detail status badges and actions are correct |  |  |
| 9 | Admin dashboard/list/pagination/tab interactions are visually consistent |  |  |
| 10 | No horizontal scroll at 360px/768px/1024px breakpoints |  |  |
