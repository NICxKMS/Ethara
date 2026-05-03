# Team Task Manager Architecture

## Goal

Build a small full-stack web app where authenticated users can manage projects, invite team members, assign tasks, and track task progress. The app should satisfy the assignment requirements without introducing services that are not needed for the core workflow.

## Recommended Stack

- Frontend and backend: Next.js with TypeScript, using App Router pages for UI and route handlers for REST APIs.
- Database: PostgreSQL, hosted on Railway Postgres for the simplest deployment. Neon Postgres is a good alternative if a separate managed database is preferred.
- ORM: Drizzle ORM with Drizzle Kit migrations.
- Validation: Zod at API boundaries, with Drizzle schema types as the database source of truth.
- Authentication: Email/password authentication handled in the app with secure password hashing and signed sessions.
- Session storage: Database-backed sessions for the base version.
- Redis: Upstash Redis only for optional API rate limiting or short-lived invitation tokens. Do not use Redis for core task data.
- Deployment: One Railway web service plus one PostgreSQL database service.

This keeps the system deployable as a single app service while still using proper REST APIs, relational data, validation, and role-based access control.

## High-Level Architecture

```text
Browser
  -> Next.js pages and client components
  -> REST route handlers under /api
  -> service layer for validation, authorization, and business rules
  -> Drizzle ORM
  -> PostgreSQL

Optional:
  -> Upstash Redis for rate limiting auth endpoints
```

The UI calls only the app's own REST API. API route handlers do request parsing, session lookup, input validation, and call small service functions. Service functions enforce ownership and role rules before using Drizzle to read or write PostgreSQL.

## Core Domain Model

### Users

Users represent people who can log in and participate in projects.

Fields:
- `id`: UUID primary key
- `name`: required display name
- `email`: required unique email, stored lowercase
- `passwordHash`: required for email/password login
- `createdAt`, `updatedAt`

### Sessions

Sessions keep users logged in without requiring an external auth provider.

Fields:
- `id`: UUID primary key
- `userId`: foreign key to `users.id`
- `tokenHash`: unique hash of the session token
- `expiresAt`
- `createdAt`

### Projects

Projects group tasks and members.

In this architecture, a project's members are the project team. A separate `teams` table is not needed unless the product later needs one team to own multiple projects.

Fields:
- `id`: UUID primary key
- `name`: required, max 120 characters
- `description`: optional, max 1000 characters
- `ownerId`: foreign key to `users.id`
- `createdAt`, `updatedAt`

### Project Members

Project membership defines per-project access.

Fields:
- `projectId`: foreign key to `projects.id`
- `userId`: foreign key to `users.id`
- `role`: enum `admin` or `member`
- `createdAt`

Constraints:
- Composite primary key: `(projectId, userId)`
- Project owner must also have an `admin` membership row
- Only project admins can add, remove, or change members

### Tasks

Tasks belong to projects and may be assigned to a project member.

Fields:
- `id`: UUID primary key
- `projectId`: foreign key to `projects.id`
- `title`: required, max 160 characters
- `description`: optional, max 2000 characters
- `status`: enum `todo`, `in_progress`, `done`
- `priority`: enum `low`, `medium`, `high`, default `medium`
- `assigneeId`: nullable foreign key to `users.id`
- `createdById`: foreign key to `users.id`
- `dueDate`: nullable timestamp
- `createdAt`, `updatedAt`

Rules:
- `assigneeId`, when present, must be a member of the same project.
- Members can update task status on tasks in their projects.
- Admins can create, edit, assign, and delete any task in their projects.

## Relationships

```text
users 1 -> many sessions
users 1 -> many projects as owner
users many -> many projects through project_members
projects 1 -> many tasks
users 1 -> many tasks as creator
users 1 -> many tasks as assignee
```

PostgreSQL is the source of truth for all app data. Use foreign keys and unique constraints for relationships that must always hold. Use service-level checks for rules that depend on multiple rows, such as confirming an assignee belongs to the project.

## Role-Based Access Control

RBAC is project-scoped, not global. This is enough for the assignment and avoids unnecessary organization-level roles.

### Admin

Admins can:
- View the project and its dashboard
- Update project details
- Add and remove project members
- Change member roles
- Create, edit, assign, update status, and delete tasks

### Member

Members can:
- View projects where they are members
- View project tasks and dashboard data
- Create tasks in their projects
- Update task status in their projects
- Edit tasks they created, except assignment and project-level fields

### Access Checks

Every project and task API must first load the current user from the session, then verify membership for the target project. Admin-only actions must verify the membership role is `admin`.

## REST API Design

Use JSON request and response bodies. Return validation errors as `400`, unauthenticated requests as `401`, unauthorized project access as `403`, and missing resources as `404`.

### Auth

- `POST /api/auth/signup`: create user, create session
- `POST /api/auth/login`: verify credentials, create session
- `POST /api/auth/logout`: delete current session
- `GET /api/auth/me`: return current user

### Projects

- `GET /api/projects`: list projects for the current user
- `POST /api/projects`: create project and admin membership
- `GET /api/projects/:projectId`: get project details
- `PATCH /api/projects/:projectId`: admin updates project details
- `DELETE /api/projects/:projectId`: owner/admin deletes project

### Members

- `GET /api/projects/:projectId/members`: list members
- `POST /api/projects/:projectId/members`: admin adds member by email
- `PATCH /api/projects/:projectId/members/:userId`: admin changes role
- `DELETE /api/projects/:projectId/members/:userId`: admin removes member

### Tasks

- `GET /api/projects/:projectId/tasks`: list tasks with filters for status, assignee, and due date
- `POST /api/projects/:projectId/tasks`: create task
- `GET /api/projects/:projectId/tasks/:taskId`: get task details
- `PATCH /api/projects/:projectId/tasks/:taskId`: update task fields or status
- `DELETE /api/projects/:projectId/tasks/:taskId`: admin deletes task

### Dashboard

- `GET /api/dashboard`: aggregate current user's assigned tasks across projects
- `GET /api/projects/:projectId/dashboard`: aggregate project task totals by status, assignee, and overdue count

## Validation Rules

Use a schema validation library such as Zod at every API boundary.

Required validation:
- Email must be valid and normalized to lowercase.
- Password must meet the minimum length configured for the assignment.
- Project name and task title must be non-empty after trimming.
- Task status must be one of `todo`, `in_progress`, or `done`.
- Task priority must be one of `low`, `medium`, or `high`.
- Due dates must parse as valid dates.
- Member role must be `admin` or `member`.
- IDs in route params must be valid UUIDs.

Business validation:
- A user cannot be added to the same project twice.
- A project must always have at least one admin.
- A task cannot be assigned to a user outside its project.
- A member cannot access projects where they do not have membership.

Drizzle constraints protect database integrity. Zod request schemas protect REST API inputs before service logic runs.

## Suggested File Structure

```text
src/
  app/
    api/
      auth/
      projects/
      dashboard/
    dashboard/
    projects/
    login/
    signup/
  db/
    index.ts
    schema.ts
  server/
    auth.ts
    permissions.ts
    validation.ts
    services/
      projects.ts
      members.ts
      tasks.ts
      dashboard.ts
  components/
    ui/
    projects/
    tasks/
drizzle/
drizzle.config.ts
```

Keep route handlers thin. Put database and authorization logic in `src/server` so it can be tested without rendering UI.

## Drizzle ORM Plan

Use a code-first schema in `src/db/schema.ts`. Generate SQL migrations with Drizzle Kit and commit the generated migration files.

Use generated migrations for production. `drizzle-kit push` is acceptable for quick local experiments, but it should not be the Railway deployment path because generated SQL migrations are reviewable and repeatable.

Recommended scripts:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

Recommended `drizzle.config.ts` shape:

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

For production, run `npm run db:migrate` as a Railway pre-deploy command so migrations apply before the new version starts.

If using Neon or Supabase Postgres outside Railway, keep `DATABASE_URL` as the only app-facing connection variable. Use the direct database connection for migrations. If Supabase transaction pooling is used for serverless-style traffic, disable prepared statements in the database client for that connection mode.

## Authentication Approach

Use first-party email/password authentication for the assignment unless the project specifically wants managed auth.

Implementation outline:
- Hash passwords with `bcrypt` or `argon2` before storage.
- Create a random session token on login/signup.
- Store only a hash of the session token in `sessions`.
- Send the raw token to the browser in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- On each API request, hash the cookie token and find the matching non-expired session.
- Delete the session on logout.

Supabase Auth is acceptable if reducing auth implementation work is more important than keeping all auth code in the app. If Supabase Auth is used, keep PostgreSQL as the app database and map Supabase user IDs to the app's `users` table.

## Dashboard Calculations

The dashboard can be calculated from task queries at request time. No background worker or analytics table is needed for this assignment.

Metrics:
- Total tasks assigned to the current user
- Tasks by status
- Overdue tasks where `dueDate < now()` and `status != done`
- Project-level task counts by status
- Optional list of nearest upcoming due tasks

Add indexes on `tasks.projectId`, `tasks.assigneeId`, `tasks.status`, and `tasks.dueDate` to keep these queries simple and fast.

## Railway Deployment

### Services

Use one Railway project with:
- Web service: the Next.js app from the GitHub repository
- PostgreSQL service: Railway Postgres, or external Neon Postgres with `DATABASE_URL`
- Optional Upstash Redis: external service used only if rate limiting is enabled

### Environment Variables

Server-only variables:

```text
DATABASE_URL=postgresql://...
SESSION_SECRET=long-random-secret
NODE_ENV=production
```

Optional Redis variables:

```text
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Client-exposed variables should use the framework prefix only when the browser must read them. Do not expose database, session, Redis, or auth secrets to the client.

### Build and Start

For a Next.js deployment on Railway:
- Set `output: "standalone"` in `next.config.ts`.
- Use `npm run build` as the build command.
- Use the package start script as the Railway start command.
- Add `npm run db:migrate` as the Railway pre-deploy command.
- Optionally commit `railway.json` so deployment settings are versioned.

Recommended package scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node .next/standalone/server.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

Recommended `railway.json`:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "preDeployCommand": "npm run db:migrate",
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Deployment Steps

1. Push the repository to GitHub.
2. Create a Railway project from the GitHub repository.
3. Add a Railway PostgreSQL database, or create a Neon Postgres database.
4. Set `DATABASE_URL` on the web service. Prefer Railway reference variables when using Railway Postgres.
5. Set `SESSION_SECRET` as a sealed or protected secret.
6. Configure the pre-deploy command as `npm run db:migrate`.
7. Deploy the web service.
8. Run a smoke test against `/api/auth/me`, signup/login, project creation, task creation, and dashboard endpoints.

## Optional Upstash Redis Usage

Do not add Redis to the core architecture unless one of these is needed:
- Rate limiting `POST /api/auth/login` and `POST /api/auth/signup`
- Short-lived project invitation tokens
- Simple cache for dashboard responses under heavy traffic

For this assignment, rate limiting auth endpoints is the only strong use case. The app should continue to work without Redis if rate limiting is disabled.

## Security Notes

- Store password hashes, never plaintext passwords.
- Use `HttpOnly`, `Secure`, and `SameSite=Lax` session cookies.
- Enforce RBAC on the server for every API request.
- Never trust project IDs or user IDs from the client without checking membership.
- Keep secrets in Railway variables, not in source control.
- Validate all input at API boundaries.

## Testing Strategy

Keep testing practical and focused:
- Unit test permission helpers for admin/member rules.
- Unit test validation schemas for common invalid inputs.
- Integration test the main API flows: signup, login, create project, add member, create task, assign task, update status, dashboard summary.
- Run Drizzle migrations against a test PostgreSQL database before deployment.

## Minimal Delivery Scope

The first complete version should include:
- Signup, login, logout, and current-user endpoint
- Project create/list/detail/update
- Member list/add/remove/role update
- Task create/list/detail/update/delete
- Dashboard summaries for current user and project
- PostgreSQL schema with foreign keys and indexes
- Drizzle migrations committed to the repository
- Railway deployment with environment variables and migration pre-deploy command

Avoid adding notifications, comments, file uploads, background workers, real-time collaboration, billing, organizations, or audit logs unless the assignment is expanded later.
