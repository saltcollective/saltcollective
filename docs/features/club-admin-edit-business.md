# Club Admin - Edit / Remove a Business

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Club Admin](club-admin.md)

---

## Summary

Club Admins can edit the details of any business on their hub, change its sponsor tier, or remove it entirely. This keeps the hub accurate as sponsorship relationships change over time.

## Problem Statement

Sponsorship relationships are not static. Businesses change their details, move up or down tiers, or end their involvement with the club. Without the ability to edit or remove businesses, the hub becomes stale and loses credibility.

## Goals

- Allow Club Admins to keep business details accurate with minimal effort
- Allow businesses to be removed cleanly when their sponsorship ends
- Allow tier changes to be reflected immediately on the hub

## Non-Goals

- Removed businesses are not publicly visible in any archived or historical state
- This flow does not notify the business of any changes made to their listing

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Edit a business's details | I can keep the hub accurate when something changes |
| Club Admin | Change a business's sponsor tier | I can reflect a change in their level of support |
| Club Admin | Remove a business from the hub | I can cleanly end their listing when their sponsorship ends |

## Functional Requirements

1. A Club Admin can edit any field on an existing business, including all fields available at the point of creation
2. A Club Admin can change the sponsor tier of a business at any time
3. A Club Admin can remove a business from the hub
4. Changes to a business are reflected on the published hub immediately
5. Removing a business removes it from the hub immediately and permanently

## Acceptance Criteria

- [ ] All business fields are editable after creation
- [ ] Sponsor tier can be changed and is reflected immediately on the hub
- [ ] A removed business no longer appears on the hub
- [ ] Removal requires a confirmation step to prevent accidental deletion

## Open Questions

| Question | Answer |
|----------|--------|
| Is removal permanent, or can a business be deactivated and reactivated instead? | |
| Are click tracking records for a removed business retained or deleted? | |
