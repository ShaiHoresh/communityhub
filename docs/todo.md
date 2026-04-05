# CommunityHub — Implementation Status

---

## Completed Phases

### Phase 1: Foundation & RTL Setup ✅
- [x] Next.js project with Tailwind CSS RTL support
- [x] Households and users tables with FK relationships
- [x] Multi-Manager logic (both spouses manage one household)
- [x] "Request Access" flow with Admin approval dashboard
- [x] Authentication: Email/Password (bcrypt hashing, NextAuth.js JWT sessions)
- [x] Pending State UI: "Waiting for Admin Approval" screen
- [x] Sign-out flow
- [x] Password Reset placeholder (forgot-password page)

### Phase 1b: Database & Supabase ✅
- [x] Schema design: households, users, locations, schedule_entries, projects, gmach, etc.
- [x] Row Level Security (RLS) policies by role (GUEST, PENDING, MEMBER, ADMIN)
- [x] Development seed script (`/api/seed` → admin, member, pending test users)
- [x] DATABASE.md documentation
- [x] Full Supabase migration (all tables)

### Phase 2: Prayer & Schedule Engine ✅
- [x] Locations table (name, max capacity, space category)
- [x] Hebcal Zmanim API integration with daily server-side caching
- [x] Three time calculation modes: FIXED, ZMANIM_BASED, DYNAMIC_OFFSET
- [x] Day-type applicability: weekday, shabbat, holiday, specific_date
- [x] Seasonal rules: always, winter_only, summer_only
- [x] Rounding logic (round to nearest N minutes)
- [x] Manual overrides table (cancel or reschedule per date)
- [x] "24-Hour Dashboard" on the homepage with next-up highlight

### Phase 3: Directory, Gmach & Life Events ✅
- [x] Directory with tag filtering and privacy toggles
- [x] Gmach Board with category color-coding and committee priority pinning
- [x] Life Events registry (births/yahrzeits)

### Phase 4: Financial & Project Architecture ✅
- [x] Projects table for financial tracking
- [x] Admin interface for income/expense logging per project
- [x] Payment gateway placeholder (architecture ready)

### Phase 4b: Admin Dashboard (Control Tower) ✅
- [x] Sidebar-based admin layout
- [x] Overview KPIs (members, pending, projects, seasonal modules)
- [x] User Queue (approve/reject pending users)
- [x] Schedule Manager with full CRUD (day types, time modes, zmanim, rounding)
- [x] Location Manager (CRUD with capacity and space category)
- [x] Finance Hub (projects, transactions, ledger)
- [x] High Holidays Manager (prayer list, registration report)
- [x] Purim Recipient Aggregator report
- [x] System Toggles (Rosh Hashanah, Purim modules)

### Phase 5: Seasonal Modules ✅
- [x] High Holidays: per-household seat registration with per-prayer men/women sections
- [x] Purim: tiered selection (full/20/5) with household recipient checklist
- [x] Recipient Aggregator admin report

### Phase 6: PWA & Polish ✅
- [x] next-pwa configuration (manifest, icons, offline caching)
- [x] PWA installability (Chrome)
- [x] Hebrew translation audit for all UI components
- [x] Excel export for all admin tables

### Refactoring (R1–R7) ✅
- [x] **R1**: Household model cleanup — re-keyed registrations from user_id to household_id
- [x] **R2**: DB layer type safety — typed rows, unwrap helpers, deduplicated types
- [x] **R3**: Server action standardization — ActionResult type, parseForm helpers, safeAction wrapper
- [x] **R4**: Shared UI components — FormFeedback, FilterTabs, BackLink, CSS utility classes
- [x] **R5**: Performance — N+1 fix, Promise.all parallelization across 4 pages
- [x] **R6**: Error handling — error.tsx, global-error.tsx, safeAction try/catch
- [x] **R7**: Config hygiene — Tailwind single source of truth, unified PrayerType

### Accessibility ✅
- [x] Semantic HTML structure (headings, landmarks, labels)
- [x] Keyboard navigation for all interactive elements
- [x] WCAG AA color contrast
- [x] ARIA attributes and live regions for feedback

---

## Phase 7: Design & Layout Unification ✅

### 7a: Global Header ✅
- [x] `GlobalHeader` component exists: logo + site name + Hebrew date + Shabbat times + auth buttons.
- [x] Integrated into the root `layout.tsx` — every page now inherits the GlobalHeader automatically.
- [x] RTL-aware: logo on the right, auth actions on the left. Responsive (compact on mobile).

### 7b: Action Consistency ✅
- [x] Removed `BrandHeader` from all content pages — replaced with `PageHeading` inside `<main>`.
- [x] All pages using `BackLink` are consistent.
- [x] Admin pages follow a consistent pattern: h1 title top-right, secondary actions top-left, forms below.

### 7c: Landing Page Banner Fix ✅
- [x] Replaced the tall `BrandHeader` hero with a compact gradient card (~120px, well-proportioned).
- [x] Content preserved: community name + contextual tagline + brand gradient.
- [x] No more sticky double-header on the homepage.

---

## Phase 8: Content Modules

### 8a: Mazal Tov Board
- [ ] DB: Create `mazal_tov` table (`id`, `event_type`, `name`, `message`, `date`, `created_at`).
- [ ] RLS: MEMBER+ read, ADMIN write.
- [ ] Admin UI: CRUD form in Admin Control Tower → Content Manager section.
- [ ] Member UI: Featured section on the Member landing page (recent 30 days, card-based, festive styling).
- [ ] Schema + migration script.

### 8b: D'var Torah (Weekly Torah Insight)
- [ ] DB: Create `dvar_torah` table (`id`, `title`, `author`, `body`, `parasha`, `date`, `created_at`).
- [ ] RLS: Public read (latest entry on Guest landing as preview), ADMIN write.
- [ ] Admin UI: CRUD form in Content Manager.
- [ ] Homepage: Collapsible card showing the most recent D'var Torah (Member view).
- [ ] Page: `/dvar-torah` archive page listing past entries (Member access).
- [ ] Schema + migration script.

### 8c: Community Announcements
- [ ] DB: Create `announcements` table (`id`, `title`, `body`, `is_pinned`, `expires_at`, `created_at`).
- [ ] RLS: Public read, ADMIN write.
- [ ] Admin UI: CRUD form in Content Manager (with expiry date picker and pin toggle).
- [ ] Homepage: Active announcements displayed as banner/card stack (visible to Guests and Members).
- [ ] Auto-hide expired announcements from homepage; keep in archive.
- [ ] Schema + migration script.

### 8d: "Meet the Family" Spotlight
- [ ] DB: Create `meet_the_family` table (`id`, `household_id` → FK, `bio`, `photo_url`, `is_active`, `created_at`).
- [ ] RLS: MEMBER+ read, ADMIN write.
- [ ] Admin UI: Select household from dropdown, write bio text, toggle active (only one active at a time).
- [ ] Member UI: Featured card on the Member landing page with family name, bio, and optional photo.
- [ ] Schema + migration script.

---

## Phase 9: New Pages

### 9a: Contact Us
- [ ] DB: Create `contact_messages` table (`id`, `user_id` nullable, `name`, `email`, `subject`, `message`, `created_at`).
- [ ] RLS: MEMBER+ insert, ADMIN read all.
- [ ] Page: `/contact` with a contact form (name, email, subject, message). Auto-fill name/email if signed in.
- [ ] Server action to submit the form.
- [ ] Admin UI: View contact messages in Admin Control Tower (list with subject, date, read/unread status).
- [ ] Schema + migration script.

### 9b: Gallery (FUTURE — Architecture Only)
- [ ] **Do not implement now.** Design the table structure for future use:
  - `gallery_albums` table (`id`, `title`, `event_date`, `description`, `created_at`).
  - `gallery_photos` table (`id`, `album_id` → FK, `storage_path`, `caption`, `sort_order`).
  - Supabase Storage bucket: `gallery`.
- [ ] RLS plan: MEMBER+ read, ADMIN write.
- [ ] Document in DATABASE.md as a planned table (not yet created).

---

## Remaining / Ongoing

### Prayer Engine Enhancements
- [ ] Holiday detection via Hebcal Calendar API (auto-filter entries with `day_types = holiday`)
- [ ] Admin UI for managing schedule_overrides (table exists, CRUD actions ready, UI not built)
- [ ] Weekly/monthly schedule view (currently only "24-hour" dashboard)

### Features
- [ ] Hebrew date display (Gregorian ↔ Hebrew calendar conversion)
- [ ] Yahrzeit notification system (email/push when upcoming)
- [ ] Payment gateway integration (iCount / Morning API)
- [ ] User profile editing (name, phone, directory tags, privacy toggles)
- [ ] Admin location capacity monitoring for High Holidays (overbooking prevention)

### Performance
- [ ] Consider `unstable_cache` for relatively static data (locations, schedule entries, system toggles)

### Infrastructure
- [ ] CI/CD pipeline
- [ ] Production deployment (Vercel + Supabase production project)
- [ ] Rate limiting for auth endpoints
