# Site Admin - User Management

**Status:** Draft
**Last updated:** 2026-04-18
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Site Admin](site-admin.md)

---

## Summary

User Management gives the Site Admin visibility over all user accounts on the platform, with the ability to edit account details, reset credentials, and deactivate users where necessary.

## Problem Statement

Club Admins occasionally lock themselves out, use the wrong email address, or need their account transferred to a new person. These are common support requests that should not require a developer to resolve.

## Goals

- Allow the operator to look up any user account quickly
- Handle common account support tasks (email change, password reset, deactivation) without engineering involvement

## Non-Goals

- User Management does not manage club-level permissions or roles - those belong in Club Management
- User Management does not provide a full audit log of user actions (that is a platform-level concern)

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Site Admin | Search for a user by name or email | I can locate an account quickly when a club contacts support |
| Site Admin | Edit a user's email address or name | I can correct mistakes or transfer an account to a new person |
| Site Admin | Trigger a password reset for a user | I can unblock a locked-out Club Admin without sharing credentials |
| Site Admin | Deactivate a user account | I can remove access when someone leaves a club |

## Functional Requirements

1. A searchable list of all user accounts is available to the Site Admin
2. Each row shows: name, email, associated club, and account status
3. The Site Admin can edit a user's name and email address
4. The Site Admin can trigger a password reset email on behalf of a user
5. The Site Admin can deactivate a user account (blocks login without deleting data)
6. A deactivated account can be reactivated

## Acceptance Criteria

- [ ] User list is searchable by name and email
- [ ] Each user record shows name, email, club, and status
- [ ] Site Admin can edit name and email
- [ ] Site Admin can trigger a password reset email
- [ ] Site Admin can deactivate and reactivate a user account

## Open Questions

| Question | Answer |
|----------|--------|
| Can a user belong to more than one club? If so, deactivation needs to be scoped per club | |
| Is there a distinction between a Club Admin user and a Site Admin user at the data model level, or is it role-based? | |
