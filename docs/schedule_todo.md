# Schedule Refactor TODO

Based on `docs/schedule.md`.

## Completed in this step

- [x] Added DB fields for conditional fixed-time mode in `schedule_entries`:
  - `safety_buffer_minutes`
  - `fallback_offset_minutes`
- [x] Added migration script: `scripts/schedule-refactor.sql`
- [x] Implemented `CONDITIONAL_FIXED` in `calculatePrayerTime()`
- [x] Wired conditional fields through:
  - `src/lib/db-schedule-entries.ts`
  - `src/lib/schedule-entries.ts`
  - `src/app/admin/schedule/actions.ts`
  - `src/app/admin/schedule/ScheduleEntryForm.tsx`
  - `src/app/admin/schedule/ScheduleEntryRow.tsx`
- [x] Added muting foundation:
  - new DB table `muted_schedule_entries`
  - read helper `dbGetMutedEntryIdsForDate()`
  - schedule generation now excludes muted recurring entries
- [x] Added single-date custom table foundation:
  - `date_specific_schedules`

## Completed in this step (Day-State Machine)

- [x] Extended `HolidayInfo` type with additive flags:
  `isRoshChodesh`, `isFastDay`, `isHolHaMoed`, `isErevChagSheni`
- [x] Updated `fetchHolidaysForRange` to fetch `nx=on` (Rosh Chodesh) and parse
  `subcat: "cholhamoed"` (Hol HaMoed), `subcat: "fast"` (fast days)
- [x] Added DayTypes to `zmanim.ts`:
  `rosh_chodesh`, `fast_day`, `hol_hamoed`, `erev_shabbat_hol_hamoed`, `erev_chag_sheni`
- [x] New `ScheduleOptions` exported type in `schedule.ts` with additive flags
- [x] `buildDailyScheduleForDate` appends additive types to the base set
- [x] `schedule/page.tsx`:
  - Hol HaMoed weekdays stay as DayCards (not HolidayBlocks)
  - `DayCard` shows colored badges: teal for Hol HaMoed, sky-blue for Rosh Chodesh,
    slate for fast days, teal for Erev Chag Sheni / Hoshana Raba
  - Schedule builder passes enriched flags (isHolHaMoed, isRoshChodesh, etc.)
- [x] `ScheduleEntryForm.tsx` new "ימים מיוחדים (מצטבר)" section with checkboxes
  for all 5 new day types with Hebrew descriptions

## Next steps
- [ ] Single-date schedule integration:
  - Read `date_specific_schedules` in `buildDailyScheduleForDate`
  - Merge with recurring+override flow
- [ ] Conflict detection flow in admin:
  - Show overlaps per date/location
  - Offer "Keep both" / "Mute recurring for this date"
- [ ] Gabbai preview (7-14 day look-ahead):
  - Date-range controls
  - Highlight mode: Fixed / Zmanim / Conditional

