import webpush from 'web-push';

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  'mailto:your@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { subscription, title, body } = req.body;

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body })
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Push error:', error);
    res.status(500).json({ error: error.message });
  }
}