# Work Nest

A **role-based project manager**. Four roles share projects and tasks. Permissions are enforced on the **server** (Postman still gets 403). Two people editing the same task cannot silently overwrite each other — the second save gets **HTTP 409**.

Built with **PostgreSQL + Express + React + Node** (PERN). Postgres instead of Mongo because roles and a task `version` column fit tables.

**Live demo:** https://work-nest-mocha.vercel.app  
**Repo:** https://github.com/SHUBHxSHARMA/Work-Nest

## Try it (no install)

Open the live demo. Anyone with the link can sign in. The board starts with **one example project** (`Example — Website relaunch`) so you can try admin, PM, member, and viewer. Create your own from **Projects**. This is a **shared** database — please do not delete the example.

Password for every demo account: `Password123!`

| Email | What they are |
| --- | --- |
| `admin@local.test` | Global admin (users + projects) |
| `pm@local.test` | Project manager on the example project |
| `member@local.test` | Team member (can update tasks, status, comments) |
| `viewer@local.test` | Read only |

1. Admin — see the **Example** project, then **Projects → New project** to make your own.
2. PM — Example — Website relaunch → Team / Tasks.
3. Member — open **Draft landing page copy**. Change status, add a comment, Save.
4. Viewer — can read. Cannot edit or comment.
5. **409** — same task in two windows. Save in one, then Save in the other without reload.

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

Judge notes: [`HACKATHON_BRIEFING.md`](HACKATHON_BRIEFING.md)

## Stack

| Piece | Tool |
| --- | --- |
| UI | React + Vite |
| API | Express on Node |
| Database | PostgreSQL + Prisma |
| Auth | JWT + bcrypt |
| Public host | Vercel (Vite + Express) + Neon Postgres |

## Folders

- `client/` — React screens
- `server/` — Express routes, Prisma schema, seed
- `docker-compose.yml` — optional local Postgres
- `vercel.json` — one Vercel project: `/api` → Express, everything else → Vite

## What is real vs later

**Real:** JWT, server 403s, task `version` + 409, comments, CRUD, public demo on Vercel + Neon.

**Not in this build:** live WebSockets, file uploads, email.
