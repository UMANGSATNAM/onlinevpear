# Task 7: Mission Control Visual Identity

## Summary
Updated the Super Admin portal with a dark "Mission Control" visual identity inspired by Bloomberg Terminal × Linear × Vercel dashboard.

## Changes Made
1. **page.tsx** — Dark theme wrapper for admin view, Google Fonts loading, sidebar dark theme, navigation cyan accents, header dark theme, content area with grid pattern
2. **admin/overview.tsx** — Complete dark theme overhaul with glassmorphism cards, cyan primary, amber accents, Syne/DM Sans fonts
3. **admin/merchants.tsx** — Dark theme with glass cards, cyan accents, dark backgrounds

## Key Design Tokens
- Background: #0A0F1E / #111827
- Primary: #00D4FF (Electric Cyan)
- Accent: #F59E0B (Amber)
- Secondary: #A78BFA (Purple)
- Text Primary: #F9FAFB
- Text Secondary: #94A3B8
- Cards: bg-white/5 backdrop-blur-xl border-white/10
- Display Font: Syne
- Body Font: DM Sans

## Verification
- ESLint passes
- Dev server compiles
- Dark theme only applies in admin view
