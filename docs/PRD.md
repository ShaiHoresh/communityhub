CommunityHub Product Requirements Document (PRD)
1. Executive Summary
CommunityHub is a comprehensive management platform (Web/PWA) for a Synagogue/Community Center. It serves three primary purposes:

Utility: Real-time prayer/lesson schedules.

Community: Member directory, life events (Yahrzeits), and a peer-to-peer Gmach (community help).

Logistics & Finance: Project-based financial tracking, holiday seat registration, and seasonal community projects (Purim).

2. System Architecture & Permissions
2.1 The Household vs. User Model
Household (Core Entity): The primary unit for billing, seat registration, and gifts. Contains a family name, address, and total balance.

User (Account Entity): Multiple users (e.g., spouses, adult children) can be linked to a single household_id.

Intra-Family Roles:

Household Manager: Full authority to register seats, pay dues, and update family data (Births/Deaths).

Household Member: View-only access to household details.

Global Roles:

Guest: Unauthenticated visitors are allowed on the site. They see only: (1) the next prayers (upcoming schedule), (2) a brief welcome note, and (3) Sign-in / Sign-up buttons. No Directory, Gmach, or member content. After signing up they enter the PENDING state until Admin approval to become a Member.

Member: Access to Directory, Gmach, and Registration.

Admin: Full system control, financial management, and user approval.

2.2 Authentication & Sign-in Flow (The "Gatekeeper")

Unified Auth: Registration includes creating credentials (Email + Password). There is no separate "request access" without an account; users register with email/password and are then placed in a pending state until approved.

The "Pending" State: A newly registered user is in a `PENDING` state. They can sign in with their credentials but will only see a dedicated "Waiting for Admin Approval" screen. No access to Directory, Gmach, Schedule, or other member areas until an Admin promotes them to `MEMBER` (e.g. by approving their access request or changing their status).

Security (Technical Stack): Authentication must use password hashing (e.g. bcrypt or the provider’s built-in secure hashing) and secure session management (HTTP-only cookies, CSRF protection, and short-lived or refreshable sessions as per the chosen auth provider).

3. Core Functional Modules
3.1 Hybrid Prayer & Lesson Engine
Logic: A mix of fixed times and sun-based (Zmanim) times via Hebcal API.

Caching Requirement: API data must be cached server-side once daily to prevent redundant calls and ensure speed.

Complex Shabbat Mincha Logic:

Winter: Set to Candle Lighting time.

Summer: Default to 18:00.

Transition: When sunset occurs earlier than the 18:00 threshold, the system must automatically shift the time earlier in 15-minute increments.

Location Tracking: Every event must be assigned a location_id (e.g., Main Sanctuary, Library).

3.2 Member Directory & Life Events
Directory: Searchable list of Households. Filters for Tags (e.g., Rabbi, Doctor, Volunteer).

Privacy: Members can toggle visibility for their specific phone/address.

Life Events (The Registry): Users can add/update Births, Weddings, and Yahrzeits (Anniversaries of death). The system calculates upcoming Yahrzeits (Hebrew/Gregorian) and notifies the Household Manager.

3.3 The Gmach (Community Help) Board
Function: A board for posting "Help Needed," "Help Offered," or "Items for Loan."

UI: Color-coded or distinct shapes based on category.

Priority: Admin/Committee posts are pinned to the top or highlighted with a "Priority" badge.

3.4 Project-Based Finance
Projects: Admin creates projects (e.g., "Building Fund," "Kiddush").

Ledger: Income (Donations) and Expenses are tagged to specific projects.

Integration: Architecture must support future API integration with external invoicing (e.g., Morning/iCount).

4. Seasonal Modules (Admin Toggled)
High Holiday Seats: Family-based registration. System monitors location capacity and prevents overbooking.

Purim (Mishloach Manot):

Tiers: "Full Community" (Fixed Price A), "20 Families" (Fixed Price B), "5 Families" (Fixed Price C).

Interface: Checkbox list of all community households.

Reporting: Admin generates a "Recipient List" showing every family who chose to give to them.

5. Screen Specifications
Guest Landing (unauthenticated): Next prayers only, a brief welcome note, and Sign-in / Sign-up buttons. No Directory, Gmach, or member-only content.

Member Landing (authenticated Members): Full dashboard (e.g. 24-hour "Next Up" schedule, highlights, links to Directory, Gmach, Life Events, etc.).

Landing Page (summary): For guests: next prayers + welcome + Sign-in/Sign-up. For members: full community dashboard. For PENDING: dedicated "Waiting for Admin Approval" screen.

Detailed Schedule: Weekly/Monthly view with date navigation and location/teacher details.

Gmach Board: Filterable grid of community requests/offers.

Pending State Screen: Shown only to signed-in users in `PENDING` status; displays a clear "Waiting for Admin Approval" message with optional sign-out.

Admin Command Center: User approval queue, Finance/Project dashboard, and Module toggles (see Section 6).

6. Admin Interface (The "Control Tower")

Layout: A sidebar-based navigation with a main content area. The sidebar is visible on all Admin routes and provides quick access to overview and management sections.

Overview Stats (KPIs): A dashboard or top summary showing key metrics: Total Members, Pending Requests count, Active Projects balance (or total balance), and the current state of Seasonal Modules (e.g. Rosh Hashanah On/Off, Purim On/Off).

Management Tabs:

User Queue: A list of users in `PENDING` state with 'Approve' and 'Reject' actions. Approving promotes the user to `MEMBER` (and optionally associates them with a household). Rejecting keeps or marks them as rejected and they remain on the "Waiting for Admin Approval" experience when signed in.

Schedule Manager: A calendar and/or list view to Create, Read, Update, and Delete prayers and lessons. Must support the Shabbat Mincha seasonal logic (e.g. 15-minute increments, winter/summer rules) and assignment to locations.

Finance Hub: Project creation, income and expense logging per project, and a "General Ledger" view that aggregates transactions by project and over time.

System Toggles: A simple Settings page with switches to enable/disable the Rosh Hashanah (High Holidays) module and the Purim module. When disabled, the corresponding registration or selection UIs are hidden or disabled for members.

7. Technical Specifications
Frontend: Next.js (RTL support is priority #1).

Backend: Supabase/Firebase for Real-time Auth and Database.

Auth & Security: Password hashing (e.g. bcrypt or provider default) and secure session management (HTTP-only cookies, CSRF protection, refresh/session strategy as per provider).

PWA: Service workers for "Offline First" access to the prayer schedule.

Language: Primary UI is Hebrew. Code/Documentation is English.