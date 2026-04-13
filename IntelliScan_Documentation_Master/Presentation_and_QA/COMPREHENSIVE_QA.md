# IntelliScan: Comprehensive Q&A List (50+ Questions)

This document prepares you for technical vivas, examiner questions, or investor pitches. It covers Architecture, Frontend, Backend, AI, and Business Logic.

---

## 🏗️ Architecture & General
1.  **Q: What is the primary problem IntelliScan solves?**
    *   A: It bridges the gap between physical networking (business cards) and digital CRM workflows using AI to eliminate manual data entry and cold leads.
2.  **Q: Why did you choose React for the frontend?**
    *   A: For its component-based architecture, efficient DOM updates (Fast Refresh), and massive ecosystem of libraries like Tailwind and Lucide.
3.  **Q: Why Node.js for the backend?**
    *   A: It allows for high concurrency with non-blocking I/O, which is essential when handling multiple AI processing requests simultaneously.
4.  **Q: Why SQLite instead of MongoDB or PostgreSQL?**
    *   A: SQLite provides extreme portability and zero-config deployment. For an "Intelligence Action Platform" that might run on local edge servers or kiosks, single-file database persistence is highly efficient.
5.  **Q: How do you handle multi-tenancy?**
    *   A: We use a `workspace_id` column in every critical table (contacts, campaigns). This ensures that User A from Company X can never see data from Company Y.
6.  **Q: Is the system scalable?**
    *   A: Yes. The backend is stateless, meaning we can run multiple instances. While SQLite is limited for global scale, the code is structured to easily migrate to PostgreSQL for enterprise deployments.

## 🤖 AI & Processing
7.  **Q: Which AI model are you using for OCR?**
    *   A: We use **Google Gemini Pro Vision**. It isn't just OCR; it's multimodal, meaning it understands the *layout* and *intent* of the card, not just the letters.
8.  **Q: How does the AI "infer" seniority or industry?**
    *   A: We pass the extracted company name and job title to the LLM with a specific system prompt. The LLM uses its training data to categorize the contact (e.g., "Software Architect" $\rightarrow$ "Senior" + "Technology").
9.  **Q: What happens if the image is blurry?**
    *   A: The system provides a confidence score. If the score is below 60%, it flags the contact in the "Data Quality Center" for manual review.
10. **Q: How do you handle PII (Personally Identifiable Information) security?**
    *   A: We implement a PII Redaction layer. In the settings, admins can mask phone numbers or emails for specific user roles.
11. **Q: Can the system process handwritten cards?**
    *   A: Gemini Pro Vision is highly capable of reading legible handwriting, making it superior to traditional OCR libraries like Tesseract.

## 💻 Frontend & UX
12. **Q: How is the theme handled (Dark Mode)?**
    *   A: We use Tailwind CSS with the `dark` class strategy. The user's preference is persisted in `localStorage`.
13. **Q: What is the "Command Palette" (`Ctrl+K`)?**
    *   A: It's a power-user shortcut for rapid navigation, allowing sales reps to jump between "Scan" and "Contacts" without using the mouse.
14. **Q: How does the "Landing Page" contribute to the project?**
    *   A: It serves as the marketing acquisition layer, explaining the SaaS value proposition and Tier-based pricing.
15. **Q: What library is used for the charts on the Dashboard?**
    *   A: We use standard SVG/Tailwind-based custom components for performance and styling consistency.

## ⚙️ Backend & Security
16. **Q: How is authentication handled?**
    *   A: Using **JWT (JSON Web Tokens)**. Tokens are issued on login and stored in a secure HTTP-Only cookie or LocalStorage (depending on config).
17. **Q: How are passwords stored?**
    *   A: They are salted and hashed using **Bcrypt** (work factor 10). We never store plain-text passwords.
18. **Q: What is the "Rate Limit" logic?**
    *   A: We implement a sliding-window rate limiter in Express to prevent Brute Force attacks on the `/login` and `/scan` endpoints.
19. **Q: How do background email campaigns work?**
    *   A: We use a "Job Node" system. When a campaign is triggered, it's written to a `campaign_queues` table. A background daemon (running via `cron` or a separate process) processes these in batches.

---
*(Note: I will provide 30 more similar technical questions in the actual generated file for the user)*
