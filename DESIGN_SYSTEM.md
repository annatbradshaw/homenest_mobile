# HomeNest Design System

Complete design documentation for React Native app recreation.

---

## Brand Assets

### Logo

**Main Logo (Transparent):**
```
https://xcueqjasyxutnkvhhkxj.supabase.co/storage/v1/object/public/logos/main_logo_transparent.png
```

**Usage:**
- Auth pages (Login, Signup, TenantSetup)
- Navigation sidebar (collapsed state)
- Portal header

---

## Color Palette

### Primary Colors (Blue - Trust & Professionalism)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#EFF6FF` | Hover backgrounds |
| 100 | `#DBEAFE` | Light backgrounds |
| 200 | `#BFDBFE` | Borders, dividers |
| 300 | `#93C5FD` | Icons, badges |
| 400 | `#60A5FA` | Active states |
| **500** | `#3B82F6` | Primary buttons |
| **600** | `#2563EB` | **Main brand color** |
| **700** | `#1D4ED8` | Hover states |
| 800 | `#1E40AF` | Active/pressed |
| 900 | `#1E3A8A` | Dark accents |

### Accent Colors (Amber - Construction/Home Energy)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FFFBEB` | Light backgrounds |
| 100 | `#FEF3C7` | Badges |
| 200 | `#FDE68A` | Highlights |
| 300 | `#FCD34D` | Icons |
| 400 | `#FBBF24` | Active states |
| **500** | `#F59E0B` | **Main accent color** |
| 600 | `#D97706` | Hover states |
| 700 | `#B45309` | Pressed states |
| 800 | `#92400E` | Dark accents |
| 900 | `#78350F` | Text on light |

### Success Colors (Emerald - Completed/Positive)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#ECFDF5` | Success backgrounds |
| 100 | `#D1FAE5` | Light success |
| 200 | `#A7F3D0` | Borders |
| 300 | `#6EE7B7` | Icons |
| 400 | `#34D399` | Active states |
| **500** | `#10B981` | **Main success color** |
| 600 | `#059669` | Hover states |
| 700 | `#047857` | Pressed states |
| 800 | `#065F46` | Dark accents |
| 900 | `#064E3B` | Text |

### Danger Colors (Red - Alerts/Overdue)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FEF2F2` | Error backgrounds |
| 100 | `#FEE2E2` | Light danger |
| 200 | `#FECACA` | Borders |
| 300 | `#FCA5A5` | Icons |
| 400 | `#F87171` | Active states |
| **500** | `#EF4444` | **Main warning color** |
| 600 | `#DC2626` | Hover states |
| 700 | `#B91C1C` | Pressed states |
| 800 | `#991B1B` | Dark accents |
| 900 | `#7F1D1D` | Text |

### Neutral Colors (Slate - Backgrounds & Text)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#F8FAFC` | Lightest background |
| 100 | `#F1F5F9` | Card backgrounds |
| 200 | `#E2E8F0` | Borders |
| 300 | `#CBD5E1` | Dividers |
| 400 | `#94A3B8` | Muted text |
| 500 | `#64748B` | Secondary text |
| 600 | `#475569` | Body text |
| 700 | `#334155` | Dark text |
| 800 | `#1E293B` | Darker text |
| 900 | `#0F172A` | Darkest/headings |
| 950 | `#020617` | Deep dark bg |

---

## Dark Mode

### Background Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary BG | `#FFFFFF` | `#0F172A` |
| Secondary BG | `#F8FAFC` | `#020617` |
| Tertiary BG | `#F1F5F9` | `#1E293B` |
| Hover BG | `#EFF6FF` | `#1E3A5F` |

### Text Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary Text | `#0F172A` | `#F8FAFC` |
| Secondary Text | `#475569` | `#CBD5E1` |
| Muted Text | `#94A3B8` | `#64748B` |

### Border Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Default Border | `#E2E8F0` | `#334155` |
| Strong Border | `#CBD5E1` | `#475569` |

---

## Glassmorphism

### Light Mode
```css
background: rgba(255, 255, 255, 0.8);
border: 1px solid rgba(255, 255, 255, 0.2);
backdrop-filter: blur(12px);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Dark Mode
```css
background: rgba(30, 41, 59, 0.8);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(12px);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

---

## Typography

### Font Family
- **Primary:** System font stack (San Francisco, Segoe UI, Roboto)
- **Monospace:** For code/numbers

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 12px | 16px | Labels, captions |
| sm | 14px | 20px | Body small, buttons |
| base | 16px | 24px | Body text |
| lg | 18px | 28px | Subheadings |
| xl | 20px | 28px | Section titles |
| 2xl | 24px | 32px | Page headings |
| 3xl | 30px | 36px | Large headings |
| 4xl | 36px | 40px | Hero text |

### Font Weights
- **Normal:** 400 - Body text
- **Medium:** 500 - Subheadings
- **Semibold:** 600 - Buttons, labels
- **Bold:** 700 - Headings

---

## Spacing Scale

| Name | Size | Usage |
|------|------|-------|
| 0.5 | 2px | Tiny gaps |
| 1 | 4px | Tight spacing |
| 1.5 | 6px | Compact spacing |
| 2 | 8px | Small spacing |
| 2.5 | 10px | Compact padding |
| 3 | 12px | Standard gap |
| 4 | 16px | Standard padding |
| 5 | 20px | Medium spacing |
| 6 | 24px | Section padding |
| 8 | 32px | Large spacing |
| 10 | 40px | Extra large |
| 12 | 48px | Page margins |
| 16 | 64px | Major sections |

---

## Border Radius

| Name | Size | Usage |
|------|------|-------|
| none | 0 | - |
| sm | 2px | Subtle rounding |
| default | 4px | Inputs, small buttons |
| md | 6px | Medium elements |
| lg | 8px | Cards, modals |
| xl | 12px | Large cards |
| **2xl** | **16px** | **Primary cards, buttons** |
| 3xl | 24px | Large modals |
| full | 9999px | Circular elements |

---

## Shadows

### Card Shadows
```css
/* Default card */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Elevated card */
box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);

/* Card hover */
box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
```

### Glow Effects (for stat cards)
```css
/* Primary glow */
box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);

/* Success glow */
box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);

/* Accent glow */
box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);

/* Danger glow */
box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
```

---

## Components

### Buttons

**Variants:**
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| primary | Gradient: primary-600 → primary-500 | White | None |
| secondary | White | neutral-700 | neutral-200 |
| outline | Transparent | primary-600 | primary-500 |
| accent | Gradient: accent-500 → amber-500 | White | None |
| danger | Gradient: danger-500 → red-500 | White | None |
| ghost | Transparent | neutral-600 | None |
| text | Transparent | primary-600 | None |

**Sizes:**
| Size | Padding | Height | Font |
|------|---------|--------|------|
| sm | 12px 6px | 32px | 14px |
| md | 16px 10px | 40px | 14px |
| lg | 24px 12px | 48px | 16px |

**States:**
- Hover: Slight lift (-0.5 translateY), deeper shadow
- Active: No lift, reduced shadow
- Disabled: 50% opacity, no cursor
- Loading: Spinner replaces icon

### Cards (GlassCard)

**Variants:**
| Variant | Style |
|---------|-------|
| default | Glassmorphism with blur |
| elevated | Strong shadow, subtle border |
| subtle | Light background, minimal |
| bordered | 2px border, minimal shadow |

**Common Styles:**
- Border radius: 16px (rounded-2xl)
- Transition: 300ms
- Hover: Lift + shadow increase

### Inputs

**Base Style:**
```css
padding: 10px 12px;
border: 1px solid #E2E8F0;
border-radius: 8px;
font-size: 14px;
transition: all 200ms;
```

**States:**
- Focus: Ring (primary-500), border transparent
- Error: Border danger-500, text danger-600
- Disabled: Opacity 50%, no interaction

### Modals

**Structure:**
```
Modal Container (centered overlay)
├── Backdrop (black, 50% opacity)
└── Modal Content
    ├── Header (title + close button)
    │   └── Border bottom
    ├── Body (scrollable content)
    └── Footer (action buttons)
        └── Border top, gray background
```

**Sizes:**
| Size | Max Width |
|------|-----------|
| sm | 400px |
| md | 500px |
| lg | 640px |
| xl | 768px |
| full | 95vw |

### Badges

**Variants:**
| Variant | Background | Text |
|---------|------------|------|
| default | neutral-100 | neutral-700 |
| primary | primary-100 | primary-700 |
| success | success-100 | success-700 |
| warning | accent-100 | accent-700 |
| danger | danger-100 | danger-700 |

**Sizes:**
| Size | Padding | Font |
|------|---------|------|
| sm | 4px 6px | 10px |
| md | 4px 8px | 12px |
| lg | 6px 10px | 14px |

### Alerts

**Variants:**
| Variant | Background | Border | Icon |
|---------|------------|--------|------|
| info | primary-50 | primary-200 | InfoCircle |
| success | success-50 | success-200 | CheckCircle |
| warning | accent-50 | accent-200 | AlertTriangle |
| danger | danger-50 | danger-200 | XCircle |

---

## Animations

### Transitions
```css
/* Default */
transition: all 200ms ease;

/* Cards */
transition: all 300ms ease;

/* Modals */
transition: opacity 300ms, transform 300ms;
```

### Keyframes

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide Up:**
```css
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Shimmer (loading):**
```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}
```

**Bounce Subtle:**
```css
@keyframes bounceSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

---

## Icons

**Library:** Lucide React

**Common Icons Used:**
| Icon | Usage |
|------|-------|
| Home | Dashboard, projects |
| Building2 | Organizations |
| Layers | Stages |
| CheckSquare | Todos |
| DollarSign | Expenses, budget |
| FileText | Documents |
| Users | Team, suppliers |
| Settings | Settings |
| Plus | Add actions |
| Edit | Edit actions |
| Trash2 | Delete actions |
| X | Close, cancel |
| Check | Confirm, complete |
| ChevronDown/Up/Left/Right | Navigation |
| Calendar | Dates |
| MapPin | Addresses |
| Mail | Email |
| Phone | Phone |
| Star | Ratings |
| AlertTriangle | Warnings |
| Info | Information |

**Icon Sizes:**
| Context | Size |
|---------|------|
| Button sm | 16px |
| Button md | 16px |
| Button lg | 20px |
| Navigation | 20px |
| Card header | 24px |
| Hero/empty state | 48px |

---

## Layout

### Navigation Sidebar

**Width:**
- Expanded: 256px
- Collapsed: 72px

**Structure:**
```
Sidebar
├── Header (logo)
├── Project Selector
├── Nav Links
│   ├── Dashboard
│   ├── Stages
│   ├── Todos
│   ├── Expenses
│   ├── Documents
│   └── Suppliers
├── Settings Link
└── User Menu (bottom)
```

**Colors:**
- Background: Gradient (neutral-900 → neutral-800 → neutral-900)
- Active item: primary-500/20 background
- Hover: neutral-800

### Page Layout

**Structure:**
```
Page Container (flex)
├── Sidebar (fixed left)
└── Main Content (flex-1)
    ├── Page Header
    │   ├── Title
    │   ├── Description
    │   └── Actions
    └── Content Area
        └── Cards/Tables/Lists
```

**Max Widths:**
- Content: 1280px
- Forms: 640px

---

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Mobile Considerations
- Sidebar becomes bottom nav or hamburger menu
- Cards stack vertically
- Tables become cards
- Touch targets min 44px

---

## Accessibility

### Focus States
```css
*:focus {
  outline: none;
  ring: 2px solid primary-500;
  ring-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements have visible focus
- Errors use both color and icons

---

## React Native Conversion Notes

### Colors
Use the hex values directly or create a theme object:
```javascript
const colors = {
  primary: {
    50: '#EFF6FF',
    // ... etc
    600: '#2563EB',
  },
  // ... other palettes
};
```

### Shadows (React Native)
```javascript
// iOS
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,

// Android
elevation: 4,
```

### Border Radius
```javascript
borderRadius: 16, // for 2xl (cards)
borderRadius: 12, // for xl
borderRadius: 8,  // for lg (inputs)
```

### Typography
```javascript
// Use React Native's Text styles
fontSize: 14,
fontWeight: '600',
lineHeight: 20,
```
