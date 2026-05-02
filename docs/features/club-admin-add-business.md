# Club Admin - Add a Business

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Club Admin](club-admin.md)

---

## Summary

The add business flow allows a Club Admin to add a new business to their hub. It collects all the details needed to populate a business card and assigns the business a sponsor tier.

## Problem Statement

The hub is only useful if it has businesses in it. Club Admins need a quick, straightforward way to add businesses as they sign up new sponsors, ideally without needing to be at a desk.

## Goals

- Make adding a business fast and completable on a mobile device
- Collect all fields needed to produce a complete business card in one flow
- Assign the business to a sponsor tier at the point of creation

## Non-Goals

- This flow does not send any notification or invite to the business being added
- Businesses cannot self-submit for inclusion - the Club Admin always initiates

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Add a new business to my hub quickly | I can keep the hub up to date as I sign up new sponsors |
| Club Admin | Set a sponsor tier when adding a business | The business appears in the right place on the hub from the start |

## Functional Requirements

1. The Club Admin can initiate adding a new business from the admin area
2. The flow collects the following fields:
   - Business name (required)
   - Business description (required)
   - Sponsor tier (required - selected from the club's configured tiers)
   - Business logo (optional)
   - Phone number (optional)
   - Email address (optional)
   - Website URL (optional)
3. At least one contact field (phone, email, or website) must be provided
4. On completion, the business is added to the hub in an active state and appears on the hub immediately if the hub is published

## Acceptance Criteria

- [ ] A Club Admin can add a new business from the admin area
- [ ] All six fields are presented in the form
- [ ] Business name, description, and sponsor tier are required
- [ ] At least one contact field is required
- [ ] The new business appears on the published hub immediately after being added
- [ ] The business is assigned to the selected sponsor tier and ordered accordingly

## Open Questions

| Question | Answer |
|----------|--------|
| Should a business be added in an active or inactive state by default? | |
| Is there any duplicate detection if the same business name is added twice? | |
