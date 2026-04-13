# 🔀 Lead Routing Engine & Automation Rules

> **Page Route**: `/workspace/routing`  
> **Component**: `RoutingRulesPage.jsx`  
> **Access Level**: Enterprise Admin

---

## 📖 Overview
The Lead Routing Engine is a no-code "If/Then" automation builder. Admins configure rules based on AI-extracted fields (Industry, Seniority, Job Title, Confidence Score) and assign actions like auto-tagging, rep assignment, priority flagging, or Slack notifications. When rules are run, the engine evaluates every contact in the workspace against the active rule set.

---

## 🛠️ Technical Workflow

### 1. Rule Configuration
- **Condition Fields** (7 available): Job Title, Company, Industry (AI), Seniority (AI), Email Domain, Phone Prefix, Confidence Score.
- **Operators** (6 available): Contains, Equals, Starts with, Does not contain, Greater than, Less than.
- **Actions** (4 available): Assign to Rep, Auto-Tag, Flag as Priority, Send Notification.
- **Priority Levels**: Each rule has a High/Medium/Low priority with color-coded badges.

### 2. Rule Persistence & Execution
- **Save**: `POST /api/routing-rules` persists the entire rule array.
- **Run**: `POST /api/routing-rules/run` evaluates all contacts against active rules.
- **Match Log**: After execution, the system returns a log of which contacts matched which rules, showing the action taken and the target.

### 3. Live Stats
- **Leads Routed**: Total contacts matched by any rule.
- **Auto-Tagged**: Contacts that received an automatic tag.
- **Flagged Priority**: Contacts marked as high-priority for immediate follow-up.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `contacts` table | Database | All contacts are evaluated against the rule set |
| `PipelinePage` | Feature | Routing rules can move contacts into specific pipeline stages |
| `MembersPage` | Data | "Assign to Rep" action references workspace member names |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Zero-Touch Lead Distribution** | New scans are automatically assigned to the right rep |
| **AI-Powered Conditions** | Rules use Gemini-inferred fields like Industry and Seniority |
| **Compliance Tagging** | Automatically tags contacts for GDPR or region-specific handling |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `routing_rules` | INSERT/SELECT/UPDATE | Full CRUD for rule configurations |
| `contacts` | SELECT/UPDATE | Reads all contacts; updates `assigned_to`, `tags`, `priority` on match |
| `routing_logs` | INSERT | Records each match for audit and reporting |
