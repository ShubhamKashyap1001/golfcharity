'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Profile, Subscription } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSubscription, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const loadUser = async (userId: string) => {
      try {
        // Load profile — retry once if trigger hasn't fired yet
        let profile: Profile | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (data) { profile = data as Profile; break; }
          await new Promise(r => setTimeout(r, 800));
        }
        if (profile) setUser(profile);

        // Load subscription — maybeSingle never throws on 0 rows
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')       // only care about active one
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // If no active, try any subscription (so lapsed/cancelled still shows)
        if (!sub) {
          const { data: anySub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          setSubscription(anySub as Subscription | null);
        } else {
          setSubscription(sub as Subscription);
        }
      } catch (err) {
        console.error('AuthProvider error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check session on mount (handles Stripe redirect back to app)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user.id);
      } else {
        reset(); // sets isLoading = false
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        reset();
        return;
      }
      if (session?.user) {
        // Re-load on SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
        loadUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSubscription, setLoading, reset]);

  return <>{children}</>;
}