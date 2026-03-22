Refactoring Roadmap

Phase R1: Household Model Cleanup & Per-Household Registration

Current problem:
  Purim and High Holidays registrations are keyed on `user_id`, so if both spouses in a
  household register separately, seats are double-counted and Purim selections duplicate.
  `Household.memberIds` and `managerIds` are defined in the type but never populated (always `[]`).
  High Holidays stores `household_name` as free text instead of a FK to `households`.

Recommended model:
  - `User.householdId` stays as the membership FK (each user belongs to one household).
  - `household_managers` stays as the authority table (defines who can act for a household).
  - Remove dead `memberIds` / `managerIds` from the `Household` type.
  - Add `getHouseholdMembers(householdId)` helper (query users by `householdId`).
  - Re-key `purim_selections` unique constraint from `user_id` to `household_id`.
  - Re-key `high_holiday_registrations` unique constraint from `user_id` to `household_id`.
  - Replace `household_name` free-text column with `household_id` FK.
  - On submit: resolve the logged-in user's `householdId`, verify they are a manager, upsert for that household.
  - Either spouse (manager) can submit or update; the registration belongs to the household, not the individual.

[x] Remove dead `memberIds` / `managerIds` from `Household` type in `src/lib/households.ts`.
[x] Add `getHouseholdMembers(householdId)` helper in `src/lib/db-households.ts`.
[x] Migrate `purim_selections`: change unique constraint from `user_id` to `household_id`; update `db-purim.ts` and `purim.ts` accordingly.
[x] Migrate `high_holiday_registrations`: replace `user_id` + `household_name` with `household_id` FK; update `db-high-holidays.ts` and `high-holidays.ts`.
[x] Update Purim page (`src/app/purim/page.tsx`) and action to resolve session user → household, verify manager, upsert per household.
[x] Update High Holidays page (`src/app/high-holidays/page.tsx`) and action with the same household-based flow.
[x] Update Purim report and High Holidays admin views to display household name from FK (not free text).
[x] Consolidate user-creation paths (`dbCreatePendingUser`, `dbCreateHouseholdUser`, seed `upsertUserByEmail`) into fewer functions.
[x] SQL migration script: `scripts/migration-r1-household-registration.sql`.


Phase R2: DB Layer – Type Safety & DRY

Current problem:
  Every `db-*.ts` mapper uses `(r: any)`. 50+ occurrences of `if (error) throw error`.
  Several domain types are defined in two places (service layer + db layer).

[x] Define Supabase row types (`LocationRow`, `UserRow`, `ProjectRow`, etc.) and replace all `any` mappers across all 13 `db-*.ts` files.
[x] Add `unwrap<T>`, `unwrapList<T>`, `unwrapMaybe<T>`, `unwrapCount` helpers in `src/lib/supabase-helpers.ts` to replace 69 `if (error) throw error` blocks.
[x] Deduplicate types: `DirectoryTag` (canonical in `households.ts`), `AccessRequestType`/`AccessRequestStatus` (canonical in `db-access-requests.ts`), `HighHolidaySlot`/`SeatAllocation` (canonical in `db-high-holidays.ts`). Service layers re-export.
[x] Move location upsert/delete logic into `db-locations.ts` (`dbUpsertLocation`, `dbDeleteLocation`); actions now call the db layer.
[~] Service wrappers reviewed — only `projects.ts` is pure pass-through; others add validation/aggregation logic. Left as-is to avoid churn.
[x] Run `dbEnsureLocations` / `dbEnsureDefaultToggles` only in seed, not on every read call.


Phase R3: Server Action Standardization

Current problem:
  Action return shapes vary (`{ ok, error }` vs `{ success, error }`). Form parsing is
  manually repeated in 9+ action files. `revalidatePath` is called 3-5 times per action.

[x] Standardize all actions on one return shape: `{ ok: boolean; error?: string }`. Created `ActionResult` type in `src/lib/action-utils.ts`.
[x] Add `parseFormString(formData, key)` and `parseFormInt(formData, key)` helpers in `src/lib/action-utils.ts` to replace repeated `.get()` + `.toString().trim()` blocks.
[x] Add `revalidateAdminPaths()` and `revalidateAppPaths()` helpers in `src/lib/action-utils.ts` to replace scattered `revalidatePath` calls.
[x] Add session checks (`getServerSession`) in admin server actions (schedule, finance, locations, settings) as a defense-in-depth layer beyond middleware.
[x] Convert High Holidays and Purim inline `"use server"` form actions to use `useActionState` with proper error display.
[x] Reuse `hashPassword` from `auth.ts` in `seed.ts` (currently duplicated).


Phase R4: Shared UI Components (DRY)

Current problem:
  Form field markup (label + input + error) is manually repeated in every form (~10 forms).
  Card/section patterns (`surface-card card-interactive rounded-2xl p-6`) appear 20+ times.
  Long Tailwind input class strings are copy-pasted across 15+ files.

[~] `FormField` component — skipped; label+input structure varies too much across forms to benefit from a wrapper. The new `input-base`/`input-sm` CSS classes handle the repeated styling.
[x] Created `FormError` and `FormSuccess` in `src/components/FormFeedback.tsx`. Adopted in all 12 form components.
[~] `Card`/`EmptyState`/`SectionHeading` — skipped; `surface-card` CSS class already handles this, and card content varies too much for a useful wrapper.
[x] Added CSS utility classes in `globals.css`: `.input-base`, `.input-sm`, `.btn-danger`, `.text-income`, `.text-expense`, `.checkbox-base`. Adopted `input-base` in auth and life-events forms.
[x] Extracted `FilterTabs` in `src/components/FilterTabs.tsx`. Adopted in gmach and directory pages.
[x] Merged `SignOutButton` into `src/components/SignOutButton.tsx` (deleted duplicates from `src/app/` and `src/app/pending/`).
[~] `LocationEditForm`/`ScheduleEntryEditForm` extraction — skipped to avoid unnecessary churn; the Row components are small enough.
[x] Created `BackLink` in `src/components/BackLink.tsx`. Adopted in 6 pages (directory, gmach, life-events, request-access, high-holidays, purim).


Phase R5: Performance

Current problem:
  `buildDailyScheduleForDate` calls `getLocationById` per entry (N+1). Several pages
  await independent queries sequentially instead of using `Promise.all`.

[x] Fix schedule N+1: load all locations once, build a Map, look up per entry. Also removed `dbEnsureLocations` and `ensureDefaultScheduleEntries` from the read path.
[x] Parallelize home page fetches (`getLocations`, `buildDailyScheduleForDate`, `getGmachItems`, `isModuleEnabled` x2) with `Promise.all`.
[x] Parallelize Purim page fetches (`getPurimSelectionForHousehold`, `dbGetHouseholds`, `getPurimSelections`) with `Promise.all`.
[x] Parallelize High Holidays page fetches (`dbGetHhPrayers`, `getRegistrationForHousehold`) with `Promise.all`.
[x] Remove redundant `if (!session)` checks in `/high-holidays` and `/purim` pages (middleware already protects these routes).
[~] `addHighHolidayRegistration` — already a normal async function; no IIFE to simplify.
[ ] Consider `unstable_cache` for relatively static data (locations, schedule entries, system toggles).


Phase R6: Error Handling & Resilience

[x] Add `src/app/error.tsx` for route-level error fallback (Hebrew UI, "try again" + "home" buttons).
[x] Add `src/app/global-error.tsx` for root-level error fallback (inline styles, no CSS dependency).
[x] Wrap all 10 server action files in `safeAction()` try/catch wrapper via `src/lib/action-utils.ts`. Uncaught exceptions now return `{ ok: false, error: message }` instead of propagating.
[x] Add auth guard to `/api/seed` in development (e.g. secret header or query param).


Phase R7: Config Hygiene

[x] Resolve Tailwind color duplication: removed duplicate color/font definitions from `tailwind.config.js` (kept only `content`). `globals.css` `@theme inline` is now the single source of truth.
[x] Simplify seasonal mincha offset to a lookup table (`MINCHA_OFFSET_BY_MONTH`) in `schedule.ts`. (Superseded by Prayer Engine overhaul — now uses Zmanim-based calculation.)
[x] Unify `ScheduleEntryType` and `PrayerType`: `PrayerType` is now an alias for `ScheduleEntryType`, eliminating the `as PrayerType` cast.


Prayer Engine Overhaul (post-R7)

[x] Create `src/lib/zmanim.ts` — Hebcal API integration, `calculatePrayerTime()`, day-type/season helpers.
[x] Update `schedule_entries` schema: replace `hour/minute/use_seasonal_mincha_offset` with `day_types[]`, `season`, `time_type` (FIXED/ZMANIM_BASED/DYNAMIC_OFFSET), `fixed_hour/minute`, `zman_key`, `offset_minutes`, `round_to`.
[x] Create `schedule_overrides` table for per-entry, per-date cancellations or reschedules.
[x] Overhaul `buildDailyScheduleForDate()` to filter by day type + season, check overrides, resolve time via `calculatePrayerTime()`.
[x] Overhaul admin Schedule Manager UI: day-type checkboxes, time-type selector, zman dropdown, offset input, rounding field.
[x] Migration script: `scripts/migration-prayer-engine.sql`.
[x] Updated `reset-db.sql` with full new schema.
