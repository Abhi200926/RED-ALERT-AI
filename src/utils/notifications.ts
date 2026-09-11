/**
 * Browser Notification Helper
 * Handles notification permissions and displays emergency alert notifications.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function showEmergencyNotification(title: string, body: string, isDemo = true): void {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(`${isDemo ? '[DEMO] ' : ''}RED ALERT AI: ${title}`, {
        body,
        icon: '/favicon.ico',
        tag: 'red-alert-emergency',
      });
    } catch (err) {
      console.warn('Could not trigger Notification:', err);
    }
  }
}

export const sendBrowserNotification = showEmergencyNotification;
