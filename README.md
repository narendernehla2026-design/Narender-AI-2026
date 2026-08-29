# Narender AI Vault (Next.js PWA)

This repository is a production-ready starter for "Narender AI Vault" — a progressive web app built with Next.js (App Router), Tailwind CSS, and PWA features (manifest + service worker). It includes modular React components for a left sidebar, central chat area with voice + screen preview, and a right sidebar for user memory & pinned items. Supabase integration points are included and use environment variables.

## Features
- Next.js App Router project structure
- Tailwind CSS for styling and theming
- Lucide React icons
- Voice input UI (Web Speech API)
- Screen preview UI (getDisplayMedia)
- PWA manifest and a minimal service worker for offline caching
- Supabase client wrapper (no secrets in code)

## Setup (Powered by pnpm)

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Environment variables
   Create a `.env.local` at project root and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   # For server-side secret usage (do NOT commit):
   # SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Development
   ```bash
   pnpm run dev
   ```

4. Build & Start (production)
   ```bash
   pnpm run build
   pnpm run start
   ```

5. PWA
- The manifest is at `/public/manifest.json`.
- A simple service worker is provided at `/public/sw.js`. It is automatically registered client-side (see `app/layout.js`). For advanced offline strategies, replace with Workbox or `next-pwa`.

## Deployment
Any platform that supports Next.js works (Vercel, Netlify with adapter, etc.). Ensure environment variables are set in your hosting provider.

## Security
- Never store secret keys in the client bundle.
- Use server-only env vars for privileged Supabase operations.
- The provided auth in earlier examples is intentionally minimal; replace with robust authentication (Supabase Auth, OAuth, or similar) for production.

## Extending
- Replace the in-memory chat with a DB-backed store via Supabase.
- Add server-side AI integration (OpenAI, private LLM) through secure server routes.
- Add E2E encryption for chat content for higher security if required.

---
