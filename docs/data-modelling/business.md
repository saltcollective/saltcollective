# Business Data Model

Models covering businesses listed on a club's hub and their associated tags.

---

## Business

A business belongs to a club and appears on that club's hub. Created by a Club Admin; starts in an active state and appears on the hub immediately if the hub is published.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `clubId` | `String` | FK → `Club.id` |
| `sponsorTierId` | `String` | FK → `SponsorTier.id` |
| `name` | `String` | Required |
| `description` | `String` | Required |
| `logoUrl` | `String?` | URL of uploaded business logo |
| `phone` | `String?` | |
| `email` | `String?` | Click-tracked on the hub |
| `websiteUrl` | `String?` | Click-tracked on the hub |
| `isActive` | `Boolean` | Controls hub visibility. Default: `true` |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

At least one of `phone`, `email`, or `websiteUrl` must be provided — enforced at the application layer.

### Notes

- `isActive = false` removes the business from the hub without deleting the record, preserving click tracking history
- Fields that are not populated are not shown on the hub card (no empty placeholders)

---

## Tag

A tag belongs to a club and can be applied to any of that club's businesses. Tags are club-scoped — a tag from one club is never visible on another.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `clubId` | `String` | FK → `Club.id` |
| `name` | `String` | Display label |
| `createdAt` | `DateTime` | |

Unique constraint on `[clubId, name]` — no duplicate tag names within a club.

The `Business` ↔ `Tag` relation is many-to-many (a business can have multiple tags; a tag can apply to multiple businesses).
