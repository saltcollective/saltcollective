# Hub - Sponsor Tier List

**Status:** Draft
**Last updated:** 2026-04-10
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Hub](hub.md)

---

## Summary

The hub displays businesses grouped by sponsor tier, reflecting the club's own tier structure. Only tiers that have at least one active business are shown. Tiers provide Hub Visitors with a clear signal of each business's level of support, and give higher-tier businesses the prominence they were promised.

## Problem Statement

One tangible benefix clibs can offor sponsors at different levels of sponsorship is increased visibility via branding and exposure. Accordingly, higher sponsorship tiers should appear higher and more "featured" on the club hub page.

## Goals

- Surface the club's tier structure on the hub in a way that is clear to Hub Visitors
- Ensure only tiers with active businesses are represented, keeping the hub clean
- Give businesses at higher tiers visible prominence

## Non-Goals

- This feature does not cover tier management - creating, editing, and deleting tiers is handled in Club Admin
- Tiers carry no prescribed meaning from Salt Collective - the club defines what each tier represents
- This feature does not gate any business functionality based on tier

## User Stories

| As a...     | I want to...                                  | So that...                                                          |
| ----------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Hub Visitor | See businesses grouped by their sponsor tier  | I understand which businesses are the club's biggest supporters     |
| Hub Visitor | Only see tiers that have businesses in them   | The hub feels complete and purposeful, not full of empty categories |
| Business    | Have my tier displayed prominently on my card | My level of support is visible and recognised by the community      |

## Functional Requirements

1. Businesses on the hub are grouped by sponsor tier
2. Tiers are ordered from highest to lowest as defined by the club
3. Only tiers with at least one active business are displayed - empty tiers are hidden
4. The tier name is displayed on each business card and as a section heading on the hub
5. If the club has only one active tier, tier grouping headings may be omitted

## Acceptance Criteria

- [ ] Businesses are visually grouped by tier on the hub
- [ ] Tiers appear in order from highest to lowest
- [ ] Tiers with no active businesses are not shown
- [ ] Each business card displays its tier name
- [ ] A club with a single active tier renders without empty tier sections

## Open Questions

| Question                                                                                                    | Answer |
| ----------------------------------------------------------------------------------------------------------- | ------ |
| How is tier displayed on the card - text label, badge, or icon?                                             |        |
| Is the tier name shown as a section heading above each group, or only on the card and in the filtering bar? |        |
