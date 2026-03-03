

## Plan: Show All Assessment History

Currently `QuizHistory` is rendered with `compact` prop in `Quiz.tsx` (line 1013), which limits display to 3 items via `assessments.slice(0, 3)`.

### Changes

**`src/components/QuizHistory.tsx`**
- Add a `showAll` state (default `false`) when `compact` is true
- When `compact` and not `showAll`, show 3 items + a "ดูทั้งหมด (X รายการ)" button
- When `showAll` is toggled, show all assessments with a "ย่อ" collapse button
- This keeps the compact layout by default but lets users expand to see everything

### Technical Detail

```typescript
const [showAll, setShowAll] = useState(false);
const displayAssessments = compact && !showAll 
  ? assessments.slice(0, 3) 
  : assessments;
```

Add a button after the assessment cards grid:
```tsx
{compact && assessments.length > 3 && (
  <Button variant="outline" onClick={() => setShowAll(!showAll)}>
    {showAll ? 'ย่อ' : `ดูทั้งหมด (${assessments.length} รายการ)`}
  </Button>
)}
```

**File:** `src/components/QuizHistory.tsx` only

