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
- **React + Next.js**
- Server-rendering and routing are handled through Next.js.

### UI and Styling
- **Tailwind CSS**
- Utility-first styling approach for fast and consistent UI development.

### Data Layer
- **Supabase** (planned)
- The integration with Supabase is defined in the architecture but **is not enabled yet** in the current stage.

### Testing
- **Jest**
- Unit and integration test strategy based on Jest.

## Planned Functional Flow

- Authenticated access for psychologists.
- Social login support (Google and Facebook).
- User identification fields (name, age, address, phone).
- Auto-fill of available profile data from OAuth providers.
- Manual completion when provider data is unavailable.

## Project Status

This project is in an evolving phase. Core architectural choices are defined, and implementation is being organized around:

- Scalability with Next.js conventions.
- Maintainable and reusable UI using Tailwind.
- Future-ready backend integration with Supabase.
- Test coverage foundation with Jest.