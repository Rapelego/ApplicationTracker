
/* =========================================
   SUPABASE CONFIGURATION
   Connects CareerTrack to the Supabase project
========================================= */

// Supabase project URL
const SUPABASE_URL = "YOUR_PROJECT_URL";

// Supabase publishable key
// Safe for frontend use when database security is configured correctly
const SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_KEY";

// Create the Supabase client
// This allows the application to communicate with Supabase
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
