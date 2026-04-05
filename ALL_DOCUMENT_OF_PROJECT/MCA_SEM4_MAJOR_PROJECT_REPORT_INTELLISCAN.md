# MCA Sem-4 Major Project Documentation (2025-26)
## IntelliScan: AI-Powered Business Card Scanning and CRM Platform

Generated for compliance with:

- Subject Code: MC04094011
- Subject Name: Research Work (Phase 2) / Major Project
- Term: 11/12/2025 to 17/04/2026
- Guide: Prof. Khushbu Patel

This report is structured to match the extracted guideline requirements from:

- `Final_MCA_Sem-4_ProjectGuideliens_2025-26.pdf`

---

# Title Page (Front Page)

Project Title: IntelliScan: AI-Powered Business Card Scanning and CRM Platform

Team Members:

1. [Name] (Enrollment No: [____])
2. [Name] (Enrollment No: [____])
3. [Name] (Enrollment No: [____])

Guide Name: Prof. Khushbu Patel

Institute: Sardar Vallabhbhai Patel Institute of Technology, Vasad

Academic Year: 2025-26

Presentation Date: April 4, 2026

---

# Declaration Page

I/We hereby declare that this Major Project report titled **“IntelliScan: AI-Powered Business Card Scanning and CRM Platform”** is a bonafide work carried out by me/us under the guidance of **Prof. Khushbu Patel** and that the work has not been submitted to any other University/Institute for the award of any degree or diploma.

Place: [________]

Date: [________]

Signatures:

1. [Student Name 1]
2. [Student Name 2]
3. [Student Name 3]

---

# Internship Completion Certificate (If Applicable)

Attach internship completion certificate provided by the company (if the project was executed as an industrial project or during internship).

---

# College Certificate (Guide Certificate)

Attach the college/project completion certificate (provided by guide/department).

---

# Acknowledgement

We express our sincere gratitude to **Prof. Khushbu Patel** for continuous guidance, encouragement, and support throughout the Major Project. We also thank the institute and department for providing required infrastructure and learning environment.

---

# Table of Contents (Index)

1. Abstract
2. Chapter 1: Introduction
3. Chapter 2: Requirement Determination and Analysis
4. Chapter 3: System Design
5. Chapter 4: Development and Implementation
6. Chapter 5: Testing and Validation
7. Chapter 6: Proposed Enhancements and Future Work
8. Chapter 7: Conclusion
9. Chapter 8: Bibliography
10. Appendix A: System Diagrams Pack
11. Appendix B: Data Dictionary (Database Schema)
12. Appendix C: Page and File Inventory (Deep Documentation)

---

# Abstract

IntelliScan is an AI-powered business card scanning and CRM platform. It converts single business cards or group photos of multiple cards into structured contact records using a resilient extraction pipeline. The platform then organizes these contacts in a personal dashboard or a multi-user enterprise workspace. It includes follow-up automation (AI drafts, email marketing, calendar booking links), enterprise governance (RBAC, compliance policies, audit trail), data quality management (dedupe/merge), integrations (CRM mapping, webhooks), and tier upgrades using Razorpay billing. This project demonstrates a production-style full-stack SaaS architecture with real persistence, role-based access control, and clear end-to-end workflows.

---

# CHAPTER 1: Introduction

## 1.1 Existing System

Professionals and enterprises often rely on manual processes for lead capture:

1. Physical cards stored in wallets or drawers.
2. Manual typing of contact details into spreadsheets or CRMs.
3. Contacts spread across multiple tools (phone contacts, email, LinkedIn, CRM) with no unified intelligence layer.
4. Limited follow-up automation, leading to stale leads and missed opportunities.

## 1.2 Need for the New System

Modern B2B networking requires:

1. Fast capture (reduce lead-capture-to-CRM latency).
2. High accuracy extraction across complex fonts and layouts.
3. Collaboration and governance in enterprise settings.
4. Automated follow-up and campaign workflows to reduce networking leakage.

## 1.3 Objective of the New System

1. Extract structured contact data from card images using AI.
2. Provide CRM features (search, edit, export, tagging, enrichment hooks).
3. Provide multi-card extraction from group photos for enterprise users.
4. Provide follow-up automation via AI drafts and email marketing.
5. Provide enterprise-ready controls: RBAC, compliance policies, audit trail, data quality.

## 1.4 Problem Definition

Design and develop a scalable AI-powered business card scanning and CRM platform that converts physical networking into structured digital CRM workflows, with enterprise governance, automation, and measurable outcomes.

## 1.5 Core Components

1. Frontend (React + Vite) for multi-role dashboards and workflows.
2. Backend (Node.js + Express) for API and real-time services.
3. Database (SQLite) for persistent system tables and business data.
4. AI extraction pipeline (Gemini -> OpenAI -> offline OCR fallback).
5. Email sending (Nodemailer SMTP) for drafts, campaigns, and scheduling.
6. Billing (Razorpay) for tier upgrades and quota expansion.

## 1.6 Development Tools and Technologies

Frontend:

1. React 19 + Vite
2. Tailwind CSS
3. React Router
4. Axios

Backend:

1. Node.js + Express 5
2. Socket.IO
3. SQLite3
4. JWT + bcryptjs

AI and Messaging:

1. Gemini API (primary)
2. OpenAI API (fallback)
3. Tesseract.js (offline fallback for single-card OCR)
4. Nodemailer (SMTP)

Billing:

1. Razorpay Orders + signature verification

## 1.7 Assumptions and Constraints

1. Users can provide reasonably clear card images (lighting, focus).
2. AI extraction depends on availability of AI keys or safe fallbacks.
3. Free-tier users have scan quotas (enforced in backend).
4. For production scaling, SQLite should be migrated to Postgres and server should be modularized.

---

# CHAPTER 2: Requirement Determination and Analysis

## 2.1 Functional Requirements

1. Authentication: register/login, token-based sessions, role gating.
2. OCR/AI: single-card and group-photo extraction into normalized JSON.
3. CRM: contact list, search, edit, delete, export, relationships.
4. Events: event creation, tagging, leads-by-event visibility.
5. AI Drafts and Coach: generate outreach, provide insights.
6. Email marketing: templates, lists, campaigns, tracking.
7. Calendar: booking links, availability, scheduling, email notifications.
8. Enterprise: workspace pages, policies, audit logs, data quality tools.
9. Billing: Razorpay upgrade workflow and quota updates.

## 2.2 Targeted Users

1. Personal users (free/pro) scanning and managing their own contacts.
2. Enterprise users and admins managing a workspace CRM and campaigns.
3. Super admins monitoring platform-wide health and system modules.

---

# CHAPTER 3: System Design

## 3.1 High-Level Architecture

```mermaid
flowchart LR
    U[User Browser] --> FE[React SPA (Vite)]
    FE -->|JWT| API[Express Backend]
    API --> DB[(SQLite)]
    API --> GEM[Gemini AI]
    API --> OAI[OpenAI]
    API --> TES[Tesseract Worker]
    API --> SMTP[SMTP (Nodemailer)]
    API --> RZP[Razorpay]
    API --> SOCK[Socket.IO]
    FE --> SOCK
```

## 3.2 Use Case Diagram (Global, Full Project)

Reference:

1. `IntelliScan_UseCaseDiagrams.md` (contains the global full-project use case and all feature use cases)

## 3.3 Activity and Interaction Diagrams

Reference:

1. `IntelliScan_ActivityDiagrams.md`
2. `IntelliScan_InteractionDiagrams.md`
3. `IntelliScan_Global_ActivityDiagram.md`
4. `IntelliScan_Global_InteractionDiagram.md`

## 3.4 Class Diagram and Data Model

Reference:

1. `IntelliScan_ClassDiagrams.md`
2. `DATA_DICTIONARY_INTELLISCAN_DB.md` (authoritative schema dump)

---

# CHAPTER 4: Development and Implementation

This chapter describes how the project is implemented in the codebase.

Reference:

1. `INTELLISCAN_MASTER_DOCUMENTATION.md` (pages, APIs per page, and file index)
2. `PROJECT_STATUS.md` (what is wired end-to-end)

---

# CHAPTER 5: Testing and Validation

Current automated tests:

1. Backend Jest + supertest tests in `intelliscan-server/tests/*`.

Recommended future tests:

1. Frontend component tests (React Testing Library).
2. End-to-end tests (Playwright/Cypress).

---

# CHAPTER 6: Proposed Enhancements and Future Work

1. Modularize backend `intelliscan-server/index.js` into routes/services.
2. Migrate from SQLite to Postgres with migrations.
3. Add background job queue (email sends, CRM sync retries).
4. Add observability (metrics, tracing, structured logs).
5. Add enterprise SSO verification (SAML/OIDC).

---

# CHAPTER 7: Conclusion

IntelliScan demonstrates a production-style full stack SaaS project with:

1. AI ingestion pipeline for OCR and enrichment.
2. Real persistence and structured relational schema.
3. Enterprise modules (policies, data quality, audit, billing).
4. A multi-page UI with role-based access control and tier gating.

---

# CHAPTER 8: Bibliography

1. Google Gemini API documentation (used for AI extraction).
2. OpenAI API documentation (used for fallback extraction and text generation).
3. Express.js documentation.
4. SQLite documentation.

---

# Appendix A: System Diagrams Pack

Use the Mermaid diagram documents:

1. `IntelliScan_UseCaseDiagrams.md`
2. `IntelliScan_ActivityDiagrams.md`
3. `IntelliScan_InteractionDiagrams.md`
4. `IntelliScan_ClassDiagrams.md`

---

# Appendix B: Data Dictionary (Database Schema)

Authoritative schema:

1. `DATA_DICTIONARY_INTELLISCAN_DB.md`

---

# Appendix C: Page and File Inventory (Deep Documentation)

Authoritative internal project map:

1. `INTELLISCAN_MASTER_DOCUMENTATION.md`

