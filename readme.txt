Ethara Team Task Manager

Ethara is a full-stack team task manager for authenticated project coordination.

Core features:
- Email and password signup, login, and logout.
- DB-backed sessions.
- Project creation and project-scoped membership.
- Admin and member roles.
- Member management by registered user email.
- Task creation with status, priority, assignee, and due date.
- Task status updates from the workspace board.
- Dashboard totals for total, todo, in progress, done, and overdue tasks.
- PostgreSQL persistence through Drizzle ORM.
- Railway deployment configuration.

Tech stack:
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- PostgreSQL
- Zod
- Vitest
- Playwright

Local setup:
1. Run npm install.
2. Create .env from .env.example.
3. Set DATABASE_URL and SESSION_SECRET.
4. Run npm run db:migrate.
5. Run npm run dev.

Verification:
- npm run test
- npm run lint
- npm run build
- npm run test:e2e

Architecture details are documented in architecture.md.
