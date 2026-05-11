ROLE
You are a senior React Native / Expo engineer with deep expertise in mobile map integrations, Firebase Firestore, Supabase Storage, and production-grade mobile UI. You write clean, well-commented, modular code and follow Expo's latest best practices. You guide development phase by phase, never skipping ahead, always confirming each phase is working before proceeding.

TASK
Build a complete cross-platform mobile real estate app called "MapHouse" using React Native with Expo. The app allows users to browse property listings on an interactive map, filter results, view detailed property pages with image carousels, and contact agents directly via WhatsApp or Email deep links. Every feature must be fully implemented — no placeholder logic, no TODO comments in final code.

CONTENT
Tech Stack

Framework: React Native with Expo SDK 51+ (managed workflow)
Navigation: Expo Router v3 (file-based routing)
Map: react-native-maps (Google Maps on Android, Apple Maps on iOS)
Location: expo-location
Gestures & Animation: react-native-reanimated + react-native-gesture-handler
Image Component: expo-image (with blurhash placeholders)
Database: Firebase Firestore (listings, agents)
Media Storage: Supabase Storage buckets (property images)
Local Persistence: @react-native-async-storage/async-storage (saved/favourited listings)
State Management: React Context API + useReducer (no Redux)
Styling: React Native StyleSheet (no third-party UI library)
Icons: @expo/vector-icons (Ionicons set)
Environment Variables: expo-constants with .env file via expo-env.d.ts


Data Models
Firestore Collection: listings
Each document contains:
id: string (auto Firestore ID)
title: string (e.g. "Modern 3-Bedroom Apartment in Bonapriso")
description: string (2–4 sentences about the property)
price: number (in XAF — Central African Franc)
price_period: string ("sale" | "rent/month" | "rent/year")
type: string ("apartment" | "house" | "land" | "commercial")
bedrooms: number (0 for land/commercial)
bathrooms: number (0 for land/commercial)
area_sqm: number
address: string (human-readable street address)
city: string
neighborhood: string
coordinates: GeoPoint { latitude: number, longitude: number }
images: string[] (array of Supabase public image URLs, min 1 max 10)
is_available: boolean
is_featured: boolean
agent_id: string (reference to agents collection)
created_at: Timestamp
updated_at: Timestamp
Firestore Collection: agents
id: string
name: string
phone: string (full international format e.g. "+237691234567")
whatsapp: string (same format as phone, may differ)
email: string
agency_name: string
avatar_url: string (Supabase public URL)
verified: boolean
Local AsyncStorage Schema: saved_listings
Array of listing IDs (strings): ["id1", "id2", ...]

Supabase Storage

Bucket name: property-images
Bucket policy: public read, authenticated write
Image path format: listings/{listing_id}/{timestamp}_{index}.jpg
Avatar path format: agents/{agent_id}/avatar.jpg
All image URLs stored in Firestore are the full Supabase public URLs


App Screens & Navigation Structure
app/
  _layout.tsx              ← Root layout, wraps app in providers
  (tabs)/
    _layout.tsx            ← Bottom tab navigator (3 tabs)
    index.tsx              ← Tab 1: Map View (home)
    search.tsx             ← Tab 2: Search + Filter
    saved.tsx              ← Tab 3: Saved Listings
  listing/
    [id].tsx               ← Property Detail screen (modal stack)

Screen Specifications
Tab 1 — Map View (index.tsx)

Full-screen MapView from react-native-maps, covering 100% of screen including under status bar
On mount: request foreground location permission via expo-location, then animate camera to user's location with zoom level delta 0.05
If permission denied: default center coordinates set to Douala, Cameroon { latitude: 4.0511, longitude: 9.7679 }, zoom delta 0.2
Fetch all listings from Firestore where is_available == true, load them as custom markers
Each marker is a custom callout pin — a small pill-shaped view showing the formatted price (e.g. "45M XAF" for 45,000,000) with a pointed bottom, purple background (#6C47FF), white bold text, 12px font
When a marker is tapped: a bottom sheet preview card slides up (not a full navigation, just a peek card) showing: first image thumbnail (80×80, rounded), title, price, bedrooms/bathrooms badges, neighborhood. Tapping this card navigates to listing/[id]
Floating search bar at the top of the map (absolute positioned, not inside the map): white rounded pill, shadow, magnifier icon, placeholder "Search neighborhood, city…" — tapping it navigates to the Search tab
Floating "My Location" button bottom-right: circular white button with location icon, animates camera back to user on press
Active filter indicator: if any filters are active (passed from search screen via context), show a small purple dot badge on the search bar

Tab 2 — Search + Filter (search.tsx)

Text search input at top: searches across title, neighborhood, city fields (client-side filtering on fetched data)
Filter section below search bar with these controls:
Property type — horizontal scrollable row of pill chips:
All | Apartment | House | Land | Commercial
Active chip: purple fill, white text. Inactive: white fill, gray border.
Price range — two TextInput fields side by side labeled "Min price (XAF)" and "Max price (XAF)" with numeric keyboard
Bedrooms — row of number chips: Any | 1 | 2 | 3 | 4 | 5+
Availability — toggle switch: "Available only" (default on)
"Apply Filters" button — purple, full width, rounded. Saves filter state to FiltersContext and navigates to Map tab
"Reset" text button top-right clears all filters
Below the filters: a results list of matching listings rendered as vertical cards (FlatList):

Card: full-width, white background, rounded corners, shadow
Left: image thumbnail 100×100 rounded
Right: title (bold, 15px, 2-line max), price (purple, bold), neighborhood + city (gray, 13px), bedrooms/bathrooms/area row with icons, availability badge (green "Available" or red "Sold/Rented")
Tapping a card navigates to listing/[id]



Tab 3 — Saved Listings (saved.tsx)

Reads saved listing IDs from AsyncStorage
Fetches those specific documents from Firestore using where(documentId(), 'in', savedIds)
Renders same card style as Search tab
Empty state: centered illustration (use a simple SVG-style house icon from Ionicons at 80px), text "No saved listings yet", subtext "Tap the heart icon on any property to save it"
Each card has a filled heart icon top-right; tapping removes it from saved (with confirmation via Alert.alert)

Listing Detail Screen (listing/[id].tsx)
This is the most important screen. Structure:
1. Image Carousel (top, full width)

Height: 280px
Horizontal FlatList with pagingEnabled: true, showsHorizontalScrollIndicator: false
Each image: full width, 280px height, using expo-image with contentFit: "cover" and a blurhash placeholder
Dot indicators at bottom of carousel (active dot: white filled, inactive: white semi-transparent)
Back button (absolute, top-left, circular white semi-transparent): navigates back
Heart/Save button (absolute, top-right, circular white semi-transparent): toggles saved state in AsyncStorage, animates with react-native-reanimated spring scale on press
"Featured" badge top-left below back button (only if is_featured: true): small amber pill

2. Property Header Section

Price: large, bold, purple (#6C47FF), formatted with thousands separator + "XAF" + price_period
Title: 20px bold, dark text, 2 lines max
Neighborhood + city row with pin icon
Availability badge: green rounded "Available" or red "Sold / Rented"

3. Key Stats Row

Horizontal row of 3–4 stat pills (white cards with shadow):

🛏 Bedrooms (hidden if 0)
🚿 Bathrooms (hidden if 0)
📐 Area in m²
🏠 Type (capitalized)



4. Description Section

"About this property" heading (16px, bold)
Full description text (15px, gray #555, line height 22)
"Show more / Show less" toggle if description exceeds 4 lines (use numberOfLines with a state toggle)

5. Location Section

"Location" heading
Static mini MapView (height 160px, scrollEnabled: false, zoomEnabled: false) centered on property coordinates
Single default marker at property location
Address text below map (gray, 13px)

6. Agent Section

"Contact Agent" heading
Agent card: horizontal layout — avatar (50×50 circle using expo-image), agent name (bold), agency name (gray), verified badge (blue checkmark if verified: true)
Two action buttons side by side:

WhatsApp button: green background (#25D366), WhatsApp logo icon (use Ionicons logo-whatsapp), text "WhatsApp"

On press: Linking.openURL('whatsapp://send?phone=${agent.whatsapp}&text=Hello, I am interested in: ${listing.title} — ${listing.address}')
Fallback if WhatsApp not installed: Alert.alert with option to copy number


Email button: purple background (#6C47FF), mail icon, text "Email Agent"

On press: Linking.openURL('mailto:${agent.email}?subject=Inquiry: ${listing.title}&body=Hello ${agent.name}, I am interested in the property at ${listing.address}.')






Context Providers (wrap entire app in _layout.tsx)
ListingsContext

State: listings: Listing[], loading: boolean, error: string | null
On mount: subscribes to Firestore real-time listener (onSnapshot) on listings collection where is_available == true, ordered by created_at desc
Exposes: listings, loading, error, getListingById(id: string)

FiltersContext

State: filters: FilterState
FilterState type: { type: string | null, minPrice: number | null, maxPrice: number | null, bedrooms: number | null, availableOnly: boolean }
Default: { type: null, minPrice: null, maxPrice: null, bedrooms: null, availableOnly: true }
Exposes: filters, setFilters, resetFilters, activeFilterCount: number

SavedContext

State: savedIds: string[]
On mount: loads from AsyncStorage key "maphouse_saved"
Exposes: savedIds, toggleSaved(id: string), isSaved(id: string): boolean
Persists changes to AsyncStorage on every toggle


Firebase Configuration

File: lib/firebase.ts
Initialize Firebase app with initializeApp(firebaseConfig)
Export: db (Firestore instance via getFirestore)
Config values come from .env:

  EXPO_PUBLIC_FIREBASE_API_KEY=
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  EXPO_PUBLIC_FIREBASE_APP_ID=
Supabase Configuration

File: lib/supabase.ts
Initialize with createClient(url, anonKey)
Export: supabase
Config values from .env:

  EXPO_PUBLIC_SUPABASE_URL=
  EXPO_PUBLIC_SUPABASE_ANON_KEY=

Seed Data
Create a file scripts/seedFirestore.ts — a Node.js script (not Expo, runs with ts-node) that seeds Firestore with:

3 agents with realistic Cameroonian names, phone numbers in +237 format, email addresses, agency names
12 listings spread across Douala neighborhoods: Bonapriso, Akwa, Bonanjo, Bali, Makepe, Deido — with realistic XAF prices, a mix of types (6 apartments, 3 houses, 2 land, 1 commercial), realistic coordinates within Douala city bounds, placeholder Supabase image URLs (use https://picsum.photos/seed/{id}/800/600 as temporary image URLs until real uploads are done), varied bedroom/bathroom counts


Utility Functions
Create utils/formatters.ts:
formatPrice(price: number, period: string): string
  → "45,000,000 XAF (Sale)" or "150,000 XAF/month"

formatArea(sqm: number): string
  → "120 m²"

formatBedroomLabel(n: number): string
  → "1 bed" | "3 beds" | "Studio"

getDistanceLabel(userCoords, listingCoords): string
  → "1.2 km away" using Haversine formula
Create utils/filters.ts:
applyFilters(listings: Listing[], filters: FilterState): Listing[]
  → pure function, applies all filter criteria and returns filtered array

CONSTRAINTS
Development Phases — Follow Strictly in Order
⚠️ Do not write code for Phase N+1 until Phase N is confirmed working.

Phase 1 — Project Initialization & Configuration

Scaffold new Expo project: npx create-expo-app maphouse --template blank-typescript
Install all dependencies in one npx expo install + npm install command block (list every package)
Set up app.json / app.config.ts with correct bundle IDs, permissions (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION), and plugin configs for react-native-maps and expo-location
Create .env file with all keys (empty values, user fills them in)
Create expo-env.d.ts for TypeScript env var declarations
Create folder structure: app/, components/, context/, hooks/, lib/, utils/, types/, constants/, scripts/
Create types/index.ts with full TypeScript interfaces: Listing, Agent, FilterState, Coordinates
Create constants/colors.ts with full color palette used throughout the app
Create lib/firebase.ts and lib/supabase.ts with configuration
Checkpoint: Run npx expo start, confirm app boots with no errors


Phase 2 — Data Layer & Seed

Create scripts/seedFirestore.ts with all seed data as described
Add "seed": "ts-node scripts/seedFirestore.ts" to package.json scripts
Create all three Context providers with full logic: ListingsContext, FiltersContext, SavedContext
Wrap root _layout.tsx with all providers
Create hooks/useListings.ts, hooks/useFilters.ts, hooks/useSaved.ts convenience hooks
Create utils/formatters.ts and utils/filters.ts with all functions
Checkpoint: Run seed script, confirm 12 listings and 3 agents appear in Firestore console. Confirm useListings hook returns data in a simple test log


Phase 3 — Navigation Shell

Create bottom tab navigator in app/(tabs)/_layout.tsx with 3 tabs: Map (home icon), Search (search icon), Saved (heart icon)
Tab bar style: white background, purple active tint (#6C47FF), gray inactive, no border, subtle shadow
Create placeholder screen files for all routes (just a centered Text component with screen name)
Create app/listing/[id].tsx as a stack screen accessible from all tabs
Checkpoint: All tabs navigate correctly, back navigation from listing detail works


Phase 4 — Map View Screen

Build the full Map View screen as specified
Implement expo-location permission request with fallback
Build custom price pin MarkerView component (components/map/PricePin.tsx)
Build bottom sheet preview card component (components/map/ListingPreviewCard.tsx) with slide-up animation using react-native-reanimated
Build floating search bar component (components/map/MapSearchBar.tsx)
Build "My Location" floating button
Wire everything to ListingsContext
Checkpoint: Map renders, shows real listings from Firestore as price pins, tapping a pin shows preview card, preview card navigates to detail


Phase 5 — Search & Filter Screen

Build full Search + Filter screen
Implement all filter UI components (type chips, price inputs, bedroom chips, availability toggle)
Wire applyFilters utility to produce filtered results list
Build ListingCard component (components/listings/ListingCard.tsx) used in both Search and Saved tabs
Connect "Apply Filters" to FiltersContext and navigate to Map tab
Show active filter count badge on Map tab icon when filters are active
Checkpoint: Filters apply correctly, result list updates in real time as user types/selects, navigating to map with active filters shows badge


Phase 6 — Saved Listings Screen

Build full Saved Listings screen using SavedContext
Implement empty state UI
Implement swipe-to-remove or heart button to unsave with Alert.alert confirmation
Checkpoint: Saving/unsaving a listing persists after app restart (AsyncStorage confirmed working)


Phase 7 — Property Detail Screen

Build full Listing Detail screen in phases:

First: static layout with all sections
Then: image carousel with dot indicators
Then: save/heart button with spring animation
Then: mini map with MapView
Then: agent section with WhatsApp + Email buttons


Implement Linking.openURL for WhatsApp with fallback alert
Implement Linking.openURL for mailto
Test all deep links
Checkpoint: All sections render correctly, deep links open correct apps, save button persists, carousel scrolls and shows dot indicators


Phase 8 — Polish & Edge Cases

Add loading skeletons for all list and map views (simple animated gray placeholder using Animated.loop)
Add error boundary component for Firestore fetch failures
Add empty state for Search with no results
Ensure all text is properly truncated and no layout overflow occurs on small screens (iPhone SE / small Android)
Add KeyboardAvoidingView to Search screen
Ensure StatusBar style is correct on both platforms (light content over map, dark content elsewhere)
Add ActivityIndicator during initial listings load on Map
Verify no console.error or unhandled promise rejection warnings
Checkpoint: Full end-to-end test — open app, browse map, filter, view detail, save a listing, contact agent, restart app and confirm saved listing persists


Code Quality Constraints

Every component file must have its TypeScript props interface defined at the top
No any types — all Firestore documents must be cast to their typed interfaces
No inline styles on components that are reused more than once — use StyleSheet.create
All async functions must have try/catch with meaningful error messages
Firebase listeners (onSnapshot) must be unsubscribed in the useEffect cleanup function
All images must use expo-image, never the built-in <Image> component
The app must not crash if Firestore returns an empty array
Deep link buttons must gracefully handle the case where the target app (WhatsApp) is not installed


Visual Design Constraints

Primary color: #6C47FF (purple)
Secondary color: #25D366 (WhatsApp green, used only for WhatsApp button)
Background: #F8F8F8
Card background: #FFFFFF
Text primary: #1A1A2E
Text secondary: #666680
Border/divider: #E8E8F0
Success/available: #22C55E
Error/unavailable: #EF4444
Font sizes: 13 (caption), 14 (body small), 15 (body), 17 (subtitle), 20 (title), 24 (price)
Border radius: 8 (small), 12 (card), 20 (pill), 999 (circle)
All shadows: shadowColor: "#000", shadowOffset: {width:0, height:2}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3
2 / 2Sonnet 4.6Claude is AI and can make mistakes. Please double-check responses.