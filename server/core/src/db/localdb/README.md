# BeGoodIt — Local Database Setup

This guide covers setting up the **local development** database using Docker and MySQL 9.0.

## Prerequisites

| Tool | Download | Purpose |
|---|---|---|
| **Docker Desktop** | https://www.docker.com/products/docker-desktop | Run MySQL in a container |
| **GUI of your choice** | MySQL Workbench, TablePlus, DBeaver, etc. | Query/manage data visually (optional) |

---

## 1. Configure environment

Create file `server/core/.env.development` with your local credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=begoodit_user
DB_PASSWORD=begoodit_password
DB_NAME=begoodit
NODE_ENV=development
```

> `.env.development` is in `.gitignore` and will never be committed.

---

## 2. Start local MySQL container

From `server/core/`:

```sh
npm run db:start
```

This runs `docker compose up -d` using [docker-compose.yml](./docker-compose.yml).

**What happens:**
- MySQL 9.0 container starts in the background
- Database `begoodit` is created
- User `begoodit_user` is set up with the password from `.env.development`
- Data is stored in a Docker volume (`mysql_data`) that persists across restarts

**Useful commands:**

| Command | What it does |
|---|---|
| `npm run db:logs` | Tail MySQL container logs |
| `npm run db:stop` | Stop the container (data persists) |
| `npm run db:drop` | Delete the container **and all data** |

---

## 3. Connect with a MySQL GUI *(optional)*

Open your GUI of choice (MySQL Workbench, TablePlus, DBeaver, etc.) and create a connection:

| Field | Value |
|---|---|
| Host | `127.0.0.1` or `localhost` |
| Port | `3306` |
| Username | `begoodit_user` |
| Password | *(from `.env.development`)* |
| Database | `begoodit` |

---

## 4. Run migrations & seeds

```sh
npm run migration:run
```

This applies all pending migrations from `src/db/migrations/` **and seeds**.

---

## Local migration commands

All these use `.env.development` by default:

| Command | Description |
|---|---|
| `npm run migration:run` | Apply all pending migrations + seeds |
| `npm run migration:generate -- src/db/migrations/MyName` | Generate a new migration from entity changes |
| `npm run migration:create -- src/db/migrations/MyName` | Create a blank migration file |
| `npm run migration:show` | List all migrations and their status |
| `npm run migration:revert` | Roll back the last applied migration |

---

## Production migrations

For **production** databases, use the `:prod` variants:

| Command | Description |
|---|---|
| `npm run migration:run:prod` | Apply migrations to production (uses `.env.production`) |
| `npm run migration:revert:prod` | Roll back last migration in production |
| `npm run migration:show:prod` | Check production migration status |

> ⚠️ **Never run `:prod` commands on your local database.**

---

## Common workflows

### Fresh setup (first time)

```sh
npm run db:start           # Start the container
npm run migration:run      # Create schema + seed data
```

### Reset local database (delete all data)

```sh
npm run db:drop            # Delete container & volume
npm run db:start           # Start fresh container
npm run migration:run      # Rebuild schema + seeds
```

### Restart without losing data

```sh
npm run db:stop            # Stop container (data persists)
npm run db:start           # Container resumes with existing data
```

### Add new migration

```sh
# Edit entities in server/core/entities/
npm run migration:generate -- src/db/migrations/AddNewColumn
npm run migration:run      # Apply the migration
```

---

## Troubleshooting

**Q: Port 3306 is already in use?**  
Change `DB_PORT` in `.env.development` and docker-compose will use that port.

**Q: Container won't start?**  
Check logs: `npm run db:logs`

**Q: Data persists even after `db:drop`?**  
The volume was deleted correctly. Run `npm run db:start` again and it will be fresh.

