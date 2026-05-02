# Hub - Hosted Page

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Hub](hub.md)

---

## Summary

The hosted page is a Salt Collective-managed public URL for a club's hub. It gives clubs with no website a standalone, shareable destination for their Business Hub.

## Problem Statement

Many clubs have no website, or only a Facebook page. Without a hosted URL, these clubs have nowhere to point businesses or members to see the hub. The hosted page ensures every club has a public presence for their hub regardless of their existing web infrastructure.

## Goals

- Provide every club with a public URL for their hub at no extra setup cost
- Ensure the page is shareable and accessible to Hub Visitors without any login
- Reflect the club's branding on the page

## Non-Goals

- The hosted page is not a full club website - it surfaces the hub only
- The hosted page does not support custom domains at this tier
- SEO optimisation is not a goal at launch

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Have a public URL I can share for my hub | I can direct businesses and members to the hub without needing my own website |
| Hub Visitor | Access the hub via a direct URL | I can browse the hub without needing to visit the club's website |

## Functional Requirements

1. Every club is assigned a public URL upon hub creation
2. The URL follows a consistent structure based on the club's identifier
3. The page renders the full hub (business list, cards, tiers) at that URL
4. The page displays the club's name and logo
5. The page is publicly accessible without login
6. The page returns an appropriate response if the club's hub is not yet published

## Acceptance Criteria

- [ ] Every club has a unique, accessible public URL for their hub
- [ ] The URL is assigned automatically and does not require manual setup
- [ ] The full hub renders correctly at the hosted URL
- [ ] The club name and logo are displayed on the page
- [ ] An unpublished hub returns an appropriate holding state rather than an error

## Open Questions

| Question | Answer |
|----------|--------|
| What is the URL structure? (e.g. `saltcollective.com/hub/club-name` or `club-name.saltcollective.com`) | |
| What does the page look like before the club publishes their hub? | |
| Is there any Salt Collective branding on the hosted page, or is it club-branded only? | |
