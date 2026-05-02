# Club Admin - Hub Appearance

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Club Admin](club-admin.md)

---

## Summary

Club Admins can customise the visual appearance of their hub with their club's logo and primary colour. This gives the hub a branded feel that reflects the club's identity.

## Problem Statement

A generic, unbranded hub feels like a third-party tool bolted on. Clubs take pride in their identity, and businesses and members expect the hub to feel like it belongs to the club.

## Goals

- Allow clubs to apply basic branding so the hub feels like their own
- Keep the customisation surface small - enough to feel branded, not enough to break the layout

## Non-Goals

- This feature does not support full theme customisation - font, layout, and component styles are controlled by Salt Collective
- Custom CSS or code injection is not supported

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Upload my club's logo | The hub clearly identifies as belonging to my club |
| Club Admin | Set a primary colour | The hub reflects my club's colours |

## Functional Requirements

1. A Club Admin can upload a club logo, displayed on the hub header
2. A Club Admin can set a primary colour, applied to hub UI elements
3. Changes to appearance are reflected on the hub immediately
4. The logo upload accepts common image formats (PNG, JPG, SVG) and enforces a maximum file size
5. A colour picker or hex input is provided for the primary colour

## Acceptance Criteria

- [ ] A club logo can be uploaded and appears on the hub
- [ ] A primary colour can be set and is applied to the hub
- [ ] Appearance changes are reflected immediately on the published hub
- [ ] The logo upload rejects files that exceed the size limit with a clear message

## Open Questions

| Question | Answer |
|----------|--------|
| What is the maximum logo file size? | |
| Which specific UI elements does the primary colour apply to? | |
| Is there a secondary colour or is a single primary colour sufficient? | |
