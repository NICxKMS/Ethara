# Ethara Team Task Manager

Ethara is a full-stack team task manager built for the assignment brief. It includes email/password authentication, projects, project members, task assignment, task status tracking, project dashboards, role-based permissions, PostgreSQL relationships, and Railway deployment configuration.

The UI follows the latest Stitch project direction for **Ethara Workstream Atelier**: warm parchment surfaces, Sora display typography, Geist body text, copper actions, a project rail, a central task board, and a progress intelligence panel. Assignment-critical data is loaded from PostgreSQL through the app services; the authenticated workspace does not rely on mock or seeded UI data.

## Features

- Sign up, log in, and log out with DB-backed sessions.
- Create projects and automatically become the project owner/admin.
- View only projects where the signed-in user is a member.
- Add registered users to projects as members or admins.
- Change member roles and remove members, with owner protection.
- Create tasks with title, description, status, priority, assignee, and due date.
- Update task status from the task board.
- View dashboard totals for total, todo, in progress, done, and overdue tasks.
- Enforce project-scoped RBAC in API services.
- Deploy as one Railway web service backed by Railway PostgreSQL.

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Drizzle ORM and Drizzle Kit
- PostgreSQL
- Zod validation
- Vitest unit tests
- Playwright e2e smoke test
- Railway deployment config

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set:

```bash
DATABASE_URL=postgresql://user:password@host:5432/ethara
SESSION_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

3. Apply database migrations:

```bash
npm run db:migrate
```

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

Run the full local verification stack before submitting:

```bash
npm run test
npm run lint
npm run build
npm run test:e2e
```

The e2e test exercises the real auth and workspace flow: signup, project creation, member addition, task creation, status update, and logout.

## Railway Deployment

Create one Railway web service and one Railway PostgreSQL service.

Required Railway variables:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=<long random production secret>
NODE_ENV=production
```

The committed `railway.json` uses:

```json
{
  "deploy": {
    "preDeployCommand": "npm run db:migrate",
    "startCommand": "npm run start"
  }
}
```

The app builds with Next.js standalone output and starts with `node .next/standalone/server.js` through `npm run start`.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/[projectId]`
- `GET /api/projects/[projectId]/members`
- `POST /api/projects/[projectId]/members`
- `PATCH /api/projects/[projectId]/members/[userId]`
- `DELETE /api/projects/[projectId]/members/[userId]`
- `GET /api/projects/[projectId]/tasks`
- `POST /api/projects/[projectId]/tasks`
- `PATCH /api/projects/[projectId]/tasks/[taskId]`
- `GET /api/dashboard`
- `GET /api/projects/[projectId]/dashboard`

## Architecture

See `architecture.md` for the data model, REST API contract, RBAC rules, and deployment rationale.
