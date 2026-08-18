/**
 * ASTRA OS — Environment & Configuration Manager
 */

import fs from 'fs';
import path from 'path';

// Load .env automatically if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
          // Mirror VITE_ prefix to non-prefixed and vice versa
          if (key.startsWith('VITE_')) {
            const nonPrefixed = key.replace(/^VITE_/, '');
            if (!process.env[nonPrefixed]) process.env[nonPrefixed] = val;
          } else {
            const prefixed = `VITE_${key}`;
            if (!process.env[prefixed]) process.env[prefixed] = val;
          }
        }
      }
    } catch (err) {
      console.warn('[CONFIG] Failed to parse .env file:', err.message);
    }
  }
}

loadEnv();

export const CONFIG = {
  PORT: process.env.PORT || 8990,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'astra_quantum_jwt_secret_dev_32char_key',
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hzvsrqhfurghzkfdpxlt.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ASTRA_PERMISSIONS_STRICT: process.env.ASTRA_PERMISSIONS_STRICT !== 'false',
  ROBOTICS_SAFETY_INTERLOCK: process.env.ROBOTICS_SAFETY_INTERLOCK !== 'false'
};
