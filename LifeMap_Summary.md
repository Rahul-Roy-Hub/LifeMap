# LifeMap App – Summary

**LifeMap** is a modern, feature-rich journaling app designed to help users track their personal growth through daily reflections, mood tracking, habit building, and AI-powered insights. Built with React Native (Expo) for the frontend and Supabase for backend/database/authentication, it offers a seamless experience across mobile and web.

---

## Key Features
- **Authentication:** Secure email/password login via Supabase, with user profiles.
- **Journaling:** Daily entries, mood tracking (with emojis), and habit tracking.
- **Analytics & Insights:** Visual dashboards for mood trends, habit consistency, and weekly summaries.
- **AI Coach:** Integrated chat and weekly summary powered by Dappier AI, providing motivational feedback and personalized suggestions.
- **Subscription Management:** Free and Pro tiers, with RevenueCat integration for in-app purchases and paywall gating.
- **Customization:** Custom domains for Pro users, profile editing, and notification settings.
- **Real-Time Sync:** Instant updates of journal entries and analytics using Supabase's real-time features.
- **Beautiful UI/UX:** Clean, responsive design with animations, dark/light themes, and mobile-first layouts.

---

## Technical Stack
- **Frontend:** React Native (Expo), TypeScript, Expo Router, custom hooks, and reusable components.
- **Backend:** Supabase (database/auth), Flask Python server for AI/chat/analytics, RevenueCat for subscriptions.
- **AI/Chat:** Dappier API for AI coaching and analytics.

---

## Project Structure
```
app/         # Screens and navigation (tabs, chat, dashboard, settings, paywall)
components/  # UI components (Auth, Chat, Dashboard, Settings, etc.)
hooks/       # Custom React hooks (auth, profile, journal entries)
lib/         # Utilities (AI service, chat, RevenueCat, Supabase client)
server/      # Python backend (AI, analytics, weather)
types/       # TypeScript types (DB, env)
constants/, assets/  # Colors, images, icons
supabase/    # SQL migrations
```

---

## Deployment
- **Web:** `npm run build:web`
- **Mobile:** EAS Build for iOS/Android
- **Backend:** Flask server (Python 3.12+)

---

## License & Support
- MIT License
- Support via email or Discord

---

**LifeMap** empowers users to reflect, grow, and gain insights into their well-being, all within a beautifully designed, AI-enhanced journaling experience. 