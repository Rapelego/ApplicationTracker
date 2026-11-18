
/* =========================================
   SUPABASE CONFIGURATION
   Connects CareerTrack to the Supabase project
========================================= */

// Supabase project URL
const SUPABASE_URL = "https://mvqklsqrmsrziqmxctku.supabase.co";

// Supabase publishable key
// Safe for frontend use when database security is configured correctly
const SUPABASE_ANON_KEY = "sb_publishable_4Vz4pDvCekPh6PSiIUQ_-Q_ylmMNJ9W";

// Create the Supabase client
// This allows the application to communicate with Supabase
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
