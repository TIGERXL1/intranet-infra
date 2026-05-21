# Intranet Infrastructure

SvelteKit application used as a small infrastructure portal for the project lab.

It provides authenticated access to service shortcuts, service health checks, audit logs,
and remote service log collection.

## Features

- Local authentication with Argon2 password hashing.
- Role-based access with administrator-only pages.
- Session handling with secure HTTP-only cookies.
- Account administration: create users, enable/disable users, reset passwords.
- User profile page.
- Dashboard with monitored service status and recent activity.
- Service catalog for infrastructure components.
- Health checks for DNS, LDAP, and Nextcloud.
- SSH-based log collection for DNS, LDAP, Nextcloud, and Proxmox.
- Audit log for authentication and account actions.

## Tech Stack

- SvelteKit
- Svelte 5
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Node adapter for deployment

## Requirements

- Node.js 24 or compatible with the versions declared in `package.json`
- npm
- PostgreSQL
- Network access from the intranet server to the monitored services
- SSH access to machines used for remote log collection

## Quick Start

Install dependencies:

```sh
npm install
```

Create a local environment file:

```sh
cp .env.example .env
```

Edit `.env` with the correct database URL, service hosts, and SSH key path.

Run database migrations:

```sh
npm run db:migrate
```

Seed the default monitored services:

```sh
npm run db:seed-services
```

Create the first administrator account:

```sh
npm run db:create-admin -- admin 'ChangeMeWithAStrongPassword!'
```

Start the development server:

```sh
npm run dev
```

The application is available at the URL printed by Vite, usually:

```text
http://localhost:5173
```

## Environment Variables

Main variables:

| Variable                       | Purpose                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL connection string used by the app and Drizzle.                    |
| `NODE_ENV`                     | Runtime environment, usually `development` or `production`.                  |
| `DNS_HOST`                     | DNS server host used by the DNS checker and service seed.                    |
| `DNS_PORT`                     | DNS port, usually `53`.                                                      |
| `DNS_PROBE_DOMAIN`             | Domain queried by the DNS checker.                                           |
| `LDAP_HOST`                    | LDAP server host used by the LDAP checker and service seed.                  |
| `LDAP_PORT`                    | LDAP port, usually `389`.                                                    |
| `NEXTCLOUD_URL`                | Nextcloud URL used by the health checker and service seed.                   |
| `NEXTCLOUD_TLS_VERIFY`         | Whether to verify the Nextcloud TLS certificate.                             |
| `NEXTCLOUD_LOG_HOST`           | SSH host used for Nextcloud log collection when different from the URL host. |
| `PROXMOX_URL`                  | Proxmox URL used for project service references.                             |
| `PROXMOX_LOG_HOST`             | SSH host used for Proxmox journal collection.                                |
| `PROXMOX_TLS_VERIFY`           | Whether to verify the Proxmox TLS certificate.                               |
| `CHECK_INTERVAL_SECONDS`       | Health-check scheduler interval.                                             |
| `LOG_COLLECT_INTERVAL_SECONDS` | Remote log collection interval.                                              |
| `SSH_LOG_USER`                 | SSH user used to read logs on remote machines.                               |
| `SSH_KEY_PATH`                 | Private key path used by the intranet server for SSH collection.             |
| `SSH_LOG_LINES`                | Number of recent log lines read per collection cycle.                        |

Service-specific log hosts can also be overridden with:

```text
LOG_HOST_<SERVICE_ID>_<CHECK_TYPE>
```

Example:

```text
LOG_HOST_SRV_NEXTCLOUD_NEXTCLOUD=192.168.10.20
```

## Database

The schema is defined in:

```text
src/lib/server/db/schema.ts
```

Drizzle migrations are stored in:

```text
drizzle/
```

Useful commands:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed-services
npm run db:create-admin -- <username> <password>
```

## Application Routes

| Route        | Description                         |
| ------------ | ----------------------------------- |
| `/login`     | Login page.                         |
| `/dashboard` | Main infrastructure dashboard.      |
| `/services`  | Service catalog and shortcuts.      |
| `/status`    | Health-check status page.           |
| `/logs`      | Audit and service logs, admin only. |
| `/admin`     | User administration, admin only.    |
| `/profile`   | Current user profile.               |

## Service Checks

The scheduler starts when the SvelteKit server boots.

It periodically checks active services from the `services` table and writes results to
`service_checks`.

Supported check types:

- `dns`
- `ldap`
- `nextcloud`

Proxmox is currently collected through service logs, not displayed as a regular service
health check.

## Remote Log Collection

The same scheduler also collects service logs over SSH and stores normalized entries in
`service_logs`.

Collected sources:

- DNS: `/var/log/syslog`, filtered for `named` or `bind9`.
- LDAP: `/var/log/syslog`, filtered for `slapd`.
- Nextcloud: Nginx `error.log` and HTTP errors from `access.log`.
- Proxmox: `journalctl` for `pvedaemon`, `pveproxy`, `pvestatd`, `pve-cluster`, and `corosync`.

The SSH user defaults to:

```text
intranet-monitor
```

The private key path is configured with:

```text
SSH_KEY_PATH
```

The remote machines must allow this user to read the relevant logs. For Proxmox,
`journalctl` is executed through passwordless sudo for that specific command.

## Security Notes

- Passwords are hashed with Argon2.
- Sessions expire after 8 hours.
- Failed logins are rate-limited by IP.
- User accounts are locked after repeated failed attempts.
- Audit events are written for login and account-management actions.
- Admin pages are protected server-side.

## Development Commands

```sh
npm run dev
npm run check
npm run lint
npm run format
npm run build
npm run preview
```

Before pushing a release candidate, run:

```sh
npm run check
npm run lint
npm run build
```

## Project Structure

```text
src/routes/                  SvelteKit pages and server actions
src/routes/(app)/            Authenticated application routes
src/lib/server/auth.ts       Authentication and session helpers
src/lib/server/audit.ts      Audit log writer
src/lib/server/scheduler.ts  Health-check and log-collection scheduler
src/lib/server/checkers/     DNS, LDAP, and Nextcloud checkers
src/lib/server/log-parsers/  Log normalization helpers
src/lib/server/db/           Drizzle database setup and schema
scripts/                     Database seed and admin-user utilities
drizzle/                     Database migrations
```

## Production Build

Build the application:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

The project uses `@sveltejs/adapter-node`, so production deployment should run the generated
Node server with the required environment variables available.
