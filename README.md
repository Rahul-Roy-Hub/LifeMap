# LifeMap - Personal Growth Journaling App

A beautiful, feature-rich journaling app built with Expo and Supabase that helps users track their personal growth journey through daily reflections, mood tracking, and habit building.

## Features

### 🔐 Authentication
- Email/password authentication via Supabase Auth
- User profiles with customizable information
- Secure session management

### 📝 Journaling
- Daily journal entries with mood tracking
- Habit tracking and progress visualization
- Rich text input with prompts for reflection
- Responsive design for mobile and tablet

### 📊 Analytics & Insights
- Mood trends and analytics
- Habit completion tracking
- Weekly summaries and progress reports
- AI-powered insights (Pro feature)

### 💎 Subscription Management
- Free tier with limited entries (3 per week)
- Pro tier with unlimited entries and premium features
- Custom domain support for Pro users
- RevenueCat integration ready

### 🎨 Beautiful UI/UX
- Modern, clean design with smooth animations
- Dark/light theme support
- Responsive layout for all screen sizes
- Micro-interactions and haptic feedback

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Database, Auth, Realtime)
- **Navigation**: Expo Router
- **Styling**: StyleSheet with Linear Gradients
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Fonts**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lifemap-journaling-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Update `.env` with your Supabase credentials

4. Set up the database:
   - Run the SQL migrations in your Supabase dashboard
   - Enable Row Level Security (RLS) on all tables

5. Start the development server:
```bash
npm run dev
```

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  custom_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  mood_emoji TEXT NOT NULL,
  decision TEXT NOT NULL,
  habits JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── dashboard.tsx  # Analytics dashboard
│   │   └── settings.tsx   # Settings screen
│   ├── entry.tsx          # Journal entry modal
│   └── paywall.tsx        # Subscription paywall
├── components/            # Reusable components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── AuthScreen.tsx     # Login/signup screen
│   ├── UserContext.tsx    # User data context
│   └── ...               # Feature components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useProfile.ts      # User profile hook
│   └── useJournalEntries.ts # Journal entries hook
├── lib/                   # Utilities and configurations
│   └── supabase.ts        # Supabase client
└── types/                 # TypeScript type definitions
    ├── database.ts        # Database types
    └── env.d.ts          # Environment types
```

## Key Features Implementation

### Authentication Flow
- Automatic session management with Supabase Auth
- Profile creation on first login
- Protected routes with authentication checks

### Real-time Updates
- Live synchronization of journal entries
- Instant updates across devices
- Optimistic UI updates

### Responsive Design
- Mobile-first approach
- Tablet-optimized layouts
- Adaptive components for different screen sizes

### Subscription Management
- Free tier limitations
- Pro feature gating
- Custom domain support for Pro users

## Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
1. Configure app.json for your target platforms
2. Build with EAS Build:
```bash
eas build --platform all
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@lifemap.app or join our Discord community.