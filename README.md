# Task App

A collaborative task management application inspired by Trello. Built with a NestJS backend API and an Angular frontend SPA.

## Architecture

```text
┌───────────────────────────────────────────────────────┐
│                     Frontend (Angular 21)             │
│  localhost:4200                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Auth Module   │  Workspace Module  │  Profile   │ │
│  │  (login/       │  (board, members,  │  (settings,│ │
│  │   signup,      │   labels, tasks,   │   photo)   │ │
│  │   Google OAuth)│   comments)        │            │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────┘
                            │ HTTP (JWT)
                            ▼
┌──────────────────────────────────────────────────────┐
│                    Backend (NestJS 11)               │
│  localhost:3000/api/v1                               │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Auth  │ Profile │ Workspace │ Task │ Comment    │ │
│  │ JWT + │ Photo   │ Members   │ List │ Attachment │ │
│  │ Google│ upload  │ Boards    │      │ Labels     │ │
│  │ OAuth │         │ History   │      │            │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │ TypeORM
                       ▼
              ┌────────────────┐
              │   PostgreSQL   │
              └────────────────┘
```

## Tech Stack

### Backend

| Technology                    | Purpose                    |
| ----------------------------- | -------------------------- |
| NestJS 11                     | Web framework              |
| TypeORM                       | ORM / Data layer           |
| PostgreSQL 16                 | Database                   |
| Passport (JWT + Google OAuth) | Authentication             |
| Helmet                        | Security headers           |
| Swagger / OpenAPI             | API documentation          |
| Nodemailer                    | Email sending              |
| Docker Compose                | Local PostgreSQL + pgAdmin |

### Frontend

| Technology      | Purpose               |
| --------------- | --------------------- |
| Angular 21      | Web framework         |
| TypeScript 5.9  | Language              |
| Tailwind CSS 4  | Styling               |
| Angular CDK     | Drag & drop, overlays |
| Angular Signals | State management      |
| RxJS            | HTTP, async state     |

## Repository Structure

```
task-app/
├── backend/                  # NestJS API (REST)
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── profile/          # User profile module
│   │   ├── workspace/        # Workspace module
│   │   ├── task/             # Task module
│   │   ├── task-list/        # Kanban columns module
│   │   ├── label/            # Labels module
│   │   ├── comment/          # Comments module
│   │   ├── attachment/       # File attachments module
│   │   ├── workspace-invitation/ # Invitations module
│   │   └── common/           # Shared utilities
│   ├── docker-compose.yaml   # PostgreSQL + pgAdmin
│   └── uploads/              # Uploaded files
│
├── user-web-portal/          # Angular SPA
│   ├── src/app/
│   │   ├── auth/             # Auth pages & services
│   │   ├── workspace/        # Workspace pages & components
│   │   ├── profile/          # Profile & settings
│   │   └── shared/           # Shared components & services
│   └── public/
│       ├── i18n/             # Translation files
│       │   ├── en.json
│       │   └── es.json
│       └── login-art.png
│
├── docs/                     # Additional documentation
└── README.md
```

## Quick Start (Local Development)

### Prerequisites

- Node.js >= 20
- Docker Desktop (for PostgreSQL)
- npm

### 1. Start Database

```bash
cd backend
docker compose up -d
```

### 2. Start Backend

```bash
cd backend
npm install
# Create .env file (see backend/README.md for variables)
npm run start:dev
# API at http://localhost:3000/api/v1
# Swagger at http://localhost:3000/api/docs
```

### 3. Start Frontend

```bash
cd user-web-portal
npm install
npm start
# App at http://localhost:4200
```

## Documentation

- [Backend README](./backend/README.md) — API, architecture, environment variables
- [Frontend README](./user-web-portal/README.md) — Components, services, state management
