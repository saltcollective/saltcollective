# Site Admin

**Status:** Draft
**Last updated:** 2026-04-18
**Owner:** Liam Egan
**Approver:** Liam's sister

---

## Summary

Site Admin is the operator-facing interface for Salt Collective staff. It provides the tools needed to manage clubs, users, and subscriptions across the platform, and to provide hands-on support without requiring direct database access.

## Problem Statement

As the platform operator, we need to onboard clubs, resolve issues on their behalf, and maintain visibility over platform health and subscription status on an ongoing basis. Without a dedicated admin interface, every support task requires engineering effort.

## Goals

- Give the operator full visibility over clubs and their status
- Enable common support tasks (account fixes, impersonation, billing checks) without engineering involvement
- Surface enough platform data to diagnose issues quickly

## Non-Goals

- Site Admin is not a substitute for Stripe - billing management stays in Stripe; only relevant status is surfaced here
- Site Admin does not expose raw database access or developer tooling
- Site Admin does not handle club-to-business financial relationships (out of scope per DECISIONS.md #4)

## Child Features

| Feature                                          | Priority | Status  |
| ------------------------------------------------ | -------- | ------- |
| [Club management](site-admin-club-management.md) | Must     | Backlog |
| [User management](site-admin-user-management.md) | Should   | Backlog |
| [Billing](site-admin-billing.md)                 | Could    | Backlog |
| [Analytics overview](site-admin-analytics.md)    | Could    | Backlog |
| [Impersonate user](site-admin-impersonate.md)    | Could    | Backlog |

## User Stories

| As a...    | I want to...                                                        | So that...                                                   |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Site Admin | See all clubs and their current status at a glance                  | I can monitor platform health and spot problems quickly      |
| Site Admin | Take action on a club or user account without touching the database | I can resolve support issues without engineering involvement |

## Acceptance Criteria

- [ ] All site admin features are accessible from a single authenticated area, separate from Club Admin
- [ ] Site Admin access is restricted to operator accounts only

## Open Questions

| Question | Answer |
| -------- | ------ |
