# Hub

**Status:** Draft
**Last updated:** 2026-04-10
**Owner:** Liam Egan
**Approver:** Liam's sister

---

## Summary

The Hub is the public-facing Business Hub page for a sports club. It displays a curated list of local businesses that support the club, giving Hub Visitors a browsable directory and giving businesses measurable visibility with a local, engaged audience.

## Problem Statement

Clubs have no good way to showcase their business supporters publicly. Businesses that sponsor a club get little tangible visibility, making it hard to justify continued participation. Club members have no easy way to discover which businesses support their club.

## Goals

- Give every participating business a clear, structured presence that is easy for Hub Visitors to find and act on
- Give clubs a professional, low-maintenance public face for their sponsorship relationships
- Provide measurable value to businesses through click tracking on contact details and links

## Non-Goals

- The hub does not allow businesses to self-list or apply for inclusion; the club always controls who appears
- The hub does not require a login or account from Hub Visitors
- The hub does not process payments or display pricing between club and business

## Child Features

| Feature | Priority | Status |
|---------|----------|--------|
| [Business list](hub-business-list.md) | Must | Backlog |
| [Business card display](hub-business-card.md) | Must | Backlog |
| [Sponsor tier list](hub-sponsor-tiers.md) | Must | Backlog |
| [Click tracking](hub-click-tracking.md) | Must | Backlog |
| [Hosted hub page](hub-hosted-page.md) | Must | Backlog |
| [Embeddable iframe](hub-embed.md) | Should | Backlog |

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Hub Visitor | Browse a list of businesses that support my club | I can find and engage with local businesses that back my community |
| Hub Visitor | See clear contact details and links for each business | I can get in touch or visit their website without friction |
| Business | Have a card on the hub with my details and tracked links | I can demonstrate measurable return from my sponsorship |
| Club Admin | Have a public-facing hub I can point sponsors and members to | I can show that the club takes its business relationships seriously |

## Acceptance Criteria

- [ ] The hub is publicly accessible without login
- [ ] All participating businesses for a club are listed
- [ ] Businesses are ordered by sponsor tier
- [ ] Each business displays name, description, sponsor level, phone, email, and website
- [ ] Email and website clicks are tracked
- [ ] The hub is available as both a hosted page and an embeddable iframe

## Open Questions

| Question | Answer |
|----------|--------|
| What does the hosted URL structure look like? (e.g. `club.saltcollective.com`) | |
| What tracking data is surfaced - raw clicks, or aggregated stats? | |
| What sponsor levels will be offered and what do they mean visually? | |

## Notes

This is a parent feature. Each child feature listed above has its own BRD covering the detail of that specific piece of functionality.
