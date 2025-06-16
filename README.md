# LifeMap - Personal Growth Journaling App

A beautiful, feature-rich journaling app built with Expo and Supabase that helps users track their personal growth journey through daily reflections, mood tracking, and habit building.

## 🌟 Features

### 🔐 Authentication
- Email/password authentication via Supabase Auth
- User profiles with customizable information
- Secure session management

### 📝 Journaling
- Daily journal entries with mood tracking
- Habit tracking and progress visualization
- Rich text input with prompts for reflection
- Edit existing entries anytime
- Responsive design for mobile and tablet

### 📊 Analytics & Insights
- Mood trends and analytics
- Habit completion tracking
- Weekly summaries and progress reports
- AI-powered insights (Pro feature)

### 💎 Subscription Management
- Free tier with 30 entries per month
- Pro tier with AI insights and premium features
- Custom domain support for Pro users
- RevenueCat integration ready

### 🎨 Beautiful UI/UX
- Modern, clean design with smooth animations
- Dark/light theme support
- Responsive layout for all screen sizes
- Micro-interactions and haptic feedback

## 🚀 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Database, Auth, Realtime)
- **Navigation**: Expo Router
- **Styling**: StyleSheet with Linear Gradients
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Fonts**: Inter (Google Fonts)

## 📱 Screenshots

*Add screenshots of your app here*

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account
- Docker (for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lifemap-journaling-app.git
cd lifemap-journaling-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env` file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Run the SQL migrations in your Supabase dashboard
   - Enable Row Level Security (RLS) on all tables

5. Start the development server:
```bash
npm run dev
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values

3. Build and run with Docker Compose:
```bash
docker-compose up -d
```

The app will be available at `http://localhost:3000`

### Using Docker directly

1. Build the Docker image:
```bash
docker build -t lifemap-app .
```

2. Run the container:
```bash
docker run -d \
  --name lifemap-app \
  -p 3000:3000 \
  -e EXPO_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key \
  lifemap-app
```

### Environment Variables

The following environment variables are required:

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `EXPO_PUBLIC_BOTPRESS_WEBHOOK_URL` | Botpress webhook URL (for AI features) | No |
| `EXPO_PUBLIC_BOTPRESS_API_KEY` | Botpress API key (for AI features) | No |

### Health Checks

The Docker container includes health checks at `/health` endpoint. The container is considered healthy when this endpoint returns a 200 status code.

### Resource Requirements

- **Memory**: 256MB minimum, 512MB recommended
- **CPU**: 0.5 cores minimum, 1 core recommended
- **Storage**: 1GB minimum for container and logs

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
├── types/                 # TypeScript type definitions
│   ├── database.ts        # Database types
│   └── env.d.ts          # Environment types
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── nginx.conf            # Nginx configuration
└── .dockerignore         # Docker ignore file
```

## 🔑 Key Features Implementation

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
- Free tier with 30 entries per month
- Pro feature gating with AI insights
- Custom domain support for Pro users

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Docker Deployment
```bash
docker-compose up -d
```

### Mobile Deployment
1. Configure app.json for your target platforms
2. Build with EAS Build:
```bash
eas build --platform all
```

## 🔧 Production Considerations

### Security
- All environment variables are properly configured
- Nginx security headers are enabled
- Non-root user execution in Docker
- Health checks for container monitoring

### Performance
- Gzip compression enabled
- Static asset caching
- Optimized Docker image layers
- Resource limits configured

### Monitoring
- Health check endpoints
- Structured logging
- Container restart policies
- Resource usage monitoring

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

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)