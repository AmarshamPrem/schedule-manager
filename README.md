# schedule-manager

A lightweight, local-first schedule and task manager (frontend in TypeScript + Vite).

## Quick Start

Prerequisites

- Node.js 18+ and npm or Yarn
- Git (optional)

Local development

1. Install dependencies:

   npm install

2. Start dev server:

   npm run dev

Production build

    npm run build

Run tests

    npm run test

## Project layout (root)

- bun.lockb
- components.json
- eslint.config.js
- index.html
- package.json
- postcss.config.js
- README.md
- tailwind.config.ts
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
- vitest.config.ts
- public/
  - robots.txt
- src/
  - App.css
  - App.tsx
  - index.css
  - main.tsx
  - vite-env.d.ts
  - components/
    - NavLink.tsx
    - analytics/ProductivityChart.tsx
    - command/CommandPalette.tsx
    - dashboard/CapacityIndicator.tsx
    - dashboard/QuickAddTask.tsx
    - dashboard/StatCard.tsx
    - data/DataExportImport.tsx
    - focus/FocusMode.tsx
    - habits/HabitCard.tsx
    - habits/HabitGrid.tsx
    - inbox/InboxView.tsx
    - layout/DashboardLayout.tsx
    - navigation/NavItem.tsx
    - navigation/Sidebar.tsx
    - offline/OfflineIndicator.tsx
    - planning/DailyPlanningRitual.tsx
    - reflection/EndOfDayShutdown.tsx
    - schedule/DailyTimeline.tsx
    - tasks/TaskItem.tsx
    - tasks/TaskList.tsx
    - todos/TodoListCard.tsx
    - ui/ (collection of UI primitives and components)
  - contexts/
    - AppContext.tsx
  - hooks/
    - use-mobile.tsx
    - use-toast.ts
    - useKeyboardShortcuts.ts
    - useOnlineStatus.ts
  - lib/
    - offlineStorage.ts
    - syncManager.ts
    - utils.ts
  - pages/
    - AnalyticsPage.tsx
    - Dashboard.tsx
    - HabitsPage.tsx
    - InboxPage.tsx
    - NotFound.tsx
    - SchedulePage.tsx
    - SettingsPage.tsx
    - TasksPage.tsx
    - TodosPage.tsx
  - test/
    - example.test.ts
    - setup.ts
  - types/
    - index.ts

This README reflects the frontend app structure in `src/` and the top-level toolchain files.

## Contributing

- Follow the project's lint and formatting rules.
- Add tests for new features and run `npm run test`.

## License

MIT
