# Narender AI Assistant

Narender AI is a private AI workspace with Supabase authentication, user-scoped conversations and memories, Gemini responses, and an installable PWA. The root Next.js app is the Vercel deployment target. The `artifacts/` packages provide the Replit web preview and shared API service.

## Production setup

### 1. Configure environment variables

Set these values in the Vercel project’s Production environment. Add the same values to Preview/Development only if those environments should connect to the same Supabase project.

| Variable | Where it is used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser Supabase Auth client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser Supabase Auth client; use the publishable/anon key only |
| `GEMINI_API_KEY` | Server-side Gemini API route; never prefix this with `NEXT_PUBLIC_` |

For the separate Replit API service, also configure `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never use a Supabase service-role key in the browser or in this app’s normal request path. Keep all real values in the hosting provider’s secret/environment settings; do not commit `.env.local`.

Copy `.env.example` to `.env.local` for local development.

### 2. Apply the Supabase migration

Run `supabase/migrations/20261017000000_assistant.sql` in the Supabase SQL editor or through your normal migration process. It creates the chat, message, memory, and rate-limit tables; enables owner-only row-level security; and installs the per-account assistant request limit.

Enable the Email provider in Supabase Auth. For phone sign-in, configure an SMS provider and the allowed phone-number regions. Add the deployed Vercel URL to Supabase Auth’s Site URL and redirect URL allow list.

### 3. Build and run

```bash
pnpm install
pnpm build
pnpm start
```

The root `pnpm build` command runs the Next.js production build. The Replit Vite artifact can be checked separately:

```bash
pnpm --filter @workspace/narender-ai run typecheck
PORT=26110 BASE_PATH=/ pnpm --filter @workspace/narender-ai run build
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/mockup-sandbox run typecheck
```

## Deployment

Connect the GitHub repository to Vercel and use the repository root as the project root. Vercel detects the Next.js app and uses `pnpm build`. Add the environment variables above, then deploy. Supabase migrations are not run automatically by the web build; apply them before enabling user access.

## Security and data handling

- Every API route that reads or writes user data validates the Supabase access token.
- Requests use the user’s Supabase JWT and anon key; database row-level security enforces per-user ownership.
- Gemini requests are server-side, authenticated, limited per user, capped by input length, and use a request timeout.
- The PWA service worker does not intercept or cache `/api/` responses.
- The browser receives only the Supabase publishable/anon key. No service-role key is required.

The setup page remains visible when the public Supabase variables are missing. Production API calls fail explicitly rather than switching to sample or shared preview data.
