# Club Data Model

---

## Club

A club is the top-level organisational unit. Each club gets one hub. Created on first-run setup completion; starts in an unpublished state.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | Club display name |
| `slug` | `String` | Unique. Auto-generated from name. Used in the hosted hub URL |
| `tagline` | `String?` | Optional short description displayed on the hub |
| `logoUrl` | `String?` | URL of uploaded club logo |
| `primaryColour` | `String?` | Hex. Applied to primary UI elements on the hub |
| `secondaryColour` | `String?` | Hex. Applied to secondary UI elements |
| `headingColour` | `String?` | Hex. Applied to headings |
| `status` | `ClubStatus` | Default: `ACTIVE` |
| `publishedAt` | `DateTime?` | Null = unpublished. Set when the club deliberately publishes their hub |
| `stripeCustomerId` | `String?` | Unique. Stripe customer ID — used to look up billing state without duplicating it |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

### ClubStatus enum

| Value | Description |
|---|---|
| `ACTIVE` | Normal operating state |
| `SUSPENDED` | Hub taken offline and admin login blocked by Site Admin. Reversible |

Deletion is a hard delete at the application layer — the BRD treats it as permanent and irreversible.

### Notes

- `publishedAt` stores the publish timestamp rather than a bare boolean, giving publish date for free without an extra column
- Colour fields are all optional — the hub renders with defaults if not set
- `stripeCustomerId` is the only billing data stored here; all other subscription state (status, plan, renewal date) is read live from Stripe
