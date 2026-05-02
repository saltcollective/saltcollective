# Hub - Business List

**Status:** Draft
**Last updated:** 2026-04-10
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Hub](hub.md)

---

## Summary

The business list is the main view of the hub. It renders all participating businesses for a club as a paginated, browsable list, ordered by sponsor tier.

## Problem Statement

Hub Visitors need a way to see all businesses supporting a club at a glance. Without a well-structured list, the hub has no usable entry point.

## Goals

- Display all active businesses for a club in a single, browsable view
- Order businesses consistently by sponsor tier
- Handle clubs with large numbers of businesses without degrading the experience

## Non-Goals

- The list does not filter or sort beyond sponsor tier ordering (search is a separate feature)
- The list does not show inactive or removed businesses
- The list does not expose any business management controls to Hub Visitors

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Hub Visitor | See all businesses supporting my club | I can browse and find ones I want to engage with |
| Hub Visitor | Navigate across multiple pages if the list is long | I am not overwhelmed by an endless scroll |

## Functional Requirements

1. The list displays all businesses with an active status on the club's hub
2. Businesses are grouped and ordered by sponsor tier, with higher tiers appearing first
3. Within a tier, ordering is undefined at this stage (e.g. alphabetical or manual)
4. The list paginates when the number of businesses exceeds a defined threshold
5. Each item in the list renders a business card (see [hub-business-card.md](hub-business-card.md))
6. If no businesses are active, the hub displays an appropriate empty state

## Acceptance Criteria

- [ ] All active businesses for the club are shown
- [ ] Businesses are ordered by sponsor tier, highest first
- [ ] Pagination is present when the business count exceeds the page threshold
- [ ] An empty state is shown when no businesses are active
- [ ] No business management controls are visible to Hub Visitors

## Open Questions

| Question | Answer |
|----------|--------|
| What is the pagination threshold? (e.g. 12, 24 per page) | |
| Within a tier, is ordering alphabetical or manually set by the club? | |

## Child Features

| Feature | Priority | Status |
|---------|----------|--------|
| [Search businesses](hub-search.md) | Must | Backlog |

## Notes

The list is purely a layout and ordering concern. The content of each item is defined in [hub-business-card.md](hub-business-card.md).
