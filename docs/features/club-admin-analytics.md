# Club Admin - View Analytics

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Club Admin](club-admin.md)

---

## Summary

Club Admins can view click data for their hub, broken down by business. This gives them the information they need to demonstrate value to their business supporters and have informed conversations about continued sponsorship.

## Problem Statement

Without visibility into engagement data, Club Admins have no way to show businesses that their presence on the hub is generating real interest. This makes it harder to retain sponsors and justify the club's investment in the platform.

## Goals

- Surface click data per business in a format that is easy for a Club Admin to understand and share
- Give Club Admins enough information to have a meaningful conversation with each business about their engagement

## Non-Goals

- This feature does not provide real-time analytics - a reasonable data lag is acceptable
- This feature does not send automated reports to businesses - sharing is manual, initiated by the Club Admin
- Deep analytics (funnels, cohorts, demographics) are out of scope

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | See how many clicks each business has received | I can identify which businesses are getting engagement and which are not |
| Club Admin | See a breakdown of click type (email, website, phone) per business | I can give businesses a meaningful summary of how people are interacting with their card |
| Club Admin | Filter or view data by time period | I can show a business what engagement looks like over the current season |

## Functional Requirements

1. The analytics view shows a per-business summary of click counts
2. Click counts are broken down by type: email, website, and phone
3. Data can be filtered by a time period (at minimum: all time, last 30 days, last 90 days)
4. The view is scoped to the Club Admin's own hub - no cross-club data is visible

## Acceptance Criteria

- [ ] Each business on the hub has a visible click count in the analytics view
- [ ] Clicks are broken down by type per business
- [ ] A time period filter is available
- [ ] No data from other clubs is visible

## Open Questions

| Question | Answer |
|----------|--------|
| Is there a way to export or share analytics data for a specific business? | |
| Should zero-click businesses still appear in the analytics view? | |
| What time periods are available in the filter? | |
