# BookSwap

A local book swapping app where users can upload books and trade them locally.

## Features

- **Tinder-style swipe mode** – Swipe right on books you're interested in, left to pass
- **Marketplace** – Browse and search books by category, distance, and filters
- **Local matches** – Match with users when you're both interested in each other's books
- **Chat** – Message matched users to coordinate trades
- **Bilingual** – English and Spanish support

## Tech Stack

- **Expo / React Native** – Cross-platform mobile app (iOS & Android)
- **TypeScript** – Type-safe codebase
- **Supabase** – Backend (Auth, Database, Storage, Realtime)
- **React Navigation** – Navigation and routing

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your device (for development)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Add your Supabase URL and anon key:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the database migrations

Apply the SQL migrations in `supabase/migrations/` to your Supabase project (via the SQL Editor in the Supabase Dashboard):

1. Run `00001_initial_schema.sql`
2. Run `00002_rls_policies.sql`
3. Run `00003_auth_trigger.sql`

### 4. Create the storage bucket

In Supabase Dashboard > Storage, create a new bucket named `book-covers` and make it public. Add policies to allow authenticated users to upload and public read access.

### 5. Enable Realtime (for chat)

In Supabase Dashboard > Database > Replication, enable replication for the `messages` table so chat updates in real time.

### 6. Start the app

```bash
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Scripts

- `npm start` – Start Expo dev server
- `npm run android` – Run on Android
- `npm run ios` – Run on iOS
- `npm run lint` – Run ESLint
- `npm run lint:fix` – Fix lint issues
- `npm run format` – Format with Prettier
- `npm run type-check` – TypeScript check
- `npm test` – Run tests

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context (auth, etc.)
├── i18n/           # Internationalization (en, es)
├── lib/            # Utilities, Supabase client, API helpers
├── navigation/     # React Navigation stacks and tabs
├── screens/        # Screen components
│   ├── auth/       # Welcome, Login, Signup, Onboarding
│   └── main/       # Swipe, Marketplace, Library, Matches, Chat
├── theme/          # Colors, spacing
└── types/          # TypeScript types
```

## Assets

Replace the placeholder assets in `assets/` with your own:

- `icon.png` – App icon (1024x1024)
- `splash.png` – Splash screen
- `adaptive-icon.png` – Android adaptive icon

## Building for production

### iOS (requires Mac)

```bash
npx expo prebuild
npx expo run:ios
```

### Android

```bash
npx expo prebuild
npx expo run:android
```

### EAS Build (Expo Application Services)

For cloud builds without local native tooling:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform all
```

Then submit to stores with `eas submit`.

## License

MIT
