# Site Admin - Analytics Overview

**Status:** Draft
**Last updated:** 2026-04-18
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Site Admin](site-admin.md)

---

## Summary

Analytics Overview gives the Site Admin a high-level view of platform activity: active clubs, hub traffic, and business click volume. It is a health dashboard, not a deep analytics tool.

## Problem Statement

Without any platform-level visibility, the operator has no way to gauge whether the product is being used, which clubs are most active, or whether traffic is trending in the right direction - short of querying the database directly.

## Goals

- Give the operator a quick read on platform health and usage trends
- Surface enough data to identify inactive clubs or outlier behaviour

## Non-Goals

- Analytics Overview is not a per-club analytics tool - that belongs in [Club Admin - Analytics](club-admin-analytics.md)
- This feature does not provide exportable reports or raw data access

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Site Admin | See total active clubs and recent sign-up trend | I can track platform growth at a glance |
| Site Admin | See aggregate hub visits and business click volume | I can assess whether the product is generating value |
| Site Admin | Identify clubs with no recent activity | I can follow up with clubs that may be struggling or churning |

## Functional Requirements

1. The analytics overview shows platform-level totals: active clubs, published hubs, total businesses listed, total hub visits (last 30 days), total business clicks (last 30 days)
2. A list of clubs sorted by last activity date is available, to surface inactive accounts
3. All figures are aggregated and do not expose individual visitor data

## Acceptance Criteria

- [ ] Platform totals (clubs, hubs, businesses, visits, clicks) are visible for the last 30 days
- [ ] Clubs can be sorted or filtered by last activity date
- [ ] No individual visitor data is exposed

## Open Questions

| Question | Answer |
|----------|--------|
| Should trend charts be included, or is a headline number sufficient at this stage? | |
| What counts as "last activity" for a club - admin login, hub visit, or business click? | |
