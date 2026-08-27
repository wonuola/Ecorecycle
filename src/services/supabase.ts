// @ts-nocheck
// ============================================================================
// SUPABASE CLIENT
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use placeholder URL if not configured (prevents crash, won't connect)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseKey || 'placeholder-key'

export const supabase = createClient(url, key)

// Check if Supabase is configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey
