# Algorithmic Concepts & DSA Mapping (The "LeetCode" Perspective)

IntelliScan isn't just a UI; it is backed by complex logic that solves real-world engineering challenges using classic Data Structures and Algorithms. Below is a mapping of project features to the related DSA/LeetCode concepts that would interest technical examiners.

---

## 1. Data Deduplication & Fuzzy Matching
**Feature:** The "Data Quality Center" identifies duplicate contacts even if names or company tags are spelled slightly differently.
-   **DSA Concept:** **String Manipulation / Edit Distance (Dynamic Programming)**
-   **Algorithm:** **Levenshtein Distance** is used to calculate the "cost" of turning one name into another.
-   **LeetCode Equivalent:** [LeetCode 72: Edit Distance](https://leetcode.com/problems/edit-distance/).
-   **Implementation Case:** "John Doe" vs "Jon Doe". The system calculates a similarity score (> 0.85) to trigger a merge suggestion.

## 2. API Rate Limiting
**Feature:** Restricting the number of scans or login attempts based on user tier (Free vs Enterprise).
-   **DSA Concept:** **Queue Management / HashMaps**
-   **Algorithm:** **Sliding Window Log** or **Token Bucket**.
-   **LeetCode Equivalent:** [LeetCode 362: Design Hit Counter](https://leetcode.com/problems/design-hit-counter/).
-   **Implementation Case:** Using a timestamp-based window stored in memory/Redis to ensure a Free user doesn't exceed 5 scans per minute.

## 3. Workflow Routing & State Machines
**Feature:** The AI Sequence engine moves a lead through "Scanned" $\rightarrow$ "Pending" $\rightarrow$ "Sent" $\rightarrow$ "Opened".
-   **DSA Concept:** **Directed Graphs / Finite State Machines (FSM)**
-   **LeetCode Equivalent:** [LeetCode 207: Course Schedule](https://leetcode.com/problems/course-schedule/) (Representing dependencies in follow-up tasks).
-   **Implementation Case:** Each state is a node. Certain actions (Scan) trigger transitions. We ensure no "cycles" (infinite email loops) exist in the campaign logic.

## 4. Multi-Tenant Role-Based Access Control (RBAC)
**Feature:** Determining if a user can access `/admin` vs `/workspace`.
-   **DSA Concept:** **Prefix Trees (Tries) / Set Logic**
-   **LeetCode Equivalent:** [LeetCode 208: Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/).
-   **Implementation Case:** Permission strings (e.g., `workspace.contacts.read`, `workspace.contacts.write`) are structured hierarchically. The Auth guard performs a lookup in $O(1)$ or $O(L)$ where $L$ is the depth of the permission flag.

## 5. Org Chart Visualization
**Feature:** Displaying the hierarchy of employees in an Enterprise workspace.
-   **DSA Concept:** **Trees / N-ary Trees (Depth First Search)**
-   **Algorithm:** **DFS (Pre-order Traversal)** to render parent/child relationships in UI.
-   **LeetCode Equivalent:** [LeetCode 559: Maximum Depth of N-ary Tree](https://leetcode.com/problems/maximum-depth-of-n-ary-tree/).

## 6. Background Job Scheduling
**Feature:** Sending 10,000 drip emails without freezing the main server.
-   **DSA Concept:** **Priority Queues / Min-Heaps**
-   **LeetCode Equivalent:** [LeetCode 23: Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) (Managing interleaved job streams).
-   **Implementation Case:** Jobs are queued with a `trigger_at` timestamp. The background daemon (Email Daemon) fetches the "Min" (earliest) timestamp to execute next.

---

### Technical Summary for Examiners
> "We didn't just use libraries; we implemented **Dynamic Programming** for data integrity (Deduplication), **Graph Theory** for campaign workflows, and **Tree Traversal** for organizational modeling."
