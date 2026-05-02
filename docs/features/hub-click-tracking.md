# Hub - Click Tracking

**Status:** Draft
**Last updated:** 2026-04-10
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Hub](hub.md)

---

## Summary

Click tracking records when a Hub Visitor interacts with a tracked link on a business card. This gives clubs and businesses measurable evidence that the hub is driving engagement.

## Problem Statement

Businesses sponsoring a club have historically had no way to measure the return on their investment. A logo on a jersey or a mention in a newsletter proves nothing. Click tracking gives businesses something concrete: real data showing that club members are engaging with their details.

## Goals

- Record a click event each time a Hub Visitor interacts with a tracked link on a business card
- Make that data available to Club Admins and, through them, to businesses
- Provide enough signal to justify continued business participation

## Non-Goals

- Click tracking does not identify individual Hub Visitors - clicks are anonymous
- This feature does not cover how analytics are surfaced in the UI - that is handled in the analytics features under Club Admin
- This feature does not track page views of the hub itself, only clicks on business card links

## Tracked Interactions

The following interactions on a business card are tracked:

| Interaction   | Trigger                                                 |
| ------------- | ------------------------------------------------------- |
| Email click   | Hub Visitor clicks the business email address           |
| Website click | Hub Visitor clicks the business website URL             |
| Phone click   | Hub Visitor click the business phone number (tel: link) |

## Functional Requirements

1. A click event is recorded each time a Hub Visitor clicks a tracked link on a business card
2. Each event captures: business ID, club ID, link type (email / website / phone), and timestamp
3. Click events are attributed to the correct business and club
4. Tracking does not require the Hub Visitor to have an account or be identified in any way
5. Tracked links must not break or degrade if the tracking call fails - the navigation should always complete

## Acceptance Criteria

- [ ] Clicking a business email address records a click event of type "email"
- [ ] Clicking a business website URL records a click event of type "website"
- [ ] Click events include business ID, club ID, link type, and timestamp
- [ ] A failed tracking call does not prevent the link from functioning
- [ ] No personally identifiable information about the Hub Visitor is recorded

## Open Questions

| Question                                                                              | Answer |
| ------------------------------------------------------------------------------------- | ------ |
| Are clicks de-duplicated within a session or time window, or is every click recorded? |        |
| Is any geo or referrer data captured alongside the click event?                       |        |
