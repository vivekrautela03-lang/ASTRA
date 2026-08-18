/**
 * ASTRA OS — Environment & Configuration Manager
 */

export const CONFIG = {
  PORT: process.env.PORT || 8990,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'astra_quantum_jwt_secret_dev_32char_key',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://hzvsrqhfurghzkfdpxlt.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SECRET_KEY || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ASTRA_PERMISSIONS_STRICT: process.env.ASTRA_PERMISSIONS_STRICT !== 'false',
  ROBOTICS_SAFETY_INTERLOCK: process.env.ROBOTICS_SAFETY_INTERLOCK !== 'false'
};
