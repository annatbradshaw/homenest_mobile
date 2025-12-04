# Screenshot Guide for App Stores

## Required Screenshots

### Screenshot 1: Dashboard Overview
**Screen:** Dashboard tab
**What to show:**
- Project name visible
- Progress percentage
- Quick stats (stages, tasks, budget)
- Current stage card

**Caption:** "Track your entire renovation at a glance"

---

### Screenshot 2: Stages Timeline
**Screen:** Stages tab
**What to show:**
- Overall progress bar
- Multiple stages with different statuses
- Timeline indicators (completed, in-progress, not started)
- Date ranges visible on cards

**Caption:** "Plan every phase of your project"

---

### Screenshot 3: Task Management
**Screen:** Tasks tab
**What to show:**
- Task progress card
- Mix of tasks (To Do, In Progress, Done)
- Priority indicators visible
- Status badges

**Caption:** "Stay on top of every task"

---

### Screenshot 4: Budget Tracking
**Screen:** Budget tab
**What to show:**
- Budget overview (total, spent, remaining)
- Expense list with categories
- Receipt thumbnails if possible

**Caption:** "Keep your budget under control"

---

### Screenshot 5: Suppliers Directory
**Screen:** Suppliers tab
**What to show:**
- Multiple supplier cards
- Specialty badges (Contractor, Electrician, etc.)
- Star ratings
- Call/Email buttons

**Caption:** "All your contacts in one place"

---

### Screenshot 6: Dark Mode
**Screen:** Any screen in dark mode
**What to show:**
- Same content as another screenshot but in dark mode
- Shows the app adapts to user preference

**Caption:** "Beautiful in light or dark mode"

---

## Screenshot Sizes

| Device | Size | Aspect |
|--------|------|--------|
| iPhone 6.7" | 1290 × 2796 | 19.5:9 |
| iPhone 6.5" | 1284 × 2778 | 19.5:9 |
| iPhone 5.5" | 1242 × 2208 | 16:9 |
| iPad 12.9" | 2048 × 2732 | 4:3 |
| Android Phone | 1080 × 1920+ | 16:9 or taller |

---

## Tools for Screenshots

### Option 1: Simulator Screenshots (Recommended)
```bash
# iOS Simulator
# Press Cmd + S to save screenshot

# Android Emulator
# Click camera icon in toolbar
```

### Option 2: Expo Development Build
```bash
# Take screenshot on physical device
# iOS: Side button + Volume up
# Android: Power + Volume down
```

### Option 3: Automated with Maestro (Advanced)
```yaml
# maestro/screenshots.yaml
appId: com.homenest.app
---
- launchApp
- takeScreenshot: dashboard
- tapOn: "Stages"
- takeScreenshot: stages
- tapOn: "Tasks"
- takeScreenshot: tasks
```

---

## Adding Device Frames

### Free Tools
1. **Previewed.app** - Web-based, free tier
2. **MockUPhone** - mockuphone.com
3. **Facebook Design** - design.facebook.com/toolsandresources

### Figma Templates
Search "App Store Screenshots" in Figma Community

---

## Best Practices

1. **Use real data** - Realistic project names and content
2. **Consistent content** - Same project across all screenshots
3. **Highlight features** - Each screenshot shows a different capability
4. **Clean status bar** - Full battery, good signal, clean time
5. **Localize** - Create separate sets for each language

---

## Sample Data for Screenshots

**Project Name:** "Kitchen Renovation"

**Stages:**
1. Design Planning - Completed
2. Demolition - Completed
3. Electrical - In Progress (Running Late)
4. Plumbing - Not Started
5. Cabinets - Not Started
6. Countertops - Not Started
7. Finishing - Not Started

**Tasks:**
- "Order cabinet samples" - Done
- "Schedule electrician" - In Progress
- "Get plumber quotes" - To Do
- "Choose countertop material" - To Do

**Suppliers:**
- John's Electric - Electrician - 5 stars
- ABC Plumbing - Plumber - 4 stars
- Kitchen Designs Inc - Designer - 5 stars

**Budget:**
- Total: $45,000
- Spent: $18,500
- Categories: Labor, Materials, Permits
