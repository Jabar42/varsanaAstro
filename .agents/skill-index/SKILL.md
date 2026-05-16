---
name: skill-index
description: "Catalog of all available Agent Skills for the Varsana website. Use when you need to discover which skills are available or determine which skill to activate for a given task."
---

# Agent Skills Index

This skill provides a centralized catalog of all Agent Skills available for the Varsana website. Use this index to quickly discover which skills exist, understand their purposes, and decide which skill to activate for a given task.

## Skill Categories

Skills are grouped by their primary domain:

- **Content Management**: Skills related to creating, formatting, and publishing content (events, pasadías, team members).
- **Design**: Skills that define visual guidelines and component patterns.
- **Development**: Skills that assist with code‑level changes and schema definitions.
- **Agent Tools**: Skills that extend agent capabilities beyond the Varsana project.

## Skill Catalog

| Skill | Description | When to Use | Category |
|-------|-------------|-------------|----------|
| [create‑content‑collection‑schema](../create-content-collection-schema/SKILL.md) | Teaches how to create new content collection schemas in Astro, following the patterns for events and pasadías. | Use when the user wants to add a new type of content (e.g., workshops, blogs) to the Varsana website. | Development |
| [design‑guidelines](../design-guidelines/SKILL.md) | Design guidelines for the Varsana website including typography, colors, spacing, and component patterns. | Use when implementing UI changes or reviewing design consistency. | Design |
| [event‑content‑formatting](../event-content-formatting/SKILL.md) | Provides guidelines for formatting event and pasadía content with HTML tables, spacing, and typography. | Use when creating or editing event/pasadía markdown files to ensure consistent styling. | Content Management |
| [publish‑new‑event](../publish-new-event/SKILL.md) | Step‑by‑step instructions for publishing a new event in the Astro content collection. | Use when the user wants to add a new event to the Varsana website. | Content Management |
| [publish‑new‑member](../publish-new-member/SKILL.md) | Step‑by‑step instructions for adding a new member to the nosotros collection. | Use when the user wants to add a new team member to the Varsana website. | Content Management |
| [publish‑new‑pasadia](../publish-new-pasadia/SKILL.md) | Step‑by‑step instructions for publishing a new pasadía (day‑trip) in the Astro content collection. | Use when the user wants to add a new pasadía to the Varsana website. | Content Management |
| [payment‑integration‑bold](../payment-integration-bold/SKILL.md) | Complete reference for the Bold Payment Gateway integration — checkout flow, database schema, webhook handling, and inventory management. | Use when working with payments, debugging checkout issues, or understanding the Bold integration. | Development |
| [vercel‑integration](../vercel-integration/SKILL.md) | Complete reference for Vercel CLI setup, authentication, and usage — installation, token login, and all available CLI commands. | Use when deploying, managing environment variables, inspecting logs, configuring domains, or any Vercel operation. | Development |
| [upload‑image](../upload-image/SKILL.md) | Uploads images to the VarsanaImages Supabase bucket. Converts any image format to webp, compresses to 150KB, and returns a public URL. | Use when the user provides an image and wants it uploaded for use in events, pasadías, team members, or any site content. | Content Management |
| [find‑skills](../../../.agents/skills/find-skills/SKILL.md) | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", etc. | Use when the user is looking for functionality that might exist as an installable skill. | Agent Tools |

## How to Use This Index

1. **Discover skills**: Scan the table above to see what skills are available.
2. **Activate a skill**: When you need to perform a task covered by a skill, load the skill using the `skill` tool with the skill's name (e.g., `skill: design-guidelines`).
3. **Cross‑reference**: Each skill entry links directly to its full SKILL.md documentation. Click the skill name to view detailed instructions, references, and examples.

## Notes

- This index is automatically generated. If you add or remove skills from the `.agents/` directory, please update this file accordingly.
- Skills marked as "Agent Tools" are global skills installed system‑wide; all other skills are project‑specific.