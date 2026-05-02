# Site Admin - Billing

**Status:** Draft
**Last updated:** 2026-04-18
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Site Admin](site-admin.md)

---

## Summary

Billing gives the Site Admin a view of each club's subscription status as surfaced from Stripe. It is a read-only summary, not a parallel billing interface - detailed management stays in Stripe.

## Problem Statement

The operator needs to know at a glance which clubs are active, overdue, or cancelled without switching to Stripe for every check. A lightweight status surface reduces context-switching during support interactions.

## Goals

- Surface just enough billing information to support common operator queries (is this club on an active subscription?)
- Avoid duplicating Stripe functionality

## Non-Goals

- This feature does not process payments, issue refunds, or modify subscriptions - all of that remains in Stripe
- This feature does not build a billing dashboard for clubs (see [Club Admin - Billing](club-admin-billing.md))

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Site Admin | See the subscription status of any club | I can quickly confirm whether a club is active or has a billing issue |
| Site Admin | See the next renewal date and plan for a club | I can answer basic billing questions without opening Stripe |

## Functional Requirements

1. Each club record in Club Management includes a billing status panel
2. The panel surfaces from Stripe: subscription status (active, past due, cancelled), current plan name, and next renewal date
3. A direct link to the club's Stripe customer record is provided for full billing management
4. Billing data is read-only within Site Admin

## Acceptance Criteria

- [ ] Subscription status, plan name, and renewal date are visible per club
- [ ] Status reflects current Stripe state (not stale cached data)
- [ ] A link to the Stripe customer record is present
- [ ] No billing actions can be taken from within Site Admin

## Open Questions

| Question | Answer |
|----------|--------|
| Should overdue or cancelled subscriptions trigger a visual flag in the club list view? | |
| Is Stripe the billing provider, or is this TBD? | |
