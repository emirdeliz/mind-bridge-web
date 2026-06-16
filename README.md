# Mind Bridge Web

Mind Bridge is a web application designed to improve collaboration between patients and psychologists, helping psychotherapy sessions become more productive and data-informed.

## Product Overview

The platform is intended to let psychologists:

- Monitor patient interactions in the app.
- View AI-generated interaction summaries.
- Write clinical notes for each interaction.
- Add session considerations during psychotherapy meetings.
- Build context so the AI agent can provide better day-to-day responses to patients.
- Interact with the AI agent to gain insights during sessions.

## Architecture

### Frontend

- **React + Next.js (Pages Router)**
- Protected routes use **SSR** (`getServerSideProps`) for auth gates.
- Supabase and `mind-bridge-be` credentials stay **server-only**; the browser calls same-origin `/api/auth/*` and `/api/backend/*` (BFF proxy).

### UI and Styling

- **Tailwind CSS**
- Utility-first styling approach for fast and consistent UI development.

### Data Layer

- **Supabase Auth** (server-side via `@supabase/ssr` cookies — no `NEXT_PUBLIC_SUPABASE_*`).
- **mind-bridge-be** via `API_BASE_URL` (proxied as `/api/backend/...` from the browser).

### Testing

- **Jest**
- Unit and integration test strategy based on Jest.

## Planned Functional Flow

- Authenticated access for psychologists.
- Social login support (Google and Facebook).
- User identification fields (name, age, address, phone).
- Auto-fill of available profile data from OAuth providers.
- Manual completion when provider data is unavailable.

## Deploy (Vercel)

1. Install dependencies: `npm install`
2. Log in to Vercel (once): `npx vercel login`
3. Preview deploy: `npm run deploy:vercel`
4. Production deploy: `npm run deploy:vercel:prod`

The script runs a local `npm run build` before upload. Skip it with `SKIP_BUILD=1` if needed.

Set environment variables in the Vercel dashboard (see `.env.example`):

| Variable                            | Scope          | Example                               |
| ----------------------------------- | -------------- | ------------------------------------- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Server only    | Supabase Cloud project                |
| `API_BASE_URL`                      | Server only    | `https://mind-bridge-be.onrender.com` |
| `NEXT_PUBLIC_APP_URL`               | Public         | `https://your-app.vercel.app`         |
| `AUTH_BYPASS`                       | Server only    | `false` in production                 |
| `NEXT_PUBLIC_AUTH_BYPASS`           | Client UI flag | `false` in production                 |

**Cloud stack (free tier):** Supabase Cloud + Vercel (this app) + backend on Render ([render.yaml](../mind-bridge-be/render.yaml)) with Gemini API on the backend.

For production, set `NEXT_PUBLIC_AUTH_BYPASS=false` and `AUTH_BYPASS=false`.

CI example: export `VERCEL_TOKEN` and optionally `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`, then run `npm run deploy:vercel:prod`.

## Project Status

This project is in an evolving phase. Core architectural choices are defined, and implementation is being organized around:

- Scalability with Next.js conventions.
- Maintainable and reusable UI using Tailwind.
- Future-ready backend integration with Supabase.
- Test coverage foundation with Jest.
