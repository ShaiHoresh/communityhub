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

Phase 1b: Database Setup (prioritized for early User Role testing: Admin, Member, Pending)
[x] Database Schema Design: Define and implement tables for `households`, `users` (with roles and pending status), `locations`, `prayers/lessons`, `projects`, and `gmach_posts`. Ensure foreign key relationships (e.g. `users.household_id`).

[x] Security & Roles (RLS): If using Supabase, implement Row Level Security (RLS) policies by role (`ADMIN`, `MEMBER`, `PENDING`, `GUEST`). Define who can see what (e.g. only Members see Directory; only Admins see Finance Hub).

[x] Development Seed Script: Create `seed.sql` or `seed.ts` that populates: one Admin user; one Member household with two users (Managers); one Pending user; sample prayer times; one sample project. Script must allow switching between users for immediate permission testing.

[x] Database Documentation: Add `docs/DATABASE.md` (or `DATABASE.md` in project root) describing table structures and relationships.

Supabase rollout (replace in-memory stores):
[x] Create Supabase project + run `scripts/schema.sql` and `scripts/rls.sql` in SQL Editor.
[x] Add Supabase env vars to `.env` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
[x] Implement server helpers (`src/lib/supabase-admin.ts`).
[ ] Migrate in-memory stores (`access-requests`, `households`, `gmach`, `life-events`, `projects/transactions`, `purim`, `high-holidays`, `schedule-entries`) to Supabase tables.
[ ] Replace `/api/seed` to seed Supabase (or provide SQL seed).

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
[x] Build the projects table for financial tracking.

[x] Create an Admin interface to log Expenses and Income per project.

[x] Prepare the "Payment Gateway" placeholder (ready for external API integration).

Phase 4b: Admin Dashboard UI/UX (Control Tower)
[x] Admin layout: Sidebar-based navigation with main content area (all Admin routes).

[x] Admin Overview: KPI stats (Total Members, Pending Requests, Active Projects balance, Seasonal Modules state).

[x] User Queue tab: List of PENDING users with Approve and Reject buttons.

[x] Schedule Manager tab: Calendar/list view to CRUD prayers and lessons (including Shabbat Mincha logic support).

[x] Finance Hub tab: Project creation, income/expense logging, and General Ledger view.

[x] System Toggles: Settings page with switches to enable/disable Rosh Hashanah and Purim modules.

Phase 5: Seasonal Modules
[x] High Holidays: Build seat registration with real-time capacity checks.

[x] Purim: Build tiered selection UI with specific validation (Max 5 or Max 20).

[x] Build the "Recipient Aggregator" report for Admin.

Accessibility:
[ ] Semantic structure: Audit pages for proper headings, landmarks (header/nav/main/footer), and descriptive labels.
[ ] Keyboard navigation: Ensure all interactive elements (buttons, tabs, cards, forms) are reachable and operable via keyboard only.
[ ] Color & contrast: Verify color contrast for text and controls meets WCAG AA; adjust palette or add outlines as needed.
[ ] ARIA & feedback: Add ARIA attributes and live regions where appropriate so errors and status changes are announced clearly.

Phase 6: PWA & Polish
[ ] Configure next-pwa for manifest, icons, and offline caching.

[ ] Final Hebrew translation/string audit for all UI components.

[ ] Export to Excel functionality for all Admin tables.