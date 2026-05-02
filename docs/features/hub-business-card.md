# Hub - Business Card

**Status:** Draft
**Last updated:** 2026-04-10
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Hub](hub.md)

---

## Summary

The business card is the display unit for a single business within the hub. It presents the business's details and tracked contact links in a consistent, scannable format.

## Problem Statement

Businesses need a clear, structured presence on the hub that gives Hub Visitors enough information to engage, and gives the business something concrete to point to as evidence of their sponsorship value.

## Goals

- Present all relevant business details in a consistent, readable format
- Make contact actions (email, website) easy to take directly from the card
- Track clicks on contact links so businesses have measurable engagement data

## Non-Goals

- The card does not allow Hub Visitors to interact with the business beyond the means provided (email, websit, phone number)
- The card does not link to a standalone business profile page (the card is the full presence)

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Hub Visitor | See a business's name, description, and contact details at a glance | I can quickly decide whether to get in touch |
| Hub Visitor | Click an email or website link directly from the card | I can contact the business without having to search for them elsewhere |
| Business | Have my sponsor tier displayed on my card | My level of support is visible to the community |
| Business | Have my email and website clicks tracked | I can see measurable return from my participation |

## Functional Requirements

1. The card displays the following fields:
   - Business logo
   - Business name
   - Business description
   - Sponsor level (as set by the club)
   - Phone number
   - Email address (click-tracked)
   - Website URL (click-tracked)
2. Email and website links are tracked on click (see [hub-click-tracking.md](hub-click-tracking.md))
3. Fields that are not provided are not shown (no empty placeholders)
4. The card layout is consistent across all businesses on the hub

## Acceptance Criteria

- [ ] All six fields are displayed when populated
- [ ] Unpopulated fields are hidden, not shown as blank
- [ ] Clicking the email address opens the device mail client and registers a tracked click
- [ ] Clicking the website URL opens the URL in a new tab and registers a tracked click
- [ ] Sponsor level is displayed and matches what the club has set

## Open Questions

| Question | Answer |
|----------|-------|
| How is sponsor level displayed visually - label, badge, tier name? |  |
| Is there a character limit on business description? |  |
| Should any additional fields be supported, like discount etc. |  |