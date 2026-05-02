# Site Admin - Club Management

**Status:** Draft
**Last updated:** 2026-04-18
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Site Admin](site-admin.md)

---

## Summary

Club Management gives the Site Admin a full view of every club on the platform, with the ability to create, edit, suspend, or delete club accounts and their associated hubs.

## Problem Statement

The operator needs to onboard new clubs, investigate issues, and occasionally take corrective action on a club account. Without a management interface, all of these tasks require direct database access.

## Goals

- Provide a clear list of all clubs with key status information
- Allow the operator to create and configure a club on behalf of a new customer
- Enable corrective actions (suspend, delete, edit) without engineering involvement

## Non-Goals

- Club Management does not replace the Club Admin interface - it is an operator override, not a parallel admin
- Club Management does not handle billing directly

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Site Admin | View all clubs with their name, status, and subscription state | I can monitor the platform at a glance |
| Site Admin | Create a new club account manually | I can onboard a club that needs hands-on setup assistance |
| Site Admin | Edit a club's details | I can correct mistakes without asking the club admin to do it |
| Site Admin | Suspend or delete a club | I can act on non-payment, abuse, or a club closing down |

## Functional Requirements

1. A paginated, searchable list of all clubs is available to the Site Admin
2. Each row shows: club name, hub published status, subscription status, and date joined
3. The Site Admin can create a new club, which generates a Club Admin account and an unpublished hub
4. The Site Admin can edit any club's name, logo, and primary colour
5. The Site Admin can suspend a club (hub taken offline, admin login blocked) and reinstate it
6. The Site Admin can delete a club (permanent, requires confirmation)

## Acceptance Criteria

- [ ] All clubs are listed with name, hub status, subscription status, and join date
- [ ] Club list is searchable by name
- [ ] Site Admin can create a club and its associated admin account
- [ ] Site Admin can edit a club's core details
- [ ] Site Admin can suspend and reinstate a club
- [ ] Deleting a club requires explicit confirmation and is irreversible

## Open Questions

| Question | Answer |
|----------|--------|
| When a club is suspended, does the hub return a 404 or a "temporarily unavailable" page? | |
| Should the Site Admin be able to trigger the first-run setup on behalf of a club? | |