# Nandhini Tex Sarees — Setup & Architecture Guide

Welcome to the **Nandhini Tex Sarees E-Commerce Platform** setup and architecture guide. This repository contains the complete enterprise specification suite, Product Requirements Document (PRD), architectural decision records (ADRs), and multi-agent development guidelines.

- **GitHub Repository**: [https://github.com/JeevananthanV/nandhini_tex](https://github.com/JeevananthanV/nandhini_tex)
- **Author**: Jeevananthan V

---

## 📋 Repository Specifications Overview

This repository acts as the single source of truth for engineering the Nandhini Tex direct-to-consumer handloom saree e-commerce ecosystem.

| File | Purpose |
|---|---|
| [`prd.md`](prd.md) | Product Requirements Document: Catalog, user personas, checkout flow, operations. |
| [`architecture.md`](architecture.md) | System architecture: API schemas, data models, payments, delivery integrations. |
| [`design.md`](design.md) | Luxury brand aesthetic, color systems, typography, 3D saree viewer. |
| [`decisions.md`](decisions.md) | Architectural Decision Records (ADRs). |
| [`tasks.md`](tasks.md) | Phased engineering backlog. |
| [`agents.md`](agents.md) | Autonomous multi-agent engineering workflows. |

---

## 🚀 How to Utilize This Repository

1. **Architecture & Schema References**:
   Consult `architecture.md` when implementing the database models (PostgreSQL/MongoDB) and REST/GraphQL API endpoints.
2. **Design Tokens & UI Implementation**:
   Use the typography pairings and hex codes specified in `design.md` for Tailwind CSS configuration.
3. **Delivery Milestones**:
   Track phase-by-phase implementation using `tasks.md`.
