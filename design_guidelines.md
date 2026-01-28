# TravelOrchestrator - Mobile App Design Guidelines

## Brand Identity

**Purpose**: Empowers travelers to plan smarter trips through AI-powered itinerary generation and dynamic reoptimization when plans go awry.

**Tone**: **Editorial/Magazine** - Sophisticated, curated, typographic hierarchy with premium feel. Think Monocle meets Airbnb.

**Unforgettable Element**: **Adaptive Intelligence Badge** - A subtle, pulsing icon that appears when AI is actively analyzing/reoptimizing plans, making users feel they have a smart travel companion.

## Navigation Architecture

**Root Navigation**: Tab Navigation (4 tabs)
- **Trips** (Home icon) - Browse all trips
- **Explore** (Compass icon) - Discover destinations, inspiration
- **Create** (Plus icon, center FAB) - Core action, creates new trip
- **Profile** (User icon) - Settings, preferences, account

**Required Screens**:
1. Login/Signup (Stack-only onboarding)
2. Trips List (Home tab)
3. Trip Detail (Modal from Trips)
4. Itinerary View (Stack from Trip Detail)
5. Activity Detail (Modal)
6. Budget Tracker (Stack from Trip Detail)
7. Reservations (Stack from Trip Detail)
8. Create Trip Wizard (Modal from FAB)
9. Reoptimization Panel (Bottom sheet overlay)
10. Profile/Settings (Profile tab)
11. Language Selector (Modal from Profile)

## Screen Specifications

### 1. Login/Signup
- **Header**: Transparent, no navigation
- **Layout**: Scrollable form
- **Components**: Logo (top center), email/password inputs, SSO buttons (Apple, Google), language switcher (top-right icon)
- **Insets**: Top: insets.top + 40, Bottom: insets.bottom + 24

### 2. Trips List (Home Tab)
- **Header**: Custom transparent with large title "Your Trips", right: filter icon
- **Layout**: Scrollable grid (2 columns on larger screens, 1 on compact)
- **Components**: Trip cards (destination image, title, dates, budget gauge), empty state illustration, floating FAB
- **Insets**: Top: headerHeight + 16, Bottom: tabBarHeight + 24

### 3. Trip Detail
- **Header**: Default with back button, trip title, right: edit icon
- **Layout**: Scrollable sections (Hero image, Quick stats, Actions grid, Itinerary preview)
- **Components**: Hero parallax header, stat cards (days, budget, members), action buttons (View Itinerary, Budget, Reservations, Invite)
- **Insets**: Top: 0 (hero fills), Bottom: insets.bottom + 24

### 4. Itinerary View
- **Header**: Transparent with back button, trip title, right: regenerate icon
- **Layout**: Scrollable day-by-day timeline
- **Components**: Day cards (collapsible), activity cards (swipeable actions), time indicators, floating "Reoptimize" button (appears when activity marked failed)
- **Insets**: Top: headerHeight + 16, Bottom: insets.bottom + 80 (space for floating button)

### 5. Create Trip Wizard (Modal)
- **Header**: Custom with "Cancel" (left), "Create Trip" title, "Next/Create" (right)
- **Layout**: Scrollable form with stepped progress (4 steps)
- **Components**: Step indicator (top), form fields, destination autocomplete, date picker, budget slider, preferences chips
- **Insets**: Top: 24, Bottom: insets.bottom + 24
- **Submit**: "Create" button in header

### 6. Budget Tracker
- **Header**: Default with back, "Budget" title
- **Layout**: Scrollable with sticky summary card
- **Components**: Donut chart (total vs spent), category breakdown list, add expense FAB
- **Insets**: Top: 16, Bottom: tabBarHeight + 80 (for FAB)

### 7. Reoptimization Panel (Bottom Sheet)
- **Layout**: Half-screen modal, draggable
- **Components**: AI badge (animated), suggestion cards (swipeable), impact preview (budget/time), accept/decline buttons
- **Insets**: Bottom: insets.bottom + 24

### 8. Profile/Settings
- **Header**: Default with "Profile" title
- **Layout**: Scrollable sections
- **Components**: User avatar (editable), display name, preferences, language selector, logout button (bottom, destructive)
- **Insets**: Top: 16, Bottom: insets.bottom + 24

## Color Palette

**Primary**: #1A5F7A (Deep teal - trustworthy, travel-appropriate)
**Accent**: #FF6B35 (Warm coral - calls-to-action, energy)
**Background**: #F8F9FA (Off-white, soft)
**Surface**: #FFFFFF (Pure white cards)
**Text Primary**: #1E293B (Near black, readable)
**Text Secondary**: #64748B (Slate gray)
**Success**: #059669 (Emerald green)
**Warning**: #F59E0B (Amber)
**Error**: #DC2626 (Red)

**Design Principle**: Teal dominates (70% usage), coral used sparingly for primary actions only. Avoid purple, avoid pure black backgrounds.

## Typography

**Primary Font**: Nunito Sans (Google Font) - Friendly yet professional, excellent readability
**Display/Headings**: Nunito Sans Bold
**Body/Secondary**: Nunito Sans Regular

**Type Scale**:
- Display: 32/Bold (trip titles, hero text)
- H1: 24/Bold (screen titles)
- H2: 20/SemiBold (section headers)
- H3: 18/SemiBold (card titles)
- Body: 16/Regular (main content)
- Caption: 14/Regular (metadata, labels)
- Small: 12/Regular (timestamps, fine print)

## Visual Design

**Touchables**: All buttons use subtle elevation (shadow: offset 0/2, opacity 0.08, radius 4). Pressed state: scale 0.98 + opacity 0.7.

**Floating Buttons**: Primary FAB - Accent color, shadow offset 0/4, opacity 0.15, radius 8.

**Cards**: White surface, 12px border radius, shadow offset 0/2, opacity 0.06, radius 8. 16px padding.

**Icons**: Feather icons from @expo/vector-icons, 24px default size, Text Secondary color unless active.

## Assets to Generate

**Required**:
1. **icon.png** (1024x1024) - App icon: Stylized compass with teal/coral gradient. WHERE: Device home screen.
2. **splash-icon.png** (1024x1024) - Same icon, centered. WHERE: App launch.
3. **empty-trips.png** (400x300) - Illustration: Minimalist suitcase, flat style, teal/coral accents. WHERE: Trips List when no trips exist.
4. **empty-itinerary.png** (400x300) - Illustration: Calendar with airplane, soft colors. WHERE: Trip Detail before itinerary generated.
5. **empty-budget.png** (400x300) - Illustration: Coin stack, simple line art. WHERE: Budget Tracker with no expenses.
6. **ai-companion.png** (200x200) - Illustration: Abstract brain/compass hybrid, animated. WHERE: Reoptimization Panel header.
7. **avatar-preset-1.png** (200x200) - Default avatar: Geometric pattern, teal/coral. WHERE: Profile screen default.

**Recommended**:
8. **onboarding-1.png** (600x400) - Hero: Traveler with map, editorial style. WHERE: Optional onboarding carousel.
9. **success-itinerary.png** (300x300) - Celebration illustration, confetti. WHERE: Itinerary generation success modal.

**Quality**: All illustrations should use soft gradients, minimal line art style, avoiding clipart aesthetic. Teal/coral color harmony throughout.