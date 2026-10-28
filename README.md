# Work Nest

A local **role-based project manager**. Four roles share projects and tasks. Permissions are enforced on the **server** (Postman still gets 403). Two people editing the same task cannot silently overwrite each other — the second save gets **HTTP 409**.

Built with **PostgreSQL + Express + React + Node** (PERN). Postgres instead of Mongo because roles and a task `version` column fit tables.

Repo: https://github.com/SHUBHxSHARMA/Work-Nest

## What a recruiter / judge should see

1. Clone this repo and run it locally (steps below).
2. Log in as admin, then as a team member, then as a viewer.
3. Try a forbidden action (member deleting a project) — API returns **403**.
4. Open the same task in two browsers, save twice — second save is **409**.

Password for every demo account: `Password123!`

| Email | What they are |
| --- | --- |
| `admin@local.test` | Global admin (users + projects) |
| `pm@local.test` | Project manager on Website relaunch |
| `member@local.test` | Team member (can update tasks, status, comments) |
| `viewer@local.test` | Read only |

## Run it on your machine

You need **Node.js 20+** and **PostgreSQL** (or Docker).

```bash
git clone https://github.com/SHUBHxSHARMA/Work-Nest.git
cd Work-Nest
```

### 1. Database

**Option A — PostgreSQL already installed**

Create a database named `neoboard`.

**Option B — Docker**

```bash
docker compose up -d
```

That starts Postgres 17 on port **5432**, user `postgres`, password `postgres`, database `neoboard`.

### 2. Server env

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server\.env.example server\.env
```

Default `DATABASE_URL` matches Docker and a local Postgres with user/password `postgres`. Change it if your Postgres login is different. `JWT_SECRET` can stay as-is for a local demo.

### 3. Install, migrate, seed, start

Terminal 1 — API (http://localhost:4000):

```bash
cd server
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Check http://localhost:4000/api/health — you want `"database": "connected"`.

Terminal 2 — UI (http://localhost:5173):

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** (splash, then login). Vite proxies `/api` to port 4000.

## Demo path (10 minutes)

1. **Admin** — `admin@local.test`. Users page. Create a throwaway project, then delete it. Do not delete Website relaunch.
2. **PM** — `pm@local.test`. Website relaunch → Team / Tasks.
3. **Member** — `member@local.test`. Open **Draft landing page copy**. Change status, add a comment, Save.
4. **Viewer** — `viewer@local.test`. Can read. Cannot edit or comment.
5. **409** — same task in two windows. Save in one, then Save in the other without reload.

Judge notes: [`HACKATHON_BRIEFING.md`](HACKATHON_BRIEFING.md)

## Stack

| Piece | Tool |
| --- | --- |
| UI | React + Vite |
| API | Express on Node |
| Database | PostgreSQL + Prisma |
| Auth | JWT + bcrypt |

## Folders

- `client/` — React screens
- `server/` — Express routes, Prisma schema, seed
- `docker-compose.yml` — optional local Postgres
- `vercel.json` — optional cloud deploy (needs hosted Postgres). **Not required to try the project.**

## What is real vs later

**Real:** local Postgres, JWT, server 403s, task `version` + 409, comments, CRUD.

**Not in this build:** live WebSockets, file uploads, email.
