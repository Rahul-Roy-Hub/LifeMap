import 'dotenv/config';

export default {
  "expo": {
    "name": "LifeMap",
    "slug": "lifemap",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/lifemaplogo.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "app.lifemap.journal",
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/lifemaplogo.png"
    },
    "plugins": ["expo-router", "expo-font", "expo-web-browser"],
    "experiments": {
      "typedRoutes": true
    },
    "android": {
      "package": "app.lifemap.journal"

    },
    "extra": {
      eas: {
        projectId: "779700c2-839a-4588-a41b-81894466c0fa"
      },
      "openWeatherMapApiKey": process.env.OPENWEATHERMAP_API_KEY,
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
