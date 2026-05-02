# Sponsor Tier Data Model

---

## SponsorTier

A sponsor tier belongs to a club and defines one level in that club's sponsorship structure. Tiers are ordered explicitly — the `order` field controls how they are ranked on the hub (lower number = higher rank).

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `clubId` | `String` | FK → `Club.id` |
| `name` | `String` | Display name (e.g. "Gold", "Silver") |
| `order` | `Int` | Rank within the club's tier list. Lower = higher on hub |
| `price` | `Decimal?` | Optional dollar value for the tier. Stored as `DECIMAL(10,2)` |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

Unique constraint on `[clubId, order]` — no two tiers in the same club can share a rank.

### Default tiers

Every new club is seeded with 8 tiers at creation time — "Level 1" through "Level 8" with orders 1–8. These are standard `SponsorTier` rows scoped to the club, editable and deletable from day one. The defaults are an application-layer constant; there is no separate template model.

### Notes

- Tier visibility on the hub is derived, not stored — a tier is only shown if it has at least one active business assigned to it
- A tier cannot be deleted while any active business is assigned to it (enforced at the application layer)
- `price` is optional; tiers without a value set simply display without a price
