# Onboarding

**Status:** Approved
**Last updated:** 2026-05-03
**Owner:** Liam Egan
**Approver:** Liam's sister

---

## Summary

Onboarding covers the end-to-end journey from a new club signing up to having a live, published hub. It is a multi-step wizard at `/onboarding/*` that collects the minimum information needed to make the hub useful, then publishes it immediately on completion.

## Problem Statement

A club that has agreed to subscribe needs a clear, low-friction path to a working hub. Any unnecessary friction at this stage risks churn before the product has delivered any value.

## Goals

- Get a new club from sign-up to a published hub with as little friction as possible
- Make the subscription commitment clear before setup begins, even while Stripe is not yet integrated
- Ensure publishing is a deliberate, confident action — the user knows their hub is live when they leave the wizard

## Non-Goals

- Ongoing hub management — that is Club Admin (`/dashboard/*`)
- Commercial negotiation or lead capture before sign-up
- Inviting additional club members/editors during onboarding

## Steps

| # | Route | Purpose | Skippable |
|---|---|---|---|
| 1 | `/onboarding/club` | Club name, slug, tagline | No — creates club record |
| 2 | `/onboarding/branding` | Logo upload, primary and secondary colours | Yes |
| 3 | `/onboarding/tiers` | Sponsor tier names and optional prices | Yes |
| 4 | `/onboarding/payment` | Subscription plan selection (Stripe stub) | Yes (forced for now) |
| 5 | `/onboarding/done` | Publishes hub, confirms go-live | — |

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Create an account and set up a hub quickly | I can start adding sponsors without a lengthy process |
| Club Admin | Upload my club logo and set brand colours | The hub looks like it belongs to my club |
| Club Admin | Define my sponsorship tiers upfront | Sponsors can see clear tier options on day one |
| Club Admin | Know exactly when my hub goes live | I can control the moment it becomes publicly visible |

## Functional Requirements

1. The wizard is accessible at `/onboarding/*` — a distinct layout from the club admin shell (no sidebar)
2. All steps require the user to be authenticated. Unauthenticated users are redirected to `/sign-in`
3. Users who have already completed onboarding (published club membership exists) are redirected to `/dashboard`
4. Step 1 is the only blocking step. It creates the `Club` record and an `ADMIN` `ClubMembership` for the signed-in user
5. After step 1, the club ID is carried between steps via a `?club=<id>` URL param. Each step verifies the user holds an ADMIN membership for that club
6. The slug is auto-derived from the club name (lowercase, hyphens) and shown as `saltcollective.club/{slug}`. It must be editable and validated as globally unique before submission
7. Step 2 (branding) uses the existing S3 presigned upload flow for logo files. Accepted formats: PNG, JPEG, SVG. Max 2 MB
8. Step 3 (tiers) pre-populates Gold, Silver, Bronze rows. The user can rename, delete, reorder, or add up to 5 tiers. Each tier has an optional price
9. Step 4 (payment) shows a pricing card. The "Start subscription" button is disabled while Stripe is not connected. A "Skip for now" link is the primary path
10. Step 4 also accepts a discount code. A text input and "Apply" button allow the user to enter a code issued by a site admin. A valid, unredeemed code advances the user to the done step and marks the code as redeemed against this club. An invalid or already-redeemed code shows an inline error. See [Discount Codes BRD](site-admin-discount-codes.md) for the full spec
11. The done step sets `Club.publishedAt` to the current timestamp — the hub page becomes publicly accessible immediately
12. The `(app)` layout redirects users with no `ClubMembership` to `/onboarding/club` (not to `/`)

## Acceptance Criteria

- [ ] A new user can complete steps 1–5 without contacting Salt Collective
- [ ] Slug uniqueness is validated before the club is created
- [ ] Skipping branding, tiers, or payment still leads to a published hub
- [ ] The done screen shows the public hub URL
- [ ] Navigating directly to `/dashboard` after step 1 (skipping remaining steps) works correctly — the club exists and the user can manage it
- [ ] A user who has already completed onboarding cannot re-enter the wizard; they are redirected to `/dashboard`
- [ ] Payment step renders correctly with the skip path visible; subscribe button is visually disabled with a "coming soon" indication
- [ ] A valid discount code entered on the payment step advances to the done step and marks the code as redeemed
- [ ] An invalid or already-redeemed code shows an inline error and does not advance the wizard

## Open Questions

| Question | Answer |
|----------|--------|
| Is sign-up fully self-serve, or does the operator manually create each club account? | Self-serve — Clerk handles sign-up, onboarding wizard handles club creation |
| Is payment collected at sign-up, or after a trial period? | Payment step is present in the wizard but Stripe is not yet integrated; users skip it for now |

## Notes

Implementation spec (routes, guard logic, server actions, slug API): [`onboarding.md`](../../onboarding.md) at the repo root.
