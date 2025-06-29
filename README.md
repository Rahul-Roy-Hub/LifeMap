# LifeMap - Personal Growth Journaling App

A beautiful, feature-rich journaling app built with React Native (Expo) and Supabase that helps users track their personal growth journey through daily reflections, mood tracking, and AI-powered insights.

## 🌟 Features

### 🔐 Authentication & User Management
- Email/password authentication via Supabase Auth
- User profiles with customizable information (name, avatar)
- Secure session management with auto-refresh tokens
- Profile editing with image picker support
- Subscription plan management (free/pro)

### 📝 Journaling & Entry Management
- Daily journal entries with mood tracking (1-5 scale with emojis)
- Rich text input for detailed reflections
- Entry editing and management
- All entries view with search and filtering
- Responsive design for mobile and tablet

### 🤖 AI-Powered Features
- AI Coach integration via Flask backend (deployed on Render)
- Chat interface for personalized guidance
- Weekly summary generation with mood analysis
- Pro feature gating for AI insights
- Dappier API integration for enhanced AI capabilities

### 📊 Analytics & Insights
- Mood trends and analytics visualization
- Weekly summaries with detailed breakdowns
- Productivity tracking and analysis

### 💎 Subscription & Monetization
- RevenueCat integration for subscription management
- Free tier with entry limitations
- Pro tier with AI insights and premium features
- Custom domain support for Pro users
- Paywall interface with subscription options

### 🎨 UI/UX & Design
- Modern, clean design with smooth animations
- Responsive layout for all screen sizes
- Micro-interactions and haptic feedback
- Linear gradients and modern styling
- Toast notifications for user feedback

### 🌐 Backend & Infrastructure
- Flask Python backend for AI services
- Supabase database with real-time capabilities
- Row Level Security (RLS) policies
- Environment-based configuration
- Health check endpoints
- CORS support for cross-platform access

## 🚀 Tech Stack

### Frontend
- **Framework**: React Native 0.79.4 with Expo SDK 53
- **Navigation**: Expo Router 5.1.0 with typed routes
- **State Management**: React Context API with custom hooks
- **Styling**: StyleSheet with Linear Gradients
- **Animations**: React Native Reanimated 3.17.4
- **Icons**: Lucide React Native 0.475.0
- **Fonts**: Inter (Google Fonts)
- **Charts**: React Native Pie Chart 4.0.1

### Backend
- **Framework**: Flask 2.3.3 with Gunicorn
- **AI Integration**: Dappier API, LangChain
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Render (Backend), Expo (Frontend)

### Development Tools
- **Language**: TypeScript 5.8.3
- **Package Manager**: npm
- **Linting**: Expo Lint
- **Environment**: Cross-env for platform compatibility

## 📊 Database Schema

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

## 📁 Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── dashboard.tsx  # Analytics dashboard
│   │   ├── chat.tsx       # AI chat interface
│   │   ├── weekly-summary.tsx # Weekly insights
│   │   └── settings.tsx   # Settings screen
│   ├── all-entries.tsx    # All journal entries view
│   ├── profile-edit.tsx   # Profile editing
│   ├── entry.tsx          # Journal entry modal
│   └── paywall.tsx        # Subscription paywall
├── components/            # Reusable components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── AuthScreen.tsx     # Login/signup screen
│   ├── UserContext.tsx    # User data context
│   ├── HomeContent.tsx    # Main home screen content
│   ├── DashboardContent.tsx # Dashboard analytics
│   ├── ChatInterface.tsx  # AI chat interface
│   ├── WeeklySummary.tsx  # Weekly summary component
│   ├── EntryContent.tsx   # Journal entry form
│   ├── PaywallContent.tsx # Subscription interface
│   └── SettingsContent.tsx # Settings management
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useProfile.ts      # User profile hook
│   ├── useJournalEntries.ts # Journal entries hook
│   ├── useLifeMapAI.ts    # AI service hook
│   └── useFrameworkReady.ts # Framework initialization
├── lib/                   # Utilities and services
│   ├── supabase.ts        # Supabase client configuration
│   ├── ai-service.ts      # AI service integration
│   ├── chatService.ts     # Chat functionality
│   ├── revenuecat.ts      # Subscription management
│   └── services/          # Additional services
├── server/                # Python Flask backend
│   ├── ai_service.py      # AI service endpoints
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Python virtual environment
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
└── types/                 # TypeScript type definitions
    ├── database.ts        # Database types
    └── env.d.ts          # Environment types
```

## 🚀 Deployment

### Backend Deployment (Render)
```bash
# Backend is deployed on Render with the following configuration:
# - Python 3.12
# - Flask with Gunicorn
# - Environment variables for API keys
# - Health check endpoint at /health
```

### Frontend Deployment

#### Web Deployment
```bash
npm run build:web
```

#### Mobile Deployment
1. Configure app.json for your target platforms
2. Build with EAS Build:
```bash
eas build --platform android
```

## 🔧 Environment Setup

### Required Environment Variables
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
DAPPIER_API_KEY=your_dappier_api_key

# RevenueCat Configuration (for mobile)
REVENUECAT_API_KEY=your_revenuecat_api_key

# Weather API (optional)
OPENWEATHERMAP_API_KEY=your_weather_api_key
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account
- Python 3.12+ (for backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rahul-Roy-Hub/LifeMap.git
cd LifeMap
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up Python backend:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env` file with your Supabase credentials
   - Run the SQL migrations in your Supabase dashboard

5. Start the development server:
```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@lifemap.app or join our Discord community.