import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode: when Supabase is not configured
const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Mock Supabase client for demo mode
const createMockClient = () => {
  const mockUser = {
    id: "demo-user-001",
    email: "test@tradex.dev",
    user_metadata: {
      full_name: "Test User",
      role: "developer"
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString()
  };

  const mockSession = {
    user: mockUser,
    access_token: "demo-token",
    refresh_token: "demo-refresh",
    expires_at: Date.now() + 3600000
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async (credentials) => {
        if (credentials.email === "test@tradex.dev" && credentials.password === "TradeX123!") {
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        return { data: null, error: { message: "Invalid login credentials" } };
      },
      signUp: async () => {
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: mockUser }, error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            then: (resolve) => resolve({ data: [], error: null })
          })
        })
      }),
      insert: (data) => ({
        then: (resolve) => resolve({ data, error: null })
      })
    }),
    functions: {
      invoke: () => ({
        then: (resolve) => resolve({ data: { data: null }, error: null })
      })
    }
  };
};

// Create either real or mock client
const supabase = isDemoMode ? createMockClient() : createClient(supabaseUrl, supabaseAnonKey);

export { isDemoMode };
export default supabase;
