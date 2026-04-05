### Technical Specification: Advanced Prayer State Machine & Scheduling Engine

We need to implement a robust, deterministic scheduling engine for the prayer system. The goal is to allow the Gabbai to define complex recurring rules while maintaining a clear hierarchy for overrides.

#### 1. Day Type State Machine (Classification)
Update the logic to classify any given date into a set of "Day States". A day can have multiple flags (e.g., `WEEKDAY` + `ROSH_CHODESH`).
The priority/types are:
- **Core Types:** `WEEKDAY`, `SHABBAT`, `HOLIDAY`.
- **Special States:** `ROSH_CHODESH`, `FAST_DAY`, `HOL_HAMOED`.
- **Transition States:** `EREV_SHABBAT`, `EREV_CHAG`, `EREV_SHABBAT_HOL_HAMOED`, `EREV_CHAG_SHENI`.

#### 2. The "Safety Margin" Calculation Logic
Implement a new "Conditional Fixed Time" mode for prayer entries. 
For a given prayer, the Gabbai defines:
- **Preferred Fixed Time** (e.g., 13:30)
- **Reference Zman** (e.g., `shkiya`)
- **Safety Buffer** (Threshold in minutes, e.g., 30 mins before Shkiya)
- **Fallback Offset** (e.g., 15 mins before Shkiya)

**Logic:**
If `FixedTime` is later than (`Zman` - `Buffer`), calculate time as (`Zman` - `FallbackOffset`).
Otherwise, use `FixedTime`.
*Note: Apply existing rounding logic to the final result.*

#### 3. Override & Conflict Management
- **Single-Date Overrides:** Create a table for `date_specific_schedules`.
- **Conflict Detection:** When an Admin creates an override for a specific date/location, the UI must:
    1. Query all recurring rules applicable to that date.
    2. Flag overlaps in the same location.
    3. Ask the user: "Keep both" or "Mute recurring prayer for this date".
- **Muting Logic:** If a recurring prayer is muted for a specific date, it must not appear in the generated daily schedule.

#### 4. UI/UX: The "Gabbai Preview"
Before publishing, the Admin dashboard needs a **"Schedule Preview"** (Look-ahead):
- A view that generates the schedule for the 7-14 days based on current rules between dates the Gabbai asked for.
- Highlighting which prayers are `Calculated (Zmanim)`, which are `Fixed`, and which are `Conditional`.

#### 5. Database Schema Updates
- Update `schedule_entries` to support the "Conditional Fixed Time" fields (`fixed_time`, `ref_zman`, `buffer_minutes`, `fallback_offset`).
- Add a `muted_on_dates` table or column to handle the "Muting Logic".

Please implement the Database migrations and the core `calculatePrayerTime` logic first.
