import 'dotenv/config';

export default {
  "expo": {
    "name": "bolt-expo-nativewind",
    "slug": "bolt-expo-nativewind",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "your.bundle.identifier",
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": ["expo-router", "expo-font", "expo-web-browser"],
    "experiments": {
      "typedRoutes": true
    },
    "android": {
      "package": "app.lifemap.journal"

    },
    "extra": {
      "openWeatherMapApiKey": process.env.OPENWEATHERMAP_API_KEY,
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
