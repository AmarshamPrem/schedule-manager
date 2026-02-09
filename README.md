# Discipline: Productivity Command Center

A lightweight, extensible app for managing focus, tasks, routines, and productivity analytics.

## Overview
Provides a unified interface (CLI + web/desktop UI) for task automation, focus sessions, timers, habits, and lightweight analytics. Designed to be local-first, privacy-focused, and plugin-friendly.

## Quick Installation

Prerequisites
- Node.js 18+ and npm or Yarn
- (Optional) Python 3.8+ for auxiliary scripts
- Git

Local development
1. Clone:
   git clone https://github.com/your-org/discipline-productivity-cc.git
2. Install dependencies:
   cd discipline-productivity-cc
   npm install
3. Start dev server:
   npm run dev
4. Run tests:
   npm test

Production build
- Build frontend and backend:
  npm run build
- Start production server:
  npm start

## Project structure
- /apps
  - /ui — web or desktop frontend (React/Electron)
  - /api — backend server or local service
- /libs — shared modules (utils, data models, integrations)
- /plugins — community and local plugins
- /config — environment and deployment configs
- /scripts — dev and build helper scripts
- /docs — additional documentation
- /tests — unit and integration tests

## Technical features
- Local-first data model with optional sync
- Focus sessions (Pomodoro, custom timers)
- Task & habit management with recurring rules
- Automation rules and triggers (time, events, integrations)
- Metrics & lightweight analytics dashboard
- Plugin API for third-party extensions
- Cross-platform (desktop/web) architecture
- Offline-capable with conflict-resolution strategies

## Configuration
- Environment variables: see /config/example.env
- Default data directory: ~/.discipline-cc (configurable)
- Plugin registration: /plugins/README.md

## Privacy & Data
- Local-first storage: user data is stored locally by default.
- Optional sync: cloud sync is opt-in; data is encrypted in transit and at rest when enabled.
- Minimal telemetry: no telemetry enabled by default. Any optional telemetry is anonymized and opt-in.
- Exports & deletion: users can export or delete all local data via the Settings interface or CLI.
- No ads; data is not sold for marketing purposes.

## Contributing
- Follow code style in / .editorconfig and lint rules.
- Open issues and PRs; include tests for new features.
- See /docs/CONTRIBUTING.md for guidelines.

## License
MIT — see LICENSE file.

## Support
For bugs or feature requests, open an issue on the repository.