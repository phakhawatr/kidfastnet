

## Plan: Add Practice App Links to AI Math Tutor Responses

### Concept
When the AI tutor explains a math concept (e.g., addition, fractions, time), the system will detect relevant topics in the AI response and append clickable practice app links below the message. This creates a complete learning loop: **Ask → Learn → Practice**.

### Changes

**1. Create topic-to-app mapping utility (`src/utils/aiAppRecommendations.ts`)**
- Define a mapping of Thai/English keywords to app registry keys
- Example: keywords like "บวก", "addition", "รวม" → `addition` app; "เศษส่วน", "fraction" → `fraction-matching`, `fraction-shapes`; "นาฬิกา", "เวลา", "time" → `time` app; "คูณ", "multiplication" → `multiplication`, `multiplication-table`, `flower-math`
- Export a function `getRecommendedApps(content: string): AppRecommendation[]` that scans the AI response text and returns matching apps from `appRegistry`

**2. Update `AIChatMessage.tsx`**
- Import the recommendation function and `appRegistry`
- For assistant messages, call `getRecommendedApps(content)` to find relevant apps
- Render matched apps as clickable pill/chip buttons below the message bubble (icon + app name + link)
- Use `useNavigate` to navigate to the app's route on click
- Only show recommendations section when matches exist

**3. No backend changes needed**
- The keyword matching is purely client-side, scanning the already-received AI response text
- No changes to the edge function or system prompt required

### Keyword Mapping (examples)

```text
"บวก", "addition", "รวม", "ผลบวก"     → addition
"ลบ", "subtraction", "ผลลบ"           → subtraction
"คูณ", "multiplication", "สูตรคูณ"     → multiplication, multiplication-table, flower-math
"หาร", "division"                      → division
"เศษส่วน", "fraction"                  → fraction-matching, fraction-shapes
"เวลา", "นาฬิกา", "time", "clock"     → time
"เงิน", "money", "บาท"                → money
"ชั่ง", "น้ำหนัก", "weighing"          → weighing
"วัด", "measurement", "ความยาว"        → measurement, length-comparison
"รูปทรง", "shape"                      → shape-matching, shape-series
"ค่าประจำหลัก", "place value"          → place-value
"โจทย์ปัญหา", "word problem"           → word-problems
```

### UI Design
Below each assistant message with matches:
```text
┌─────────────────────────────────────────┐
│  AI response text...                    │
│                                         │
│  📚 ฝึกทักษะที่เกี่ยวข้อง:               │
│  [➕ การบวก] [🌸 ดอกไม้คณิต] [⏱️ คิดเร็ว] │
└─────────────────────────────────────────┘
```
Each chip is a colored button that navigates to the practice app.

### Files to create/edit
- **Create**: `src/utils/aiAppRecommendations.ts`
- **Edit**: `src/components/AIChatMessage.tsx`

