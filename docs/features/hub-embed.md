# Hub - Embeddable Iframe

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Hub](hub.md)

---

## Summary

The embeddable iframe gives clubs with an existing website a snippet they can drop in to render their hub inline. It delivers the same hub experience as the hosted page without requiring visitors to leave the club's site.

## Problem Statement

Clubs that already have a website want the hub to feel like part of their site, not a separate destination. A hosted URL alone forces these clubs to send visitors away, breaking the experience they have built.

## Goals

- Give clubs a simple, copy-paste embed snippet that requires no technical knowledge to use
- Render the full hub experience within the iframe with no loss of functionality
- Ensure click tracking continues to work correctly when the hub is embedded

## Non-Goals

- The embed does not support customisation beyond what the hosted page supports
- The embed is not a JavaScript widget or web component - it is a standard iframe
- The embed does not provide SSO or any authentication passthrough to the club's site

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Get an embed snippet I can paste into my website | My hub appears on my own site without visitors having to go elsewhere |
| Hub Visitor | Browse the hub inline on the club's website | I don't have to leave the club's site to see the business directory |

## Functional Requirements

1. Each club's hub is embeddable via a standard `<iframe>` snippet
2. The snippet is available to the Club Admin from within the admin area
3. The iframe renders the full hub, including business list, cards, tiers, and search
4. Click tracking functions correctly when the hub is loaded inside an iframe
5. The iframe responds to its container width so it renders appropriately at different sizes

## Acceptance Criteria

- [ ] A copy-paste iframe snippet is available to the Club Admin
- [ ] The full hub renders correctly inside the iframe
- [ ] Click tracking events are recorded when the hub is embedded
- [ ] The embed is responsive to its container width

## Open Questions

| Question | Answer |
|----------|--------|
| How is iframe height handled - fixed, or does it expand to content? | |
| Is there any X-Frame-Options or CSP restriction that needs to be accounted for? | |
| Should the embed snippet include a fallback link to the hosted page for browsers that block iframes? | |
