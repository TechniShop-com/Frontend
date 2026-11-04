---
name: technishop-ui-ux
description: Recreate, extend, or adapt the TechniShop storefront's distinctive visual identity, Polish UI copy, layouts, components, and customer flows without requiring access to the original repository.
---

# TechniShop UI/UX

Create interfaces consistent with TechniShop, a Polish merchandise store for the Techni Schools and Techni Zdalni community. Use this skill when recreating the store, designing an associated page, or extending its interface. Preserve the user's requested scope and functionality. Treat the reference as a visual snapshot, not proof that commerce integrations exist or are production-ready.

## Workflow

1. Read [design-spec.md](references/design-spec.md) for visual tokens, layout, copy, interaction patterns, page inventory, and responsive behavior.
2. For exact details consult the self-contained source snapshot under [snapshot](references/snapshot): `App.tsx`, `index.css`, `tailwind.config.js`, `index.html`, `mockData.ts`, plus `components/` and `pages/`. Match only the relevant screens; these files are visual references, not a standalone app. Their imports refer to application code not included in the snapshot.
3. Implement in the target project's existing stack and conventions. If recreating from scratch, React + TypeScript + Tailwind CSS 3 and lucide-react align with the snapshot. Reproduce the visual hierarchy, geometry, and interactions before embellishing. Use the in-snapshot SVG logo where appropriate.
4. Verify relevant desktop and mobile pages and states when a browser is available. Check imagery, navigation, forms, keyboard access and interactions. Honor reduced-motion preferences. Do not report visual parity unless it was actually checked.

## Boundaries

- The snapshot captures the local frontend, not unmerged PRs or future admin features. Existing static reviews, ratings, prices, delivery promises, payment logos, and order statuses may be placeholders. Never present them as verified business facts or imply functional payments, shipping, or security without implementation and verification.
- Source images are remote Unsplash URLs and Inter is loaded from Google Fonts. They require network access and can change or become unavailable; do not claim offline or pixel-identical reproduction without image rights/assets and rendered verification.
- Preserve context-specific copy and brand. New functional flows should be honest, accessible, and complete; copy visible placeholder claims only when explicitly recreating a non-production mockup.
