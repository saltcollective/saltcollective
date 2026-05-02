# Click Event Data Model

---

## ClickEvent

An immutable record of a single tracked interaction on a business card. Written on click, never updated. No visitor identity is captured.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `businessId` | `String` | FK → `Business.id` |
| `clubId` | `String` | FK → `Club.id`. Denormalised from the business for fast analytics queries |
| `type` | `ClickType` | The interaction that was tracked |
| `createdAt` | `DateTime` | The timestamp of the click |

### ClickType enum

| Value | Trigger |
|---|---|
| `EMAIL` | Hub Visitor clicks the business email address |
| `WEBSITE` | Hub Visitor clicks the business website URL |
| `PHONE` | Hub Visitor clicks the business phone number |

### Notes

- No `updatedAt` — click events are write-once and never modified
- `clubId` is stored directly rather than derived via a join to keep analytics queries simple and fast
- No personally identifiable information about the visitor is recorded
- A failed write must not block the link navigation — fire-and-forget at the application layer
