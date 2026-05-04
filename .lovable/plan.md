
# Animated Productivity Dashboard Redesign

This redesign upgrades the existing schedule manager into a polished, animated control panel — keeping the disciplined productivity-first feel while adding tasteful Duolingo-style micro-interactions. Animations stay subtle (150–300ms), purposeful, and never gamified (no confetti, badges, mascots, or points).

> Note: this softens the prior "no animations / max 150ms" rule. If you want to keep the strict version, say so and I'll cap motion at 150ms and remove gradients.

---

## 1. Design System Foundation

**Theme tokens (`src/index.css` + `tailwind.config.ts`)**
- Single brand color: refined indigo/blue accent (HSL-based), with a tuned dark mode that has true depth (layered surfaces: bg → card → elevated).
- Add semantic tokens: `--surface-1/2/3`, `--elevated`, `--ring-soft`, `--gradient-brand`.
- Soft shadow scale: `shadow-soft`, `shadow-pop`, `shadow-float` (low-spread, high-blur).
- Rounded scale: `rounded-lg` (10px) default, `rounded-xl` (14px) cards, `rounded-2xl` panels.
- Subtle brand gradient utility (`.gradient-brand`) for accent surfaces only — never page backgrounds.
- Typography hierarchy refinement (Inter for UI, JetBrains Mono for numbers/timers).

**Motion system (`tailwind.config.ts`)**
- Extend keyframes/animations: `fade-in-up`, `scale-in`, `pop`, `slide-in-right`, `shimmer`, `progress-fill`, `check-pop`, `count-up`, `pulse-ring`.
- Global easing: `cubic-bezier(0.22, 1, 0.36, 1)` (smooth-out).
- Respect `prefers-reduced-motion` — wrap with media query in CSS.

---

## 2. Reusable Animated Primitives (new)

Create `src/components/ui/motion/`:
- `AnimatedCard.tsx` — hover lift + subtle scale, entrance fade-in-up with stagger support.
- `AnimatedButton.tsx` — press scale (0.97), ripple-free brand glow on hover.
- `AnimatedToggle.tsx` — smooth thumb slide + color crossfade.
- `AnimatedProgress.tsx` — fill animates from previous value, optional shimmer.
- `AnimatedCounter.tsx` — count-up tween for stat numbers.
- `AnimatedCheckbox.tsx` — checkmark draw-in + pop.
- `PageTransition.tsx` — wraps routed pages with fade+translate (12px) on route change.
- `Stagger.tsx` — utility wrapper to stagger children by index.

All built with Tailwind + CSS only (no framer-motion needed; can add if desired).

---

## 3. Navigation & Layout

**Sidebar (`src/components/navigation/Sidebar.tsx`)**
- Active item: animated left indicator bar (slide between items), brand-tinted background.
- NavItem hover: icon micro-bounce, label fade.
- Collapse/expand: smoother width + label crossfade.
- Mobile drawer: spring-eased slide-in, backdrop fade.

**DashboardLayout**
- Wrap children in `PageTransition` keyed by route.
- Improve mobile: top bar with brand mark + menu trigger; safer padding.

---

## 4. Pages

### Login/Register (NEW — `src/pages/AuthPage.tsx`)
Currently no auth pages exist. Add a polished split-screen:
- Left: brand panel with subtle animated gradient mesh, product tagline.
- Right: form card with animated field focus states, animated tab switch between Login / Register.
- Frontend-only (no backend); stores a local "session" flag — wired to existing localStorage. Can hook to Lovable Cloud later.
- Routes: `/login`, `/register`.

### Dashboard Home
- Stat cards: animated count-up, hover lift, stagger entrance.
- Capacity indicator: animated progress fill with color transitions (green → amber → red).
- Planning/Inbox prompt cards: slide-in-right entrance.
- Productivity chart: animated line draw + bar grow on mount.

### Tasks
- TaskItem: animated checkbox, strike-through fade, row hover lift.
- Add task: input expand animation; new row drops in.
- Filter chips: animated active state pill.

### Planner (Schedule)
- Timeline blocks: animated drag handles, smooth time-grid scroll.
- Current-time indicator: subtle pulse-ring.
- Block hover: elevation pop.

### Habits
- HabitCard: animated streak flame icon (gentle), progress ring animates to value.
- HabitGrid cells: stagger fade-in; cell tap = scale-pop + color fill (no confetti).

### Todos
- List reorder transitions, animated completion.
- Empty state with subtle illustration fade-in.

### Analytics
- Charts: animated draw-in (line stroke dasharray, bars grow from baseline).
- KPI tiles: count-up + delta arrow slide.
- Tab switch: content crossfade.

### Settings
- Section cards with animated expand/collapse.
- Toggles use `AnimatedToggle`.
- Theme switch: animated sun/moon morph.

---

## 5. Mobile Responsiveness

- Audit all pages for `< 768px`: stack grids, larger tap targets (min 44px), bottom-safe spacing.
- Sidebar → bottom-anchored mobile drawer with swipe-close.
- Dashboard stats: 2-col on mobile instead of 1.
- Tables/lists: convert to card-stack layout under `sm`.
- Sticky page headers with condensed actions.

---

## 6. Technical Details

**Files created**
- `src/components/ui/motion/{AnimatedCard,AnimatedButton,AnimatedToggle,AnimatedProgress,AnimatedCounter,AnimatedCheckbox,PageTransition,Stagger}.tsx`
- `src/pages/AuthPage.tsx` (+ route)
- `src/hooks/useCountUp.ts`
- `src/hooks/useReducedMotion.ts`

**Files edited**
- `src/index.css` — tokens, gradients, shadow scale, reduced-motion.
- `tailwind.config.ts` — keyframes, animations, shadows, easing.
- `src/App.tsx` — add `/login`, `/register` routes; wrap routes with `PageTransition`.
- `src/components/layout/DashboardLayout.tsx` — page transition wrapper, mobile polish.
- `src/components/navigation/Sidebar.tsx` + `NavItem.tsx` — animated indicator, hover states.
- `src/pages/Dashboard.tsx`, `TasksPage.tsx`, `SchedulePage.tsx`, `HabitsPage.tsx`, `TodosPage.tsx`, `AnalyticsPage.tsx`, `SettingsPage.tsx` — swap primitives, add stagger/transitions.
- Component refresh: `StatCard`, `TaskItem`, `HabitCard`, `CapacityIndicator`, `ProductivityChart`, `QuickAddTask`.

**Constraints respected**
- No new heavy deps; pure Tailwind + CSS animations (optionally add `framer-motion` only if you want — say the word).
- Zero changes to business logic, state shape, or `AppContext` reducers.
- Backward compatible with existing localStorage + IndexedDB offline layer.
- All animations honor `prefers-reduced-motion`.
- No gamification: no confetti, badges, mascots, points, or sounds.

---

## Out of Scope
- Backend/auth wiring (auth page is UI-only unless you want Lovable Cloud enabled).
- New productivity features beyond visual polish.
- Page content restructuring beyond layout tightening.
