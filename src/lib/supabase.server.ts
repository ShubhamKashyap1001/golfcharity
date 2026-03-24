// This file is SERVER ONLY — never import in Client Components or shared libs.
// Only import in: page.tsx (server), layout.tsx (server), route.ts API handlers.
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () =>
  createServerComponentClient({ cookies });