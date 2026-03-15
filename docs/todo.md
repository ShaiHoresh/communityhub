Implementation Roadmap (TODO List)
Phase 1: Foundation & RTL Setup
[x] Initialize Next.js project with Tailwind CSS RTL support.

[x] Setup households and users tables with foreign key relationships.

[x] Implement Multi-Manager logic (Spouses can both manage one Household).

[x] Build "Request Access" flow with Admin approval dashboard.

Phase 2: The Prayer & Schedule Engine
[x] Create locations table (Name, Max Capacity).

[x] Build Hebcal API integration with daily server-side caching.

[x] Implement the Seasonal Shift Logic for Shabbat Mincha (15-min increments).

[x] Create the "24-Hour Dashboard" for the landing page.

Phase 3: Directory, Gmach & Life Events
[ ] Build the Directory with Tag filtering and privacy toggles.

[ ] Build the Gmach Board: Implement category-based color coding and Committee priority pinning.

[ ] Implement Life Events Registry: Form for Births/Yahrzeits; logic for calculating upcoming dates.

Phase 4: Financial & Project Architecture
[ ] Build the projects table for financial tracking.

[ ] Create an Admin interface to log Expenses and Income per project.

[ ] Prepare the "Payment Gateway" placeholder (ready for external API integration).

Phase 5: Seasonal Modules
[ ] High Holidays: Build seat registration with real-time capacity checks.

[ ] Purim: Build tiered selection UI with specific validation (Max 5 or Max 20).

[ ] Build the "Recipient Aggregator" report for Admin.

Phase 6: PWA & Polish
[ ] Configure next-pwa for manifest, icons, and offline caching.

[ ] Final Hebrew translation/string audit for all UI components.

[ ] Export to Excel functionality for all Admin tables.