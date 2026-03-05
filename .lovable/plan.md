

## Problem

Missions are created successfully (toast confirms), but the "ภารกิจวันนี้" section shows empty because of **stale cache**.

**Root cause**: The `fetchMissions` function in `useTrainingCalendar.ts` checks localStorage cache first (5-minute TTL for free tier users). After creating a new mission, `fetchMissions` is called to refresh — but it hits the stale cache and returns old data (without the new mission). `invalidateMissionCache()` is only called after mission **completion**, never after mission **generation**.

## Fix

**`src/hooks/useTrainingCalendar.ts`** — Add `invalidateMissionCache()` before `fetchMissions()` in three places:

1. **`addSingleMission`** (line ~645): Add `invalidateMissionCache()` before `await fetchMissions(...)`
2. **`generateTodayMission`** (line ~741): Add `invalidateMissionCache()` before `await fetchMissions(...)`
3. **`regenerateMissions`** (line ~811): Add `invalidateMissionCache()` before `await fetchMissions(...)`
4. Also in the error/retry paths (~line 760-762) where `fetchMissions` is called after a delay

This ensures that after any mission creation, the cache is cleared so `fetchMissions` fetches fresh data from the database.

