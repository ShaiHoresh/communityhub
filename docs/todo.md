Implementation Roadmap (TODO List)
Phase 1: Foundation & RTL Setup
[x] Initialize Next.js project with Tailwind CSS RTL support.

[x] Setup households and users tables with foreign key relationships.

[x] Implement Multi-Manager logic (Spouses can both manage one Household).

[x] Build "Request Access" flow with Admin approval dashboard.

[x] Authentication: Email/Password registration and sign-in (with password hashing and secure session management).

[x] Pending State UI: Dedicated "Waiting for Admin Approval" screen for signed-in users in PENDING state (no access to member areas until promoted).

[x] Sign-out: Implement sign-out flow and clear session.

[x] Password Reset: Implement forgot-password / password-reset flow (e.g. email link or provider flow).

Phase 2: The Prayer & Schedule Engine
[x] Create locations table (Name, Max Capacity).

[x] Build Hebcal API integration with daily server-side caching.

[x] Implement the Seasonal Shift Logic for Shabbat Mincha (15-min increments).

[x] Create the "24-Hour Dashboard" for the landing page.

Phase 3: Directory, Gmach & Life Events
[x] Build the Directory with Tag filtering and privacy toggles.

[x] Build the Gmach Board: Implement category-based color coding and Committee priority pinning.

[x] Implement Life Events Registry: Form for Births/Yahrzeits; logic for calculating upcoming dates.

Phase 4: Financial & Project Architecture
[ ] Build the projects table for financial tracking.

[ ] Create an Admin interface to log Expenses and Income per project.

[ ] Prepare the "Payment Gateway" placeholder (ready for external API integration).

Phase 4b: Admin Dashboard UI/UX (Control Tower)
[ ] Admin layout: Sidebar-based navigation with main content area (all Admin routes).

[ ] Admin Overview: KPI stats (Total Members, Pending Requests, Active Projects balance, Seasonal Modules state).

[ ] User Queue tab: List of PENDING users with Approve and Reject buttons.

[ ] Schedule Manager tab: Calendar/list view to CRUD prayers and lessons (including Shabbat Mincha logic support).

[ ] Finance Hub tab: Project creation, income/expense logging, and General Ledger view.

[ ] System Toggles: Settings page with switches to enable/disable Rosh Hashanah and Purim modules.

Phase 5: Seasonal Modules
[ ] High Holidays: Build seat registration with real-time capacity checks.

[ ] Purim: Build tiered selection UI with specific validation (Max 5 or Max 20).

[ ] Build the "Recipient Aggregator" report for Admin.

Phase 6: PWA & Polish
[ ] Configure next-pwa for manifest, icons, and offline caching.

[ ] Final Hebrew translation/string audit for all UI components.

[ ] Export to Excel functionality for all Admin tables.