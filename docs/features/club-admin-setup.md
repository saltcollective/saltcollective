# Club Admin - Hub Setup / First-run

**Status:** Draft
**Last updated:** 2026-04-12
**Owner:** Liam Egan
**Approver:** Liam's sister
**Parent:** [Club Admin](club-admin.md)

---

## Summary

The first-run setup guides a newly registered Club Admin through configuring their hub before it goes live. It collects the minimum information needed to produce a functioning, branded hub.

## Problem Statement

A new Club Admin has an account but no hub. Without a structured setup flow, they face a blank state with no clear starting point. The first impression of the admin experience needs to instil confidence that the platform is simple to use.

## Goals

- Walk the Club Admin through hub configuration in a clear, linear flow
- Collect only what is necessary to publish a functioning hub
- End with a hub that is ready to go live or share internally for review

## Non-Goals

- First-run does not need to collect every possible configuration option - advanced settings can be completed later
- First-run does not add businesses to the hub - that is a separate flow
- First-run does not publish the hub - publishing is a deliberate separate step

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Club Admin | Be guided through setting up my hub step by step | I'm not faced with a blank screen and don't miss anything important |
| Club Admin | Complete setup quickly with minimal information | I can get to a working hub without a lengthy onboarding process |

## Functional Requirements

1. The first-run flow is triggered automatically when a Club Admin logs in for the first time with no existing hub
2. The flow collects the following as a minimum:
   - Club name
   - Club logo
   - Primary colour (for hub branding)
3. On completion, a hub is created in an unpublished state with the provided details
4. The Club Admin is directed to the admin area on completion, ready to add businesses

## Acceptance Criteria

- [ ] First-run is presented automatically to a new Club Admin with no hub
- [ ] Club name, logo, and primary colour are collected
- [ ] A hub is created in an unpublished state on completion
- [ ] The Club Admin lands in the admin area after completing setup
- [ ] A returning admin with an existing hub is not shown the first-run flow

## Open Questions

| Question | Answer |
|----------|--------|
| Are sponsor levels configured during first-run, or added later? | |
| Is there a default set of sponsor levels provided as a starting point? | |
| What is the minimum viable hub - does it need at least one business before it can be published? | |
