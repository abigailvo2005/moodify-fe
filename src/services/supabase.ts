
// src/services/supabase.ts - NEW FILE
import { createClient } from "@supabase/supabase-js";
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env";

// Supabase configuration
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;
// Debug configuration
console.log("🔧 Supabase Config:");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "Set" : "Missing");

// Validate configuration
if (!supabaseUrl) {
  console.log("❌ EXPO_PUBLIC_SUPABASE_URL is missing!");
  throw new Error("Supabase URL is required");
}

if (!supabaseAnonKey) {
  console.log("❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is missing!");
  throw new Error("Supabase Anon Key is required");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic session refresh
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Storage bucket name (you'll create this in Supabase dashboard)
export const STORAGE_BUCKET = "mood-images";

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log("🧪 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("moods") // This table doesn't need to exist for connection test
      .select("count")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 = table doesn't exist, which is OK
      throw error;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.log("❌ Supabase connection failed:", error);
    return false;
  }
};

// Storage helper functions
export const getStoragePublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Make test available in development
if (__DEV__) {
  (global as any).testSupabase = testSupabaseConnection;
  console.log("🔧 Available: testSupabase() to test connection");
}

console.log("✅ Supabase client initialized");

export default supabase;
