# Task App — Backend API

RESTful API built with NestJS 11 for the Task App collaborative project management platform.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11 | Web framework |
| TypeORM | 1.x | ORM / Data layer |
| PostgreSQL | 16 | Database |
| Passport (JWT) | — | JWT authentication |
| Passport (Google OAuth) | — | Google login |
| Helmet | 8.x | HTTP security headers |
| Swagger | 11.x | API documentation |
| Nodemailer | 8.x | Email notifications |
| Docker Compose | — | Local PostgreSQL + pgAdmin |
| Jest | 30.x | Unit testing |

## Architecture

The backend follows a **modular architecture** with the **Use Case / Command pattern**:

### Modules

| Module | Description |
|--------|-------------|
| **Auth** | Registration, login, JWT, Google OAuth, password reset, refresh tokens |
| **Profile** | User profile CRUD, settings, photo upload/serve |
| **Workspace** | Workspace CRUD, members, boards, audit history |
| **WorkspaceInvitation** | Send/accept/reject invitations |
| **TaskList** | Kanban columns within boards |
| **Task** | Task CRUD, assignees, labels, reordering |
| **Label** | Label management per workspace |
| **Attachment** | File upload/download for tasks |
| **Comment** | Comments with @mentions and threaded replies |

### Design Patterns

- **Use Case / Command Pattern**: Each business operation has an abstract class (contract) and concrete implementation, wired via DI
- **Adapter Pattern**: `HashService`/`BcryptService`, `UuidManager`/`UuidService` for swappable implementations
- **Repository Pattern**: TypeORM repositories injected into services
- **Interceptor/Filters**: JWT attachment, error handling, logging

## Database

PostgreSQL 16 with two schemas:

- **`auth`** — `UserProfile`, `Profile`, `RefreshToken`
- **`workspaces`** — `Workspace`, `WorkspaceMember`, `WorkspaceHistory`, `Board`, `TaskList`, `Task`, `TaskLabel`, `TaskAssignment`, `Label`, `Attachment`, `Comment`, `WorkspaceInvitation`

## Environment Variables

### System
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST_API` | `http://localhost:3000/api/v1` | API base URL |
| `HOST_FRONTEND` | `http://localhost:4200` | Frontend URL (CORS) |
| `APP_NAME` | `Task App` | Application name |
| `TRUST_PROXY` | `loopback` | Express trust proxy |

### Database
| Variable | Default | Description |
|----------|---------|-------------|
| `TORM_PG_HOST` | `localhost` | PostgreSQL host |
| `TORM_PG_DATABASE` | `clon_trello` | Database name |
| `TORM_PG_USER_DB` | `postgres` | Database user |
| `TORM_PG_PASSWORD_DB` | `postgres` | Database password |
| `TORM_PG_PORT` | `5434` | Database port |

### JWT
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRES_IN` | `8h` | Access token expiration |
| `REFRESH_TOKEN_EXPIRES_IN` | `30d` | Refresh token expiration |

### Email (Gmail SMTP)
| Variable | Default | Description |
|----------|---------|-------------|
| `MAILER_HOST` | `smtp.gmail.com` | SMTP server |
| `MAILER_PORT` | `465` | SMTP port |
| `MAILER_USER` | — | Gmail address |
| `MAILER_SECRET` | — | Gmail app password |

### Google OAuth
| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | — | Google Cloud Client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google Cloud Client Secret |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3000/api/v1/auth/google/callback` | OAuth callback |

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Create .env file (copy variables above)

# 4. Start development server
npm run start:dev

# API: http://localhost:3000/api/v1
# Swagger: http://localhost:3000/api/docs
# pgAdmin: http://localhost:8083
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile to `dist/` |
| `npm run start` | Start server |
| `npm run start:dev` | Watch mode (hot reload) |
| `npm run start:prod` | Run compiled version |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier format |
| `npm test` | Run unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:cov` | Tests with coverage |

## Authentication

The API supports two authentication methods:

### JWT (Password-based)
- `POST /auth/register` — Create account
- `POST /auth/login` — Login, returns JWT + refresh token
- `POST /auth/refresh` — Rotate refresh token
- `POST /auth/forgot-password` — Send reset code by email
- `POST /auth/verify-reset-code` — Verify code
- `POST /auth/reset-password` — Set new password

### Google OAuth
- `GET /auth/google` — Redirect to Google consent
- `GET /auth/google/callback` — Google callback, returns JWT

### Authorization
- **Workspace Role Guard**: `owner`, `member`, `viewer` roles per workspace
- `@WorkspaceRoles('owner', 'member')` decorator guards endpoints

## API Endpoints

| Module | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Auth | POST | `/auth/register` | No |
| Auth | POST | `/auth/login` | No |
| Auth | GET | `/auth/google` | No |
| Auth | POST | `/auth/refresh` | No |
| Profile | GET | `/profile/me` | JWT |
| Profile | PATCH | `/profile/me` | JWT |
| Profile | POST | `/profile/photo` | JWT |
| Profile | GET | `/profile/photo/:code` | No |
| Workspace | GET | `/workspace` | JWT |
| Workspace | POST | `/workspace` | JWT |
| Workspace | GET | `/workspace/:code` | JWT |
| Workspace | PATCH | `/workspace/:code` | Owner |
| Board | PATCH | `/workspace/:code/boards/:bc/star` | JWT |
| Task | POST | `/task` | Member |
| Task | GET | `/task/:id` | JWT |
| Task | PATCH | `/task/:id` | Member |
| Task | POST | `/task/reorder` | Member |
| Comment | GET | `/task/:code/comment` | JWT |
| Comment | POST | `/task/:code/comment` | Member |
| Label | GET | `/label/workspace/:code` | JWT |
| Label | POST | `/label` | Member |

## Project Structure

```
src/
├── main.ts                        # Bootstrap
├── app.module.ts                  # Root module
├── auth/                          # Authentication
├── profile/                       # User profile
├── workspace/                     # Workspace & boards
├── workspace-invitation/          # Invitations
├── task-list/                     # Kanban columns
├── task/                          # Tasks
├── label/                         # Labels
├── attachment/                    # File attachments
├── comment/                       # Comments
└── common/                        # Shared
    ├── adapters/                  # Hash, UUID
    ├── classes/                   # Abstract interfaces
    ├── helpers/                   # Utilities
    └── responses/                 # API response DTOs
```
