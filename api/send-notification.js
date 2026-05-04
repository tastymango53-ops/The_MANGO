console.log('FUNCTION STARTED');
import webpush from 'web-push';
console.log('webpush loaded:', typeof webpush);
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:mfurniturewala2007@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('SUPABASE URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('VAPID PUBLIC:', process.env.VAPID_PUBLIC_KEY ? 'SET' : 'MISSING');
console.log('VAPID PRIVATE:', process.env.VAPID_PRIVATE_KEY ? 'SET' : 'MISSING');
console.log('SERVICE KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

const STATUS_MESSAGES = {
  confirmed: {
    title: '✅ Order Confirmed!',
    body: (name, id) => `Hi ${name}! Your Red Rose Mango order #${id} is confirmed 🥭 We are preparing it now.`,
  },
  shipped: {
    title: '🚚 Order Shipped!',
    body: (name, id) => `Hi ${name}! Your order #${id} is on the way! Red Rose Mango is coming to you.`,
  },
  delivered: {
    title: '🎉 Order Delivered!',
    body: (name, id) => `Hi ${name}! Your order #${id} has been delivered! Enjoy your Red Rose Mangoes!`,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { orderId, customer_name, newStatus, user_id } = req.body || {};

    if (!orderId || !customer_name || !newStatus) {
      console.error('send-notification: missing fields', req.body);
      return res.status(400).json({ error: 'orderId, customer_name and newStatus are required' });
    }

    if (!user_id) {
      console.warn('send-notification: no user_id provided — skipping push to avoid broadcasting to all customers');
      return res.status(200).json({ success: true, sent: 0, skipped: true });
    }

    const msgTemplate = STATUS_MESSAGES[newStatus];
    if (!msgTemplate) {
      return res.status(400).json({ error: `Unknown status: ${newStatus}` });
    }

    const shortId = orderId.slice(0, 8).toUpperCase();
    const title = msgTemplate.title;
    const body = msgTemplate.body(customer_name, shortId);

    console.log(`send-notification: status=${newStatus} orderId=${shortId} customer=${customer_name}`);

    // Read only the subscriptions belonging to this specific customer
    console.log(`send-notification: looking up subscriptions for user_id=${user_id}`);
    const { data: rows, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id);

    if (dbError) {
      console.error('send-notification: Supabase error', dbError);
      return res.status(500).json({ error: 'Failed to read subscriptions', detail: dbError.message });
    }

    if (!rows || rows.length === 0) {
      console.log('send-notification: no subscriptions found');
      return res.status(200).json({ success: true, sent: 0 });
    }

    console.log(`send-notification: sending to ${rows.length} subscription(s)`);

    const payload = JSON.stringify({ title, body });
    const results = await Promise.allSettled(
      rows.map((row) =>
        webpush.sendNotification(row.subscription, payload).then(() => {
          console.log('send-notification: push sent OK');
        })
      )
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      failed.forEach((f) => console.error('send-notification: push failed', f.reason));
    }

    return res.status(200).json({
      success: true,
      sent: results.length - failed.length,
      failed: failed.length,
    });
  } catch (err) {
    console.error('NOTIFICATION ERROR:', err);
    return res.status(500).json({ 
      error: err.message, 
      stack: err.stack 
    });
  }
};