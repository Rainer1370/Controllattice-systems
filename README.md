# ControlLattice Systems

Business website for **ControlLattice Systems** — controls, AI, and technical
knowledge for complex scientific and industrial systems.

> Connecting complex systems to usable knowledge.

## Capabilities

- Controls and instrumentation architecture
- EPICS integration and operator interfaces
- Diagnostics, simulation, and digital twins
- Practical AI and engineering knowledge workflows
- Managed technical systems and recurring engineering support

## Website

- Production: <https://controllattice.com>
- Site source: `app/`
- Static compatibility pages: repository root HTML files
- Engineering portfolio: <https://rainer1370.com>

## Local development

Requirements: Node.js 22.13 or later on Linux.

```bash
npm ci
npm run dev
```

Then open the local address printed by the development server.

To create a production build:

```bash
npm run build
```

## Project structure

- `app/page.tsx` — scientific-facilities homepage
- `app/products/`, `app/work/`, `app/ai/`, `app/about/`, `app/staff/`, `app/contact/` — site routes
- `app/globals.css` — visual system and responsive layout
- `app/layout.tsx` — metadata and document shell
- `public/brand/` and `public/*.png` — brand and technical imagery

## Ownership

Copyright © 2026 ControlLattice Systems. All rights reserved.
