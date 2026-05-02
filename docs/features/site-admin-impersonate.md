# Site Admin - Impersonate User

**Status:** Draft
**Last updated:** 2026-04-18
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Site Admin](site-admin.md)

---

## Summary

Impersonation allows the Site Admin to log in as any Club Admin user and experience the platform from their perspective. It is the most powerful support tool available and must be used carefully.

## Problem Statement

Diagnosing a Club Admin's issue often requires seeing exactly what they see. Without impersonation, the operator must rely on screenshots and descriptions, which slows down support significantly.

## Goals

- Allow the operator to view and interact with the platform as any Club Admin
- Make impersonation sessions clearly distinguishable from a normal admin session
- Provide a clean exit back to the Site Admin context

## Non-Goals

- Impersonation does not bypass any data access controls - the operator sees exactly what the impersonated user would see, nothing more
- Impersonation is not available to Club Admins - it is a Site Admin-only capability

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Site Admin | Enter an impersonation session as a specific Club Admin | I can see exactly what they see and reproduce reported issues |
| Site Admin | Know at all times that I am in an impersonation session | I do not accidentally make changes thinking I am in my own account |
| Site Admin | Exit the impersonation session and return to Site Admin | I can cleanly end the session without any ambiguity |

## Functional Requirements

1. The Site Admin can initiate an impersonation session from any user record in User Management
2. While impersonating, a persistent banner is displayed identifying the session as an impersonation and naming the user being impersonated
3. The Site Admin can end the session at any time via the banner, returning to Site Admin
4. Impersonation sessions are logged: who was impersonated, by whom, and when

## Acceptance Criteria

- [ ] Impersonation can be initiated from a user record in User Management
- [ ] A persistent banner is visible throughout the impersonation session
- [ ] The banner shows the impersonated user's name and a button to end the session
- [ ] Ending the session returns the operator to Site Admin
- [ ] Each impersonation session is recorded in an audit log

## Open Questions

| Question | Answer |
|----------|--------|
| Can actions taken during impersonation be distinguished from genuine Club Admin actions in audit logs? | |
| Should the Club Admin receive a notification when their account has been impersonated? | |
