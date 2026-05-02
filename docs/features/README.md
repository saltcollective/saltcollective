# Features

This folder covers all feature definitions for Salt Collective. There are two layers:

1. **The feature list** - a Notion database that serves as the master registry and backlog
2. **BRDs (Business Requirements Documents)** - one markdown file per feature in this folder, containing the full definition

The feature list is the source of truth for what exists, what's prioritised, and what state each feature is in. BRDs contain the detail needed to design and build each feature.

---

## Feature List (Notion Database)

The feature list lives in Notion as a database. Each row is a feature. The schema is:

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Short feature name |
| Summary | Text | One sentence: what it does and why it exists |
| Area | Select | Functional grouping (see Areas below) |
| Persona | Relation | Which personas this primarily serves (linked to Personas database) |
| Priority | Select | MoSCoW: Must / Should / Could / Won't |
| Status | Select | Backlog / BRD In Progress / BRD Done / Building / Done |
| BRD | URL | Link to the BRD file in this folder, once it exists |
| Milestone | Select | Target release (populated once milestones are defined) |

### Areas

| Area | Covers |
|------|--------|
| Hub | The public-facing Business Hub page and embed |
| Admin | Club administrator tools: hub setup, business management, settings |
| Onboarding | First-run flows for clubs and businesses |
| Analytics | Click tracking, referral data, reporting |
| Billing | Club subscription management |

### Personas

Personas are maintained in their own Notion database and linked via a Relation property. The four personas are Club Admin, Business, Hub Visitor, and Site Admin - see [../00-vision/target-audience.md](../00-vision/target-audience.md) for full definitions (Site Admin to be added).

### Priority (MoSCoW)

| Value | Meaning |
|-------|---------|
| Must | Required for launch - the product does not work without it |
| Should | High value; included unless something has to give |
| Could | Nice to have; included only if time and scope allow |
| Won't | Explicitly out of scope for the current phase |

---

## BRDs

Each feature with a Priority of Must or Should should have a BRD before work begins. Use [_template.md](_template.md) to create one.

File naming: `[area]-[short-name].md` (e.g. `hub-business-card.md`, `admin-onboarding.md`).

Once a BRD exists, add its URL to the BRD property in the Notion feature list.

---

## Feature List

| ID | Feature | Area | Persona | Priority | Status |
|----|---------|------|---------|----------|--------|
| - | _No features defined yet_ | | | | |
