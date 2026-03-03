

## Problem

The "ดูรายละเอียดและฝึกทักษะเพิ่ม" button in `QuizHistory` navigates to `/quiz` with state, but the user is **already on `/quiz`**. React Router does not remount the component when navigating to the same route, so:
- `useState` initializers don't re-run → `screen` stays at current value
- `useEffect(() => {}, [])` doesn't re-fire → `historyMode` never gets set

## Fix

**`src/pages/Quiz.tsx`** — Change the `useEffect` dependency from `[]` to `[location.state]` (or `[locationState]`) so it re-runs when navigation state changes. Also explicitly set `screen` to `'results'` inside that effect:

```typescript
useEffect(() => {
  const ls = location.state as typeof locationState;
  if (ls?.showResults && ls.assessmentRecord) {
    const rec = ls.assessmentRecord;
    // ... existing skill breakdown computation ...
    setHistoryData({ ... });
    setHistoryMode(true);
    setScreen('results');  // Explicitly switch screen
    window.history.replaceState({}, document.title);
  }
}, [location.state]);  // React to state changes
```

This single change ensures that when navigating from QuizHistory (same page), the effect fires again and switches to the results view with the historical data.

