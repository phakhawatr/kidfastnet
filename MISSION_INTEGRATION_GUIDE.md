# Mission System Integration Guide

## Overview
แนวทางการเชื่อมต่อ Exercise Apps ทั้ง 22 แอปเข้ากับ Mission System

## เกณฑ์การผ่าน
- **ผ่าน**: ความแม่นยำ > 80%
- **ไม่ผ่าน**: ความแม่นยำ ≤ 80% (ให้ทำใหม่)

## การคำนวณดาว
- **3 ดาว**: 90-100% accuracy + เวลา ≤ 10 นาที
- **2 ดาว**: 80-89% accuracy
- **1 ดาว**: 70-79% accuracy
- **0 ดาว**: < 70% accuracy (ไม่ผ่าน)

## ขั้นตอนการ Integrate

### 1. Import Dependencies
```tsx
import { useMissionMode } from "@/hooks/useMissionMode";
import { MissionCompleteModal } from "@/components/MissionCompleteModal";
```

### 2. Initialize Hook
```tsx
const {
  isMissionMode,
  showMissionComplete,
  setShowMissionComplete,
  missionResult,
  handleCompleteMission
} = useMissionMode();
```

### 3. แก้ไข checkAnswers Function

#### สำหรับ Function Components (เช่น TimeApp, DivisionApp)
```tsx
function checkAnswers() {
  // ... existing check logic ...
  const correctCount = /* calculate correct answers */;
  const now = Date.now();
  const duration = startedAt ? now - startedAt : elapsedMs;
  
  // If mission mode, complete mission
  if (isMissionMode) {
    await handleCompleteMission(correctCount, problems.length, duration);
    return;
  }
  
  // Otherwise, show regular summary
  setShowSummary(true);
  // ... rest of existing logic ...
}
```

#### สำหรับ Custom Hooks (เช่น useSubtractionGame)
```tsx
// In the hook file (e.g., useSubtractionGame.ts)
const checkAnswers = useCallback(async (missionId?: string, onMissionComplete?: (correct: number, total: number, time: number) => void) => {
  // ... existing check logic ...
  
  if (missionId && onMissionComplete) {
    const duration = startedAt ? Date.now() - startedAt : elapsedMs;
    await onMissionComplete(correctCount, problems.length, duration);
    return;
  }
  
  // Regular flow
  setShowSummary(true);
  // ... rest of existing logic ...
}, [/* dependencies */]);
```

### 4. เพิ่ม MissionCompleteModal ใน JSX
```tsx
{/* Mission Complete Modal */}
{missionResult && (
  <MissionCompleteModal
    open={showMissionComplete}
    onOpenChange={setShowMissionComplete}
    stars={missionResult.stars}
    correct={missionResult.correct}
    total={missionResult.total}
    timeSpent={missionResult.timeSpent}
    isPassed={missionResult.isPassed}
    onRetry={() => {
      resetAll(); // Your reset function
      setShowMissionComplete(false);
    }}
  />
)}
```

## ตัวอย่างการ Integrate

### Type 1: Apps with Direct checkAnswers Function
- AdditionApp.tsx ✅ (เสร็จแล้ว)
- TimeApp.tsx
- DivisionApp.tsx
- MultiplicationApp.tsx
- MeasurementApp.tsx
- QuickMathApp.tsx

### Type 2: Apps with handleCheckAnswers
- FractionShapesApp.tsx
- ShapeSeriesApp.tsx
- PlaceValueApp.tsx

### Type 3: Apps with Custom Hooks
- SubtractionApp.tsx (uses useSubtractionGame)
- MoneyApp.tsx (uses useMoneyGame)
- BarModelApp.tsx (uses useBarModelGame)
- NumberBondsApp.tsx (uses useNumberBondsGame)

## Complete Integration Example

```tsx
import React, { useState } from "react";
import { useMissionMode } from "@/hooks/useMissionMode";
import { MissionCompleteModal } from "@/components/MissionCompleteModal";

export default function ExampleApp() {
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  const [showSummary, setShowSummary] = useState(false);
  
  async function checkAnswers() {
    const correctCount = calculateCorrectAnswers();
    const total = problems.length;
    const duration = Date.now() - startedAt;
    
    // Mission mode
    if (isMissionMode) {
      await handleCompleteMission(correctCount, total, duration);
      return;
    }
    
    // Regular mode
    setShowSummary(true);
  }
  
  return (
    <div>
      {/* App Content */}
      <button onClick={checkAnswers}>Check Answers</button>
      
      {/* Regular Summary Modal */}
      <SummaryModal open={showSummary} onClose={() => setShowSummary(false)} />
      
      {/* Mission Complete Modal */}
      {missionResult && (
        <MissionCompleteModal
          open={showMissionComplete}
          onOpenChange={setShowMissionComplete}
          stars={missionResult.stars}
          correct={missionResult.correct}
          total={missionResult.total}
          timeSpent={missionResult.timeSpent}
          isPassed={missionResult.isPassed}
          onRetry={() => {
            resetAll();
            setShowMissionComplete(false);
          }}
        />
      )}
    </div>
  );
}
```

## Apps Integration Status

| App Name | Status | Type |
|----------|--------|------|
| AdditionApp | ✅ Done | Direct |
| SubtractionApp | ⏳ TODO | Hook |
| MultiplicationApp | ⏳ TODO | Direct |
| DivisionApp | ⏳ TODO | Direct |
| FractionMatchingApp | ⏳ TODO | Direct |
| FractionShapesApp | ⏳ TODO | Handler |
| MoneyApp | ⏳ TODO | Hook |
| TimeApp | ⏳ TODO | Direct |
| WeighingApp | ⏳ TODO | Direct |
| MeasurementApp | ⏳ TODO | Direct |
| LengthComparisonApp | ⏳ TODO | Direct |
| ShapeMatchingApp | ⏳ TODO | Direct |
| ShapeSeriesApp | ⏳ TODO | Handler |
| NumberBondsApp | ⏳ TODO | Hook |
| BarModelApp | ⏳ TODO | Hook |
| AreaModelApp | ⏳ TODO | Direct |
| MentalMathApp | ⏳ TODO | Direct |
| MultiplicationTable | ⏳ TODO | Direct |
| SumGridPuzzles | ⏳ TODO | Direct |
| PlaceValueApp | ⏳ TODO | Handler |
| PercentageApp | ⏳ TODO | Direct |
| NumberSeriesApp | ⏳ TODO | Direct |
| WordProblemsApp | ⏳ TODO | Direct |

## Testing
1. Navigate to `/today-mission`
2. Select a mission
3. Click "เริ่มภารกิจที่เลือก"
4. Complete the questions
5. Click "ตรวจคำตอบ"
6. Verify:
   - Mission complete modal appears
   - Stars are calculated correctly (>80% pass)
   - "ทำใหม่" button appears for failed missions (<80%)
   - "กลับสู่ปฏิทิน" button works
   - Mission status updates in database
