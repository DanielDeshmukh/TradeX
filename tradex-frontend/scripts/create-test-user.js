#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-undef */

/**
 * TradeX Test User Creator
 *
 * Creates a test user for development.
 *
 * Usage:
 *   node create-test-user.js
 *
 * Environment Variables:
 *   VITE_SUPABASE_URL - Supabase project URL
 *   VITE_SUPABASE_ANON_KEY - Supabase anonymous key
 *   SERVICE_ROLE_KEY - Supabase service role key (for admin operations)
 */

import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const TEST_USER = {
  email: 'test@tradex.dev',
  password: 'TradeX123!',
  metadata: {
    full_name: 'Test User',
    role: 'developer'
  }
};

async function createTestUser() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       TradeX Test User Creator           ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️  Supabase not configured. Creating offline test credentials...\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│  Test User Credentials (Offline Mode)   │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│  Email:    ${TEST_USER.email}`);
    console.log(`│  Password: ${TEST_USER.password}`);
    console.log('└─────────────────────────────────────────┘');
    console.log('\nNote: Configure Supabase in .env to enable online auth.\n');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

  try {
    console.log('📧 Creating test user...');
    
    const { error } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: TEST_USER.metadata
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Test user already exists!\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Test user created successfully!\n');
    }

    console.log('┌─────────────────────────────────────────┐');
    console.log('│         Test User Credentials            │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│  Email:    ${TEST_USER.email}`);
    console.log(`│  Password: ${TEST_USER.password}`);
    console.log('└─────────────────────────────────────────┘');
    console.log('\n🔐 Use these credentials to log in at http://localhost:5173/login\n');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.log('\n💡 Make sure SERVICE_ROLE_KEY is set in .env for admin operations.\n');
  }
}

createTestUser();
