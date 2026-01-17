import { getMessagingInstance } from '../firebase/config';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const messaging = await getMessagingInstance();
      if (!messaging) {
        console.log('Messaging not supported');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const setupForegroundNotifications = async () => {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'Habit Reminder';
    const notificationOptions = {
      body: payload.notification?.body || 'Time to complete your habit!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      tag: 'habit-reminder',
    };

    if (Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};

export const scheduleLocalNotification = (habitName: string, time: string) => {
  // For MVP, we'll use browser's Notification API
  // In production, you'd want to use Firebase Cloud Functions to schedule notifications
  
  if (Notification.permission !== 'granted') {
    return;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // If the time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    new Notification('Habit Reminder', {
      body: `Time to complete: ${habitName}`,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      tag: 'habit-reminder',
    });
  }, delay);
};
