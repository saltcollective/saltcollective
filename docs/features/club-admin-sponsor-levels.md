# Club Admin - Add / Edit / Delete Sponsor Levels

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Club Admin](club-admin.md)

---

## Summary

Club Admins can define their own sponsor tier structure - creating, renaming, reordering, and deleting tiers. The hub reflects this structure when displaying businesses.

## Problem Statement

Every club has a different way of categorising their sponsors. Imposing a fixed tier structure would not fit most clubs' existing relationships. Clubs need to define tiers that match what they have actually promised their businesses.

## Goals

- Allow clubs to define a tier structure that reflects their real sponsorship arrangements
- Allow tiers to be reordered so the hub ordering is always correct
- Prevent tiers from being deleted while businesses are still assigned to them

## Non-Goals

- Tiers have no prescribed meaning or value assigned by Salt Collective - naming and significance is entirely up to the club
- This feature does not handle what is offered to businesses at each tier - that is a club-level concern outside the platform

## Default Tiers

Every new club is seeded with 8 default tiers at creation time ("Level 1" through "Level 8", ordered 1–8). These are standard `SponsorTier` records scoped to the club — fully editable, renameable, and deletable from the moment the club is created. There is no platform-level template model; the defaults are an application-layer constant applied once at club creation.

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Create a new sponsor tier with a name | I can categorise businesses according to my club's sponsorship structure |
| Club Admin | Rename an existing tier | I can update the tier name if our sponsorship language changes |
| Club Admin | Set a dollar value on a tier | I can record and display what each sponsorship level costs |
| Club Admin | Reorder tiers | I can control which tier appears highest on the hub |
| Club Admin | Delete a tier that is no longer in use | I can keep the tier list clean |

## Functional Requirements

1. A Club Admin can create a new tier with a name and an optional dollar value
2. A Club Admin can rename any existing tier and update its dollar value
3. Tiers can be reordered, and the hub ordering updates to match
4. A tier cannot be deleted while any active business is assigned to it
5. There is no platform-imposed limit on the number of tiers a club can create
6. New clubs are seeded with 8 default tiers ("Level 1" – "Level 8") at creation

## Acceptance Criteria

- [ ] A Club Admin can create, rename, and reorder tiers
- [ ] A Club Admin can set and update a dollar value on a tier
- [ ] Tier order on the hub matches the order set in admin
- [ ] Deleting a tier with active businesses assigned is blocked, with a clear explanation
- [ ] Deleting an empty tier removes it immediately
- [ ] New clubs start with 8 pre-populated tiers that are immediately editable

## Open Questions

| Question | Answer |
|----------|--------|
| Is there a minimum number of tiers required before the hub can be published? | |
| When a tier is renamed, does the new name appear immediately on the hub? | |
| When a tier is removed, what happens to sponsors subscribed to that tier? | |
| Is the dollar value displayed publicly on the hub, or only visible in admin? | |
