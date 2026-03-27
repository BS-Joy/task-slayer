# Task Slayer

Task Slayer is a modern task management app built with Next.js and Supabase.  
It supports daily and repetitive tasks, rich-text notes, drag-and-drop ordering, overdue task reviews, and Google/email authentication.

## Quick Start (TL;DR)

1. Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)
5. Make sure your Supabase project has a `tasks` table and auth providers configured

## Features

- Email/password authentication with Supabase Auth
- Google OAuth login flow
- Create, edit, delete, and reschedule tasks
- Repetitive tasks with completion tracked by date (`completedOn`)
- Priority levels (`low`, `medium`, `high`)
- Optional task time ranges (`timeStart`, `timeEnd`)
- Rich text task descriptions (TipTap editor)
- Drag-and-drop task ordering
- Theme support (light/dark/system)
- PWA basics (manifest + service worker)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling/UI:** Tailwind CSS v4, shadcn-style components, Radix UI
- **State:** Zustand
- **Backend/Auth/DB:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Editor:** TipTap
- **DnD:** `@dnd-kit/react`
- **Notifications:** Sonner
- **Date utils:** date-fns

## Routes

- `/` - Main task dashboard
- `/login` - Login page
- `/signup` - Signup page
- `/auth/callback` - OAuth callback route (session exchange)

## Project Structure

```text
taskslayer/
├─ app/
│  ├─ actions/
│  │  ├─ auth/authActions.js       # login/signup/google auth helpers
│  │  └─ task/taskActions.js       # task CRUD + reorder/reschedule
│  ├─ auth/callback/route.js       # OAuth code exchange
│  ├─ login/page.js
│  ├─ signup/page.js
│  ├─ layout.js                    # global layout, theme, nav, toaster
│  ├─ page.js                      # home page
│  └─ manifest.js                  # PWA manifest
├─ components/
│  ├─ home/                        # home header/container
│  ├─ layout/                      # desktop/mobile nav
│  ├─ login/, signup/              # auth forms
│  ├─ task/                        # task list, item, modals, overdue flows
│  ├─ ui/                          # reusable UI primitives
│  ├─ rich-text-editor.jsx
│  └─ ServiceWorkerRegister.jsx
├─ lib/
│  └─ task-store.js                # Zustand task state
├─ utils/
│  ├─ index.js                     # helpers (formatDate, priority styles)
│  └─ supabase/                    # browser/server/middleware clients
├─ public/
│  └─ sw.js                        # service worker
├─ proxy.js                        # session update + route protection matcher
├─ components.json                 # shadcn config
└─ jsconfig.json                   # path alias (@/*)
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> `NEXT_PUBLIC_BASE_URL` is used in Google OAuth redirect generation (`/auth/callback`).

## Supabase Setup

### 1) Enable Authentication

- Enable **Email/Password** provider
- (Optional) Enable **Google** provider
- Set redirect URLs:
  - Local: `http://localhost:3000/auth/callback`
  - Production: `https://your-domain.com/auth/callback`

### 2) Create `tasks` table

Use this schema as a baseline (matches fields used by the app):

```sql
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium',
  date date not null,
  timeIncluded boolean not null default false,
  timeStart text,
  timeEnd text,
  completed boolean not null default false,
  completedOn text[] not null default '{}',
  isRepetitive boolean not null default false,
  repetitionEndDate date,
  "order" integer not null default 1,
  rescheduled boolean not null default false,
  originalDueDate date,
  created_at timestamptz not null default now()
);
```

### 3) Row Level Security (recommended)

```sql
alter table public.tasks enable row level security;

create policy "Users can view own tasks"
on public.tasks for select
using (auth.uid() = user_id);

create policy "Users can insert own tasks"
on public.tasks for insert
with check (auth.uid() = user_id);

create policy "Users can update own tasks"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
on public.tasks for delete
using (auth.uid() = user_id);
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run linting

## Auth and Session Flow

- Server/client Supabase clients are defined in `utils/supabase/`.
- `proxy.js` + `utils/supabase/middleware.js` refresh session and redirect unauthenticated users to `/login`.
- Public auth routes (`/login`, `/signup`, `/auth/*`) are allowed.
- Google login redirects to provider, then `/auth/callback` exchanges code for session.

## Task Behavior Notes

- Non-repetitive tasks use `completed` boolean.
- Repetitive tasks track completion per day via `completedOn` array.
- Tasks are fetched by selected date, including repetitive tasks active for that date range.
- Drag-and-drop updates task `order` both in UI state and database.
- Overdue banner appears for incomplete, non-repetitive tasks from earlier dates.

## PWA

- Manifest is provided by `app/manifest.js`.
- Service worker is registered in `components/ServiceWorkerRegister.jsx` and served from `public/sw.js`.

## Deployment

You can deploy on Vercel (recommended for Next.js):

1. Push repo to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL` (set to deployed app URL)
4. Deploy

## Known Gaps / Next Improvements

- Add tests (unit + integration for auth and task actions)
- Add CI checks (`lint`, `build`, tests)
- Improve offline data sync behavior
- Implement overdue task notification + review modal
- Add README screenshots/demo GIF

## License

No license specified yet. Add one if you plan to open-source the project.

