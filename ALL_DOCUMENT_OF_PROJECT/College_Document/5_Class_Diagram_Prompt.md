# CLASS DIAGRAM PROMPT FOR DRAW.IO

Create a comprehensive UML Class Diagram for the IntelliScan system showing all major data model classes, their attributes, methods, relationships, and cardinality.

## OVERVIEW
This class diagram represents the core data model and business logic of the IntelliScan platform. It shows the entity-relationship structure with proper Object-Oriented design principles, including inheritance where appropriate and detailed attribute/method specifications for each class.

## CLASS DEFINITIONS

### CLASS 1: User

**Purpose:** Represents any user account in the IntelliScan system

**Attributes:**
- id: UUID {primary key, immutable}
- email: String {unique, not null, max length 255}
- password: String {hashed with bcrypt, never stored in plain text}
- firstName: String {not null, max 100 characters}
- lastName: String {not null, max 100 characters}
- avatarUrl: String {optional, URL to profile image}
- role: Enum {values: END_USER, BUSINESS_ADMIN, SUPER_ADMIN, GUEST}
- subscriptionPlan: Enum {values: FREE, PROFESSIONAL, BUSINESS, ENTERPRISE}
- subscriptionExpiresAt: DateTime {optional, null if active}
- isActive: Boolean {default: true}
- emailVerified: Boolean {default: false}
- twoFactorEnabled: Boolean {default: false}
- lastLoginAt: DateTime {nullable}
- lastLoginIp: String {nullable, IP address of last login}
- createdAt: DateTime {immutable, set on creation}
- updatedAt: DateTime {automatically updated}
- deletedAt: DateTime {nullable, soft delete marker}

**Methods:**
+ login(email: String, password: String): AuthToken throws InvalidCredentialsException
+ logout(): void
+ updateProfile(firstName: String, lastName: String, avatarUrl: String): void
+ changePassword(currentPassword: String, newPassword: String): void throws InvalidPasswordException
+ verifyEmail(verificationToken: String): void
+ enableTwoFactor(secret: String): void
+ disableTwoFactor(verificationCode: String): void
+ getWorkspaces(): List<Workspace>
+ getTeams(): List<Team>
+ getWorkspaceRole(workspaceId: UUID): Enum{MEMBER, MANAGER, ADMIN}
+ hasPermission(resource: String, action: String): Boolean
+ getTotalContactsScanned(): Int
+ getSubscriptionDetails(): SubscriptionDetails
+ resetPassword(email: String): void
+ validatePassword(password: String): Boolean
- validateEmail(email: String): Boolean

**Constraints:**
- Email must be unique across entire system
- Password must be at least 8 characters, contain uppercase, lowercase, digit, and special character
- Can only be soft-deleted (deletedAt timestamp set, not actually removed)

---

### CLASS 2: Workspace

**Purpose:** Represents a team/organization workspace with its own configuration, billing, and member management

**Attributes:**
- id: UUID {primary key}
- name: String {not null, max 200, unique per owner}
- domain: String {optional, custom domain like company.intelliscan.com}
- description: String {optional, max 1000}
- ownerId: UUID {foreign key to User}
- plan: Enum {values: FREE, PROFESSIONAL, BUSINESS, ENTERPRISE}
- billingEmail: String {not null}
- billingStatus: Enum {ACTIVE, SUSPENDED, CANCELLED}
- storageUsed: Long {in bytes}
- storageLimit: Long {in bytes, depends on plan}
- contactCountCurrent: Int {running total}
- contactCountLimit: Int {depends on plan}
- teamCount: Int {count of teams}
- memberCount: Int {count of active members}
- autoSyncEnabled: Boolean {default: false}
- autoSyncIntervalMinutes: Integer {default: 60, range 5-1440}
- dataRetentionDays: Integer {default: 365}
- createdAt: DateTime
- updatedAt: DateTime
- suspendedAt: DateTime {nullable}

**Methods:**
+ createTeam(name: String, description: String): Team
+ deleteTeam(teamId: UUID): void
+ getTeams(): List<Team>
+ getMembers(): List<User>
+ inviteUser(email: String, role: Enum): Invitation
+ removeUser(userId: UUID): void
+ updatePlan(newPlan: Enum): void
+ getStorageUsagePercent(): Float
+ getContactCountPercent(): Float
+ isStorageLimitExceeded(): Boolean
+ isContactLimitExceeded(): Boolean
+ getAvailableFeatures(): List<String>
+ generateBillingReport(startDate: DateTime, endDate: DateTime): BillingReport
+ updateSettings(settings: WorkspaceSettings): void
+ getAuditLog(filters: AuditFilters): List<AuditLog>

---

### CLASS 3: Team

**Purpose:** Represents a sub-group within a workspace for organizing members and distributing work

**Attributes:**
- id: UUID {primary key}
- workspaceId: UUID {foreign key}
- name: String {not null, max 100}
- description: String {optional, max 500}
- memberCount: Int {cached count for performance}
- assignedContactCount: Int {contacts specifically assigned to this team}
- createdBy: UUID {foreign key to User}
- createdAt: DateTime
- updatedAt: DateTime
- isActive: Boolean {default: true}

**Methods:**
+ addMember(userId: UUID, role: Enum): TeamMembership throws UserNotFoundException
+ removeMember(userId: UUID): void
+ updateMemberRole(userId: UUID, newRole: Enum): void
+ getMembers(): List<User>
+ getContacts(): List<Contact> {contacts assigned to team}
+ assignContact(contactId: UUID, assignedTo: UUID): void
+ reassignContacts(fromUserId: UUID, toUserId: UUID, contactIds: List<UUID>): void
+ deleteTeam(): void {cascades to team memberships but not contacts}
+ getPerformanceMetrics(): TeamMetrics {includes scans, contacts created, emails sent by team members}

---

### CLASS 4: Contact

**Purpose:** Represents a saved business contact extracted from a scanned business card

**Attributes:**
- id: UUID {primary key}
- userId: UUID {foreign key, original scanner}
- workspaceId: UUID {foreign key}
- firstName: String {not null, max 100}
- lastName: String {not null, max 100}
- email: String {unique combination with workspaceId, nullable}
- phone: String {normalized E.164 format, nullable}
- company: String {nullable, max 200}
- jobTitle: String {nullable, max 200}
- department: String {nullable, max 200}
- address: String {nullable, max 500}
- city: String {nullable}
- state: String {nullable}
- country: String {nullable}
- postalCode: String {nullable}
- website: String {nullable, must be valid URL}
- notes: String {optional field for admin notes, max 2000}
- tags: List<String> {array of category tags}
- source: Enum {CAMERA_SCAN, UPLOAD_SCAN, MANUAL_ENTRY, CRM_IMPORT, EMAIL_IMPORT}
- extractionConfidence: Float {0.0-1.0, overall OCR confidence}
- confidenceScores: Map<String, Float> {per-field confidence: firstName: 0.98, email: 0.95, ...}
- duplicatePotentialIds: List<UUID> {other contacts this might be duplicate of}
- crmSynced: Boolean {whether synced to CRM}
- crmContactId: String {nullable, ID in external CRM}
- crmProvider: Enum {nullable: SALESFORCE, HUBSPOT, PIPEDRIVE, CUSTOM}
- lastCrmSyncAt: DateTime {nullable}
- createdAt: DateTime
- createdBy: UUID {who created/scanned this contact}
- updatedAt: DateTime
- updatedBy: UUID {who last modified}
- mergedWith: UUID {nullable, if merged into another contact}
- isArchived: Boolean {default: false}
- archivedAt: DateTime {nullable}

**Methods:**
+ save(): void throws ValidationException
+ update(contactData: ContactData): void
+ delete(): void {soft delete}
+ permanentDelete(): void {requires admin}
+ merge(otherContactId: UUID): Contact throws ValidationException
+ unmerge(mergedContactId: UUID): void
+ export(format: Enum): String {formats: CSV, XLSX, VCARD, JSON}
+ addTags(newTags: List<String>): void
+ removeTags(tagsToRemove: List<String>): void
+ validateData(): ValidationResult
+ checkForDuplicates(): List<Contact>
+ getFullName(): String {convenience method}
+ getHistory(): List<ContactHistory>
+ getCampaignsParticipated(): List<Campaign>
+ syncToCRM(crmId: UUID): SyncResult
+ getEngagementMetrics(): EngagementMetrics

---

### CLASS 5: Card

**Purpose:** Represents a physical business card image and its extracted/processing metadata

**Attributes:**
- id: UUID {primary key}
- contactId: UUID {foreign key, the resulting contact}
- imageUrl: String {not null, S3 path to stored image}
- imageThumbnailUrl: String {small preview image}
- imageSize: Long {file size in bytes}
- cardSide: Enum {FRONT, BACK, MULTIPLE}
- imageQuality: Float {0.0-1.0, based on noise level and clarity}
- orientation: Integer {0, 90, 180, 270 degrees}
- extractedRawText: String {unstructured OCR output}
- rawOcrData: JSON {detailed OCR response with bounding boxes}
- processingStatus: Enum {PENDING, PROCESSING, COMPLETED, FAILED, MANUAL_REVIEW}
- processingErrorCode: String {nullable, error if status is FAILED}
- processingErrorMessage: String {nullable, user-friendly error description}
- processingStartedAt: DateTime
- processingCompletedAt: DateTime {nullable}
- processingDurationMs: Long {milliseconds to process}
- aiModelVersion: String {e.g., "ocr-v2.1", "extraction-v3.2"}
- ocrEngine: String {e.g., "tesseract-5.0", "google-vision-api"}
- detectedLanguage: String {ISO 639-1 code, e.g., "en", "es"}
- confidence: Float {0.0-1.0}
- batchId: UUID {nullable, if part of bulk upload}
- uploadedAt: DateTime
- uploadedBy: UUID {foreign key to User}
- scannedAt: DateTime {when card was actually scanned/captured}
- isManuallyReviewed: Boolean {default: false}
- reviewedBy: UUID {nullable, user who reviewed}
- reviewNotes: String {nullable}

**Methods:**
+ extractData(): ContactData throws ExtractionException
+ getConfidenceScores(): Map<String, Float>
+ retryProcessing(): void
+ markForManualReview(): void
+ approveExtraction(reviewer: UUID, notes: String): Contact
+ rejectExtraction(reviewer: UUID, reason: String): void
+ getPreviewUrl(size: Enum): String {SIZE: THUMBNAIL, SMALL, MEDIUM, LARGE}
+ deleteImage(): void
+ updateProcessingStatus(newStatus: Enum): void
- validateImageFormat(imagePath: String): Boolean

---

### CLASS 6: Campaign

**Purpose:** Represents an email marketing campaign for bulk outreach to contacts

**Attributes:**
- id: UUID {primary key}
- workspaceId: UUID {foreign key}
- createdBy: UUID {foreign key to User}
- name: String {not null, max 200}
- subject: String {not null, max 200}
- bodyHtml: String {email body in HTML}
- bodyText: String {plain text fallback}
- templateId: UUID {nullable, link to email template}
- emailProvider: Enum {INTERNAL, SENDGRID, AWSSES, MAILGUN}
- status: Enum {DRAFT, SCHEDULED, SENDING, SENT, PAUSED, CANCELLED, ARCHIVED}
- scheduledFor: DateTime {nullable, if scheduled}
- sentAt: DateTime {nullable}
- cancelledAt: DateTime {nullable}
- recipientFilters: JSON {e.g., {tag: ["vip"], company: "Tech*", createdAfter: "2026-01-01"}}
- recipientCount: Int {count of recipients matched by filters}
- personalizationTokens: JSON {e.g., {{firstName}}, {{company}}, {{website}}}
- unsubscribeUrl: String {for CAN-SPAM compliance}
- preferenceCenterUrl: String {for GDPR compliance}
- trackingPixelEnabled: Boolean {default: true}
- trackingLinksEnabled: Boolean {default: true}
- sentCount: Int {emails actually sent}
- deliveredCount: Int {successfully delivered}
- bounceCount: Int {hard/soft bounces}
- openCount: Int {unique opens}
- clickCount: Int {unique clicks}
- conversionCount: Int {tracked conversions}
- unsubscribeCount: Int {people who unsubscribed}
- complainCount: Int {spam complaints}
- createdAt: DateTime
- updatedAt: DateTime

**Methods:**
+ create(): Campaign throws ValidationException
+ schedule(scheduledTime: DateTime): void
+ send(): CampaignResult
+ pause(): void
+ resume(): void
+ cancel(): void
+ archive(): void
+ getMetrics(): CampaignMetrics {returns open_rate, click_rate, etc.}
+ getRecipientList(): List<Contact>
+ getEngagementTimeline(): List<EngagementEvent>
+ trackOpens(): List<OpenEvent> {from tracking database}
+ trackClicks(): List<ClickEvent>
+ getTopClickedLinks(): List<LinkMetrics>
+ getUnsubscribeList(): List<Contact>
+ getComplaints(): List<Contact>
+ getFailedDeliveries(): List<FailedDelivery>
+ duplicate(): Campaign {create copy with new ID}
+ generateReport(format: Enum): String {PDF, HTML, CSV}

---

### CLASS 7: CRMIntegration

**Purpose:** Configuration for connecting and syncing contacts with external CRM systems

**Attributes:**
- id: UUID {primary key}
- workspaceId: UUID {foreign key}
- provider: Enum {SALESFORCE, HUBSPOT, PIPEDRIVE, CUSTOM, ZOHO}
- apiKey: String {encrypted, never returned in API responses}
- apiSecret: String {encrypted}
- refreshToken: String {encrypted, for OAuth providers}
- accessToken: String {encrypted}
- tokenExpiresAt: DateTime
- instanceUrl: String {Salesforce-specific, e.g., "https://na1.salesforce.com"}
- organizationId: String {nullable, provider-specific org ID}
- syncStatus: Enum {CONNECTED, CONNECTING, DISCONNECTED, ERROR}
- lastSyncAt: DateTime {nullable}
- lastSyncError: String {nullable}
- syncErrorCode: String {nullable, e.g., "AUTH_EXPIRED", "API_LIMIT_EXCEEDED"}
- nextScheduledSyncAt: DateTime
- autoSyncEnabled: Boolean {default: false}
- syncDirection: Enum {values: PUSH_TO_CRM, PULL_FROM_CRM, BIDIRECTIONAL}
- syncIntervalMinutes: Integer {range: 5-1440, default: 60}
- fieldMappings: JSON {e.g., {intelliscan_firstName: "FirstName__c", intelliscan_email: "Email", ...}}
- customFieldMappings: JSON {for custom fields}
- syncContactStatus: Enum {CREATE_NEW, UPDATE_EXISTING, CREATE_AND_UPDATE}
- testConnectionStatus: Boolean {last test result}
- testConnectionAt: DateTime {when connection was last tested}
- createdAt: DateTime
- createdBy: UUID
- updatedAt: DateTime
- deletedAt: DateTime {nullable, soft delete}

**Methods:**
+ authenticate(): Boolean throws AuthenticationException
+ testConnection(): ConnectionTest
+ pushContacts(contacts: List<Contact>): SyncResult throws SyncException
+ pullContacts(): List<Contact> throws SyncException
+ syncSchedule(): void {begins automatic sync}
+ stopAutoSync(): void
+ getFieldMappings(): Map<String, String>
+ updateFieldMappings(mappings: Map<String, String>): void
+ validateFieldMapping(mapping: Map): ValidationResult
+ getLastSyncReport(): SyncReport
+ rescueSync(syncId: UUID): void {retry failed sync}
+ disconnect(): void
+ reconnect(): void
+ refreshAccessToken(): void throws TokenRefreshException
- encryptCredentials(credentials: Credentials): String

---

### CLASS 8: AIModel

**Purpose:** Represents available AI/ML models for OCR and data extraction

**Attributes:**
- id: UUID {primary key}
- name: String {e.g., "Tesseract 5.0", "CustomOCR v3.2"}
- modelType: Enum {OCR, DATA_EXTRACTION, DUPLICATE_DETECTION, SPELLCHECK}
- version: String {semantic version, e.g., "2.1.0"}
- provider: Enum {INTERNAL, GOOGLE_VISION, AZURE_COGNITIVESERVICES, AWS_REKOGNITION}
- accuracyScore: Float {0.0-1.0, benchmarked score}
- processingTimeMs: Integer {average milliseconds to process one image}
- language: String {language supported, "en" for English, "multi" for multiple}
- isActive: Boolean {whether this model is currently in use}
- isPrimary: Boolean {is this the default model for its type}
- configuration: JSON {model-specific settings}
- trainingDataSize: Integer {approximate number of cards used for training}
- trainedAt: DateTime
- trainedBy: UUID {nullable, internal trainer}
- lastUpdatedAt: DateTime
- performanceMetrics: JSON {precision, recall, f1-score broken down by fields}
- supportedLanguages: List<String> {e.g., ["en", "es", "fr", "de"]}
- costPerInference: Float {cents per image processed, for pricing}
- createdAt: DateTime

**Methods:**
+ extractData(imageData: Bytes, language: String): ExtractionResult
+ validateData(data: ContactData): ValidationResult
+ updateModel(trainingData: Dataset): void
+ getAccuracy(): Float
+ getAccuracyByField(): Map<String, Float> {per-field accuracy}
+ benchmark(): BenchmarkResult
+ getPerformanceMetrics(): PerformanceMetrics
+ isExperimental(): Boolean
- optimizeModel(): void {internal method}

---

### CLASS 9: Analytics

**Purpose:** Records and aggregates system usage metrics and user engagement data

**Attributes:**
- id: UUID {primary key}
- workspaceId: UUID {foreign key}
- userId: UUID {nullable, if user-specific}
- metricName: String {e.g., "contacts_scanned", "campaigns_sent", "emails_opened"}
- metricType: Enum {COUNTER, GAUGE, HISTOGRAM, TIMER}
- metricValue: Float {numeric value}
- unit: String {e.g., "count", "seconds", "bytes"}
- dimensions: JSON {breakdown by category, e.g., {source: "camera", quality: "high"}}
- timestamp: DateTime {when metric was recorded}
- recordedAt: DateTime {when record was created}
- aggregationLevel: Enum {HOURLY, DAILY, WEEKLY, MONTHLY}

**Methods:**
+ recordMetric(name: String, value: Float, dimensions: JSON): void
+ incrementMetric(name: String, by: Float): void
+ getMetrics(metricName: String, filters: MetricFilters): List<Metric>
+ getMetricsSummary(dateRange: DateRange): Map<String, Float>
+ getMetricTrend(metricName: String, timeframe: Enum): TrendData
+ generateReport(reportType: Enum, dateRange: DateRange): Report {PDF/HTML/CSV}
+ getDashboardData(dashboardType: Enum): DashboardData
+ getTopMetrics(limit: Int): List<MetricSummary>
+ getAnomalies(metricName: String, threshold: Float): List<Anomaly>

---

### CLASS 10: AuditLog

**Purpose:** Immutable log of all system actions for compliance and security auditing

**Attributes:**
- id: UUID {primary key}
- workspaceId: UUID {foreign key}
- userId: UUID {foreign key, who performed action}
- action: String {e.g., "create_contact", "delete_contact", "invite_user", "export_contacts"}
- resourceType: String {e.g., "Contact", "Campaign", "User", "Workspace"}
- resourceId: UUID {the affected resource ID}
- resourceName: String {human-readable name of resource}
- changesBefore: JSON {snapshot of data before change}
- changesAfter: JSON {snapshot of data after change}
- description: String {human-readable description of action}
- ipAddress: String {IP address of request}
- userAgent: String {browser/app user agent}
- status: Enum {SUCCESS, FAILURE}
- errorMessage: String {nullable, if status is FAILURE}
- timestamp: DateTime {when action occurred}
- durationMs: Long {milliseconds to complete action}

**Methods:**
+ log(action: String, resourceType: String, resourceId: UUID, changes: Changes): void
+ getAuditTrail(filters: AuditFilters): List<AuditLog>
+ getAuditTrailForUser(userId: UUID, dateRange: DateRange): List<AuditLog>
+ getAuditTrailForResource(resourceId: UUID): List<AuditLog>
+ generateComplianceReport(dateRange: DateRange): ComplianceReport
+ searchAuditLog(searchTerm: String): List<AuditLog>
+ exportAuditLog(dateRange: DateRange, format: Enum): String

---

## RELATIONSHIPS & CARDINALITY

### One-to-Many Relationships (1 → *)
1. **User → Contact**: One user creates many contacts
   - Representation: User.id references Contact.userId
   - Cardinality: (1) User has (*) Contacts

2. **User → Workspace**: One user owns/belongs to many workspaces
   - Representation: User.id references Workspace.ownerId or junction table
   - Cardinality: (1) User owns (*) Workspaces

3. **User → Team**: One user is a member of many teams
   - Representation: User.id references TeamMembership.userId
   - Cardinality: (1) User belongs to (*) Teams

4. **Workspace → Contact**: One workspace contains many contacts
   - Representation: Workspace.id references Contact.workspaceId

5. **Workspace → Team**: One workspace has many teams
   - Representation: Workspace.id references Team.workspaceId
   - Cardinality: (1) Workspace has (*) Teams

6. **Workspace → Campaign**: One workspace has many campaigns
   - Representation: Workspace.id references Campaign.workspaceId

7. **Workspace → Analytics**: One workspace generates many metrics
   - Representation: Workspace.id references Analytics.workspaceId

8. **Workspace → AuditLog**: One workspace has many audit events
   - Representation: Workspace.id references AuditLog.workspaceId

9. **Workspace → AIModel**: One workspace can use many AI models
   - Representation: Workspace.id references WorkspaceAIModel.workspaceId (junction)

10. **Workspace → CRMIntegration**: One workspace may have multiple CRM integrations
    - Representation: Workspace.id references CRMIntegration.workspaceId
    - Cardinality: (1) Workspace has (0..1 to *) CRMIntegrations (typically 1, but can be multiple for different CRM providers)

11. **Team → Contact**: One team is assigned many contacts
    - Representation: Team.id references ContactAssignment.teamId

12. **Contact → Card**: One contact may have multiple card images (front, back)
    - Representation: Contact.id references Card.contactId
    - Cardinality: (1) Contact has (1..*) Cards

13. **Contact → Campaign**: One contact participates in many campaigns
    - Representation: Contact.id references CampaignRecipient.contactId

14. **User → Campaign**: One user creates many campaigns
    - Representation: User.id references Campaign.createdBy

15. **User → AuditLog**: One user performs many actions
    - Representation: User.id references AuditLog.userId

### One-to-One Relationships (1 → 1)
1. **Contact → Card** (Primary Card): Each contact may have a primary/featured card
   - Representation: Contact.primaryCardId references Card.id (nullable)

2. **User → Workspace** (Default Workspace): Each user may have a default workspace
   - Representation: User.defaultWorkspaceId references Workspace.id (nullable)

### Self-Referential Relationships
1. **Contact → Contact** (Merge): When contacts are merged
   - Representation: Contact.mergedWith references another Contact.id
   - Meaning: This contact was merged into another

2. **Contact → Contact** (Duplicates): Potential duplicates tracking
   - Representation: ContactDuplicate junction table with two contact IDs

### Junction/Bridge Tables (Implicit)
1. **WorkspaceMember** table
   - Fields: workspaceId, userId, role, invitedAt, joinedAt
   - Cardinality: Many users in many workspaces

2. **TeamMember** table
   - Fields: teamId, userId, role, joinedAt
   - Cardinality: Many users in many teams

3. **CampaignRecipient** table
   - Fields: campaignId, contactId, status (sent/opened/clicked), sentAt, openedAt
   - Cardinality: Many contacts receive many campaigns

4. **ContactAssignment** table
   - Fields: contactId, userId/teamId, assignedAt, assignedBy
   - Cardinality: Contacts assigned to team members

5. **WorkspaceAIModel** table
   - Fields: workspaceId, aiModelId, isPrimary, enabledAt
   - Cardinality: Workspaces use multiple AI models

---

## INHERITANCE HIERARCHIES

**User Specialization** (Optional, can represent as role enum instead):
- User
  ├── EndUser (role = END_USER)
  ├── AdminUser (role = BUSINESS_ADMIN)
  ├── SuperAdminUser (role = SUPER_ADMIN)
  └── GuestUser (role = GUEST)

Can be modeled either as:
- **Single table inheritance**: User table with role column
- **Class table inheritance**: Separate EndUser, AdminUser, etc. tables
- **Joined table inheritance**: User + UserSpecialization tables

Recommended: Single table inheritance (simplest, most flexible)

---

## CONSTRAINTS & VALIDATIONS

### Primary Key Constraints
- All ids are UUIDs (auto-generated)
- No business keys

### Unique Constraints
- User.email (unique across system)
- Contact.email + Contact.workspaceId (unique per workspace)
- Workspace.domain (if custom domain is used)
- Workspace.name + Workspace.ownerId (user can't have two workspaces with same name)

### Foreign Key Constraints
- All foreign key references are ON DELETE CASCADE or ON DELETE SET NULL as appropriate
- Contact deletion may trigger Card deletion (cascade)
- User deletion should preserve audit logs (SET NULL for userId)

### Domain/Business Constraints
- Contact.phone must be valid E.164 format if provided
- Contact.email must be valid email format if provided
- Contact.website must be valid URL if provided
- StorageLimit must be >= StorageUsed always
- ContactCountLimit must be >= ContactCountCurrent always

---

## DRAWING INSTRUCTIONS

1. **Layout**: Organize classes in a grid format with related classes close together
2. **Attributes**: Show data types clearly (String, UUID, Int, Float, Boolean, Enum, DateTime, JSON, List, Map)
3. **Methods**: Use + for public, - for private, # for protected
4. **Relationships**: 
   - Solid lines for composition/aggregation
   - Dashed lines for dependencies
   - Label with {multiplicity on left, cardinality on right}
5. **Color coding**: 
   - User/Auth classes: Blue
   - Contact/Card classes: Green
   - Campaign/Email classes: Red/Orange
   - Integration classes: Purple
   - Logging/Analytics classes: Yellow/Gray
6. **Information Density**: Consider multiple diagrams if too large (one per domain)
