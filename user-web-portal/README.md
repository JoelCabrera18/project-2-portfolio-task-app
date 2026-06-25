# Task App — Frontend (User Web Portal)

Angular 21 single-page application for the Task App collaborative project management platform.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.2 | Web framework |
| TypeScript | 5.9 | Language |
| Tailwind CSS | 4.3 | Utility-first CSS framework |
| Angular CDK | 21.2 | Drag & drop, overlays |
| Angular Signals | — | State management |
| RxJS | 7.8 | HTTP, async state |
| Vitest | 4.x | Unit testing |
| PostCSS | 8.x | CSS processing |

## Architecture

The application uses **standalone components** (no NgModules), **lazy-loaded routes**, and **Signal-first reactivity**.

### Feature Modules (lazy-loaded)

| Module | Route | Description |
|--------|-------|-------------|
| **Auth** | `/auth` | Login, signup, Google OAuth callback, password reset |
| **Workspace** | `/workspace` | Workspace list, Kanban board, members, labels, settings |
| **Profile** | `/profile` | Profile page, app settings (theme, language, notifications) |
| **Invite** | `/invite/:code` | Public invitation acceptance page |

### State Management

- **Angular Signals**: Auth state, workspace list, profile, settings, notifications, language
- **RxJS BehaviorSubject**: Active workspace, selected task (in `WorkspaceStateService`)
- **HTTP Interceptors**: JWT attachment, 401 handling with token refresh

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (backend must be running on :3000)
npm start

# App: http://localhost:4200
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server at `localhost:4200` |
| `npm run build` | Production build to `dist/` |
| `npm run watch` | Dev build with watch mode |
| `npm test` | Run unit tests (Vitest) |

## Environment

Configured in `src/environments/environment.ts`:
- `apiUrl`: `http://localhost:3000/api/v1`
- `appName`: `Task App`

## Features

### Authentication
- Login with email/password
- Registration with profile data
- Google OAuth (one-click login)
- Password reset (3-step wizard)
- JWT auto-refresh interceptor

### Workspace Management
- Create, edit, delete workspaces
- Member management (add, remove, roles)
- Invitation system (send by email, accept/reject)
- Audit history of all actions

### Kanban Board
- Drag & drop tasks between columns
- Drag & drop to reorder within columns
- Cross-column drag support
- Optimistic UI updates

### Task Management
- Create, edit, delete tasks
- Labels (create per workspace, assign to tasks)
- Assignees (assign workspace members)
- File attachments (upload/download with progress)
- Comments with @mentions and threaded replies
- Due dates with range validation

### User Profile
- Edit name, bio, contact info
- Change password
- Upload profile photo (JPEG/PNG/WebP/GIF, max 5MB)
- App settings (theme, language, notifications)

### UI/UX
- Dark/Light theme (persisted per user)
- Spanish/English i18n (runtime, reactive)
- Responsive design (mobile + desktop)
- Toast notifications with i18n support
- Loading states with spinners

## Authentication Flow

```
User submits credentials
  → AuthService.login()
    → POST /api/v1/auth/login
      → Returns { token, refreshToken, user }
        → StorageService saves to localStorage
          → loadProfile() fetches user + settings
            → Signals populated → UI updates
              → effect() applies theme & language
```

### Google OAuth Flow
```
User clicks "Sign in with Google"
  → Redirect to backend /api/v1/auth/google
    → Google consent screen → callback
      → Redirect to /auth/callback?token=JWT
        → handleGoogleCallback() parses token
          → loadProfile() → redirect to /workspace
```

### JWT Interceptor Chain
1. **JWT Interceptor**: Attaches `Authorization: Bearer <token>` to all requests
2. **Auth Error Interceptor**: Catches 401, queues concurrent requests, refreshes token, retries

## Internationalization

- Runtime JSON-based system (not Angular AOT i18n)
- `translate` pipe for templates: `{{ 'key' | translate }}`
- `TranslationService.translate()` for TypeScript
- Supports parameter interpolation: `{{param}}`
- Reactive: language switch updates all visible text immediately
- Files: `public/i18n/en.json`, `public/i18n/es.json`

## Project Structure

```
src/app/
├── app.ts                        # Root component
├── app.config.ts                 # App providers
├── app.routes.ts                 # Root routes
│
├── auth/                         # Authentication module
│   ├── pages/login/              # Login page
│   ├── pages/signup/             # Signup page
│   ├── pages/forgot-password/    # Password reset wizard
│   ├── pages/google-callback/    # OAuth callback handler
│   ├── services/auth.service.ts  # Auth state & API calls
│   └── interceptors/             # JWT & 401 interceptors
│
├── workspace/                    # Workspace module
│   ├── pages/workspace-list/     # Workspace grid
│   ├── pages/workspace-detail/   # Workspace with nested pages
│   │   └── pages/board/          # Kanban board (drag & drop)
│   │   ├── pages/members/        # Member management
│   │   ├── pages/labels/         # Label management
│   │   └── pages/settings/       # Workspace settings
│   ├── components/               # Reusable components
│   │   ├── task/                 # Task card
│   │   ├── task-list/            # Kanban column
│   │   ├── task-detail/          # Task detail modal
│   │   ├── task-form/            # Create/edit task
│   │   ├── task-comment-card/    # Comment display
│   │   ├── task-attachment-card/ # Attachment display
│   │   ├── assignee-picker/      # Member selector
│   │   ├── workspace-card/       # Workspace card
│   │   └── workspace-form/       # Create/edit workspace
│   └── services/                 # Workspace services
│
├── profile/                      # Profile module
│   ├── pages/profile-page/       # Profile edit + photo upload
│   ├── pages/settings-page/      # App settings
│   └── services/profile.service.ts
│
└── shared/                       # Shared module
    ├── components/               # Top-bar, side-bar, modal, notification
    ├── services/                 # Translation, storage, notification, invitation
    ├── guards/                   # AuthGuard, PublicGuard
    ├── pipes/                    # TranslatePipe
    ├── pages/                    # Not-found, Invite
    └── validators/               # Date range validator
```
