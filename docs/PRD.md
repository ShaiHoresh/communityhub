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

Guest: Landing page only; requires Admin approval to become a Member.

Member: Access to Directory, Gmach, and Registration.

Admin: Full system control, financial management, and user approval.

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
Landing Page: Community welcome, 24-hour "Next Up" schedule, "Highlights" board, and Login/Register.

Detailed Schedule: Weekly/Monthly view with date navigation and location/teacher details.

Gmach Board: Filterable grid of community requests/offers.

Admin Command Center: User approval queue, Finance/Project dashboard, and Module toggles.

6. Technical Specifications
Frontend: Next.js (RTL support is priority #1).

Backend: Supabase/Firebase for Real-time Auth and Database.

PWA: Service workers for "Offline First" access to the prayer schedule.

Language: Primary UI is Hebrew. Code/Documentation is English.