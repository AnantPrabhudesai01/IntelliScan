# USE CASE DIAGRAM PROMPT FOR DRAW.IO

Create a comprehensive UML Use Case Diagram for the IntelliScan - Business Card Intelligence Platform with detailed actors and use cases.

## SYSTEM OVERVIEW
IntelliScan is an enterprise-grade business card scanning and intelligent contact management platform that combines AI-powered optical character recognition (OCR), automatic data extraction, customer relationship management (CRM) integration, multi-team collaboration, email marketing automation, and comprehensive analytics. The platform serves multiple user personas with varying access levels and responsibilities.

## ACTORS (5 Primary Types)

### 1. END USER (Blue Color - #E3F2FD)
Personal and professional users who primarily interact with the core card scanning and personal contact management features. These are subscription-paying individuals who benefit from the card capture workflow.

### 2. BUSINESS ADMIN (Orange Color - #FFE0B2)
Team leads, workspace managers, and administrative personnel responsible for managing team members, distributing contacts, configuring workspace-level settings, managing email campaigns, and monitoring team performance metrics. They have administrative privileges within their workspace.

### 3. SUPER ADMIN (Purple Color - #F3E5F5)
Platform-level administrators who manage system infrastructure, security, user accounts, AI model configuration, billing and subscription management, API integration, system monitoring, and audit trails. They have the highest privilege level.

### 4. GUEST USER (Green Color - #E8F5E9)
External users with limited, role-based access. These users primarily interact with specific features like booking appointments, accessing kiosks for card scanning, and viewing limited contact information. They have the most restricted access.

### 5. CRM SYSTEM (Gray Color - #ECEFF1)
An external actor representing third-party CRM platforms (Salesforce, HubSpot, Pipedrive) that integrate with IntelliScan through APIs. This represents automated system-to-system interactions rather than direct user interactions.

## END USER USE CASES (14 Total)

1. **Sign In / Authenticate** - Primary use case that gates access to all other functionality. Users authenticate using email/password or OAuth providers.

2. **Scan Business Card** - Core feature where users capture a photo of a business card using their mobile device camera or upload an image file.

3. **Review Extracted Data** - Users examine OCR-extracted text and AI-processed contact information to verify accuracy before saving.

4. **Edit Contact Fields** - Users can manually correct, modify, add, or remove individual contact fields (name, email, phone, company, title, address, etc.).

5. **Save Contact** - After reviewing/editing, users persist the contact to their personal contact database with metadata about the source card.

6. **Search Contacts** - Users search their contact list using filters like name, company, email domain, tags, and contact source.

7. **View Contact Details** - Users access the complete profile of a saved contact including full information and interaction history.

8. **Export Contacts** - Users export their contacts in multiple formats (CSV, Excel, vCard) for use in other applications.

9. **Send Email Campaign** - Users create and send bulk email messages to selected contact segments with personalized templates.

10. **Track Email Engagement** - Users monitor email campaign performance including open rates, click rates, and conversion metrics in real-time.

11. **View Calendar / Schedule** - Users access their contact meeting calendar, scheduled calls, and appointment history.

12. **View Analytics** - Users access personal analytics dashboard showing scanning activity, contact growth, email engagement, and platform usage patterns.

13. **Manage Settings** - Users configure personal preferences, notification settings, integrations, and account security options.

14. **Access Help & Documentation** - Users access in-app help, FAQ, documentation, and support resources.

## BUSINESS ADMIN USE CASES (19 Total)

1. **Manage Team Members** - View, add, remove, and manage organization of team members and their access levels.

2. **Invite Team Members** - Send email invitations to new team members with specific role assignments.

3. **Assign Roles & Permissions** - Define and assign role-based permissions for team members (Viewer, Editor, Manager, Admin).

4. **View Activity Log** - Access comprehensive audit log showing all team member activities, contact modifications, and system events.

5. **Manage Contacts** - View and organize all team contacts, including those created by other team members.

6. **Assign Contacts to Team** - Distribute contacts among team members for responsibility and follow-up management.

7. **Add Tags to Contacts** - Create and apply organizational tags/categories to contacts for segmentation.

8. **Merge Duplicate Contacts** - Identify and merge duplicate contact records to maintain data quality.

9. **Setup CRM Integration** - Configure connections to external CRM platforms with API authentication.

10. **Map CRM Fields** - Define field mappings between IntelliScan contact fields and target CRM fields.

11. **Configure Data Retention** - Set policies for contact data retention, archival, and deletion timelines.

12. **Create Email Campaigns** - Design, configure, and launch multi-recipient email campaigns with templates and personalization.

13. **Configure Email Templates** - Create and manage reusable email templates with merge fields and dynamic content.

14. **Setup Automation Rules** - Define automated workflows (e.g., auto-assign contacts, auto-tag, auto-sync to CRM).

15. **Configure Workspace Settings** - Manage workspace name, billing contact, integrations, and workspace-wide features.

16. **View Team Analytics** - Access team-level dashboards showing collective metrics, team performance, and productivity indicators.

17. **Manage Billing** - View subscription details, usage metrics, manage payment methods, and handle invoicing.

18. **View API Logs** - Monitor API access, integration activities, and troubleshoot integration issues.

19. **Configure Integrations** - Enable/disable third-party integrations (Zapier, Make, custom webhooks).

## SUPER ADMIN USE CASES (15 Total)

1. **Monitor System Health** - Real-time monitoring of system performance, uptime, server status, and infrastructure health.

2. **View API Metrics** - Detailed API usage analytics, response times, error rates, and performance bottlenecks.

3. **Manage User Accounts** - Create, suspend, reactivate, or delete user accounts across the entire platform.

4. **View Audit Trail** - Comprehensive system-wide audit log of all user actions, system changes, and security events.

5. **Configure Security Policies** - Define password requirements, two-factor authentication, IP whitelisting, and security protocols.

6. **Manage API Keys** - Create, revoke, and manage API keys for third-party integrations and developer access.

7. **Configure AI Engine** - Select, configure, and fine-tune OCR and data extraction AI models.

8. **Select AI Model** - Choose from available AI models (e.g., Tesseract, custom-trained models) for different use cases.

9. **Train Custom AI Models** - Develop custom-trained models on domain-specific business card formats.

10. **Manage Subscription Plans** - Create, modify, and manage subscription tiers with feature sets and pricing.

11. **View Revenue Reports** - Access financial dashboards showing subscription revenue, churn, and customer metrics.

12. **Configure Payment Gateway** - Set up payment processing integrations (Stripe, PayPal) and billing automation.

13. **Setup Database Backups** - Configure automated backup schedules, retention policies, and disaster recovery procedures.

14. **Manage 3rd Party Integrations** - Oversee all platform-level integrations, API endpoints, and external system connections.

15. **View System Logs** - Access detailed system logs for debugging, monitoring, and security analysis.

## GUEST USER USE CASES (14 Total)

1. **Create Booking** - External users create appointment/meeting bookings through a public-facing calendar interface.

2. **View Calendar Availability** - Check available time slots on the booking calendar.

3. **Select Time Slot** - Choose a specific date and time for the appointment booking.

4. **Enter Contact Information** - Provide name, email, phone, company, and other required contact details.

5. **Confirm Booking** - Finalize the booking with confirmation message and details.

6. **Receive ICS File** - Automatically receive calendar invitation file (iCalendar format) for the booking.

7. **Access Scan Kiosk** - External guest users access a dedicated kiosk application for scanning business cards.

8. **Scan Card at Kiosk** - Capture business card images using kiosk camera hardware.

9. **Upload Card Image** - Upload previously captured or existing card image file through kiosk interface.

10. **Take Photo** - Use kiosk camera to photograph an additional card or document.

11. **View Extracted Data** - See OCR-extracted data from the scanned card on kiosk display.

12. **Edit Extracted Fields** - Make corrections to extracted data before submission.

13. **Submit Data** - Submit the scanned card data to the IntelliScan system.

14. **View Help & Documentation** - Access kiosk-specific help and on-screen guidance.

## USE CASE RELATIONSHIPS & CONSTRAINTS

**Include Relationships (Dependencies):**
- Scan Card INCLUDES Review Extracted Data - must review before saving
- Search Contacts INCLUDES View Contact Details - searching leads to viewing results
- Create Email Campaign INCLUDES Send Email Campaign - creation must precede sending
- Setup CRM Integration INCLUDES Map CRM Fields - configuration requires field mapping
- View Team Analytics INCLUDES View Activity Log - analytics depend on activity data
- Manage Team Members INCLUDES Assign Roles & Permissions - member addition requires role assignment

**Extend Relationships (Optional Extensions):**
- Send Email Campaign EXTENDS Manage Contacts - campaign target is contact list
- Track Email Engagement EXTENDS Send Email Campaign - tracking follows email sending
- Manage Billing EXTENDS Manage Workspace Settings - billing part of workspace config
- Configure Automation Rules EXTENDS Manage Contacts - automation operates on contacts

**Actor Relationships:**
- End User interacts with personal card scanning and contact features
- Business Admin supervises End Users and manages team-level operations
- Super Admin oversees Business Admins and platform infrastructure
- Guest User has minimal, restricted interaction with public booking/kiosk features
- CRM System exchanges data asynchronously with the platform

## LAYOUT & STYLING REQUIREMENTS

1. **System Boundary:** Large rectangle with "IntelliScan System" label, dashed border style
2. **Actor Positioning:** Place all 5 actors on the left side of the diagram in vertical arrangement
3. **Color Coding:** Apply specified colors to actors for easy visual distinction
4. **Use Case Organization:** Group use cases by type/actor responsibility from left to right
5. **Connection Lines:** Use solid lines for primary associations, dashed lines for include/extend relationships
6. **Label Clarity:** Label all relationships with include/extend keywords where applicable

## PROFESSIONAL REQUIREMENTS
- Create publication-quality diagram suitable for technical documentation
- Ensure all text is clearly legible
- Maintain consistent spacing and alignment
- Use standard UML notation conventions
- Include legend identifying relationship types
