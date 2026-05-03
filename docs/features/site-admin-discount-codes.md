# Discount Codes

**Status:** Draft
**Last updated:** 2026-05-03
**Owner:** Liam Egan
**Approver:** —

---

## Summary

Site admins can create single-use discount codes that clubs enter during the onboarding payment step. A valid code authorises the club to proceed past the payment step without subscribing. This gives Salt Collective a controlled, auditable mechanism to invite specific clubs onto the platform before Stripe billing is live, and provides the foundation for promotional codes once it is.

## Problem Statement

The current payment step has a "Skip for now" link that any user can use — there is no mechanism to distinguish clubs that have been invited or given promotional access from clubs that are simply bypassing payment without authorisation. Before Stripe is integrated, Salt Collective needs a lightweight way to control and track who is accessing the platform.

## Goals

- Give site admins a tool to generate and distribute individual access codes
- Enforce single-use semantics so a code cannot be shared or reused across clubs
- Provide an audit trail: which admin created each code, which club redeemed it, and when
- Lay the groundwork for Stripe promo codes / trial periods by establishing the discount code model now

## Non-Goals

- Bulk code generation (one-at-a-time is sufficient for now)
- Percentage or fixed-amount discount logic — that lives in Stripe once billing is integrated
- Codes that modify subscription pricing directly; this feature is an access gate, not a billing primitive
- Code expiry enforcement in v1 (the `expiresAt` field is stored but not enforced at redemption until billing is live)

## User Stories

| As a...    | I want to...                                            | So that...                                                              |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Site Admin | Create a unique discount code and share it with a club  | The club can complete onboarding without being blocked by the payment step |
| Site Admin | See which codes have been redeemed and by whom          | I can audit platform access and know which clubs are using promo access |
| Site Admin | Invalidate or expire a code that hasn't been used yet   | I can revoke access I no longer want to grant                           |
| Club Admin | Enter a discount code during the payment step           | I can activate my hub without providing payment details                 |

## Functional Requirements

1. A `DiscountCode` record stores: `code` (unique, uppercase alphanumeric string), optional `description` (admin reference note), `createdByUserId`, optional `expiresAt`, optional `redeemedByClubId`, optional `redeemedAt`, and `createdAt`
2. Code creation is restricted to users with `UserType.SITE_ADMIN`
3. Codes are created one at a time via a form in the admin section at `/admin/discount-codes`
4. The code string is either generated randomly (admin clicks "Generate") or entered manually. Format: 8–16 uppercase alphanumeric characters (A–Z, 0–9), no spaces
5. Each code is single-use: once `redeemedByClubId` is set, no further redemption is permitted for that code
6. The onboarding payment step (`/onboarding/payment`) accepts a discount code input field. On submission, the server validates the code (exists, not already redeemed, not expired) and, if valid, marks it as redeemed (`redeemedByClubId`, `redeemedAt`) and redirects to `/onboarding/done`
7. Code validation is a server-side action on the payment step — no separate API endpoint needed
8. A club may only redeem one code. If the club's `ClubMembership` already has a redeemed code associated with it, submission of another code is rejected
9. The admin discount codes list shows: code string, description, created-by (email), created-at, status (Unused / Redeemed), and if redeemed: the club name and redeemed-at timestamp
10. An admin can delete an unredeemed code. Redeemed codes cannot be deleted (audit record)

## Acceptance Criteria

- [ ] Site Admin can create a code and see it appear in the list immediately
- [ ] A club can enter a valid code on the payment step and proceed to the done step; the code is marked as redeemed
- [ ] Entering an invalid, already-redeemed, or expired code shows an inline error on the payment step; the user is not advanced
- [ ] After one club redeems a code, a second attempt to use the same code fails with an appropriate error
- [ ] The admin list correctly shows redeemed codes with the club name and timestamp
- [ ] An unredeemed code can be deleted by a site admin; a redeemed code cannot

## Data model

```prisma
model DiscountCode {
  id               String    @id @default(cuid())
  code             String    @unique
  description      String?
  createdByUserId  String
  redeemedByClubId String?
  redeemedAt       DateTime?
  expiresAt        DateTime?
  createdAt        DateTime  @default(now())

  createdBy  User  @relation(fields: [createdByUserId], references: [id])
  redeemedBy Club? @relation(fields: [redeemedByClubId], references: [id])
}
```

`Club` gains a `discountCode DiscountCode?` back-relation.

## Open Questions

| Question | Answer |
|----------|--------|
| Should the "Skip for now" link be removed once discount codes are live, so a code is the only way to bypass payment? | To be decided — removing it enforces the gate but breaks the current stub behaviour. Leave it in place until Stripe is integrated and the code path is fully tested. |
| Should codes have a maximum use count greater than one (e.g. a batch promo)? | Out of scope for v1. Single-use only. |
| When Stripe is integrated, how does a redeemed discount code translate to billing? | TBD — likely a Stripe coupon applied at checkout, with the `DiscountCode` record cross-referencing the Stripe coupon ID. |

## Notes

- The `expiresAt` field is stored and shown in the admin UI but not enforced at redemption in v1 (Stripe is not live, so "expiry" has no billing consequence yet). Mark as "not yet enforced" in the admin UI.
- Implementation spec for onboarding payment step changes: [`onboarding.md`](../../onboarding.md).
