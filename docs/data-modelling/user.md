# User Data Model

Models covering user accounts, platform roles, club membership, and operator audit trails.

---

## User

The core user record. Created on first sign-in via Clerk. `clerkId` is the stable auth anchor — all Clerk callbacks key off this.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `clerkId` | `String` | Unique. Clerk user ID — auth anchor |
| `username` | `String?` | Unique. Optional display handle |
| `email` | `String` | Unique |
| `userType` | `UserType` | Platform-level role. Default: `MEMBER` |
| `isActive` | `Boolean` | `false` blocks login. Default: `true` |
| `deactivatedAt` | `DateTime?` | Set when deactivated, cleared on reactivation |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

### UserType enum

Platform-level role. Club-scoped roles live on `ClubMembership`.

| Value | Description |
|---|---|
| `SITE_ADMIN` | Salt Collective operator. Full platform access |
| `MEMBER` | Default role on sign-up. No permissions until a `ClubMembership` is assigned |

---

## ClubMembership

Join table between `User` and `Club`. A user can belong to multiple clubs; a club can have multiple members. The `role` field carries the club-scoped permission level.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `userId` | `String` | FK → `User.id` |
| `clubId` | `String` | FK → `Club.id` |
| `role` | `ClubRole` | |
| `createdAt` | `DateTime` | |

Unique constraint on `[userId, clubId]` — one membership record per user per club.

### ClubRole enum

| Value | Description |
|---|---|
| `ADMIN` | Full club admin access — manage businesses, tiers, appearance, and hub settings |
| `EDITOR` | Write access to businesses; no access to hub settings or billing |

---

## ImpersonationLog

Audit record for every Site Admin impersonation session. Written on session start; `endedAt` updated when the operator exits.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `impersonatorId` | `String` | FK → `User.id` (the Site Admin) |
| `impersonatedId` | `String` | FK → `User.id` (the Club Admin being impersonated) |
| `startedAt` | `DateTime` | |
| `endedAt` | `DateTime?` | Null until the session is ended |
