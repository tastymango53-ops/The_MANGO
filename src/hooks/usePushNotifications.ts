import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// VAPID public key (URL-safe Base64)
const VAPID_PUBLIC_KEY =
  'BPRPHR_0s0j67-Z-Id9gcV8-KaQZxFMfBUtN-sgN8tIkXULCqzhSkH-uL6KXP8MNdEvV7YLWBu7W70n4ySRwy5I';

/** Convert a URL-safe Base64 string to a Uint8Array for pushManager.subscribe */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export function usePushNotifications(userId: string | undefined) {
  useEffect(() => {
    // Only run for authenticated users in supported browsers
    if (!userId) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Run silently in the background — don't block render
    const register = async () => {
      try {
        // 1. Check / request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return; // Silently bail if denied

        // 2. Register (or reuse existing) service worker
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          { scope: '/' }
        );

        // 3. Check if already subscribed
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          // Already subscribed — check if we already saved it for this user
          const subJson = existingSub.toJSON();
          const endpoint = subJson.endpoint ?? '';

          const { data: rows } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', userId)
            .eq('subscription->>endpoint', endpoint)
            .limit(1);

          if (rows && rows.length > 0) return; // Already saved, nothing to do
        }

        // 4. Create a new push subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // 5. Save to Supabase — ignore duplicate conflicts
        await supabase.from('push_subscriptions').upsert(
          { user_id: userId, subscription: subscription.toJSON() },
          { onConflict: 'user_id' }
        );
      } catch {
        // Silently swallow all errors — never surface to the customer
      }
    };

    register();
  }, [userId]);
}
