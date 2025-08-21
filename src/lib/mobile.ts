import { App } from '@capacitor/app';
import { Haptics } from '@capacitor/haptics';
import { PushNotifications } from '@capacitor/push-notifications';
import { StatusBar } from '@capacitor/status-bar';

export const initializeMobileFeatures = async () => {
  // Initialize Status Bar
  await StatusBar.setBackgroundColor({ color: '#ffffff' });
  await StatusBar.setStyle({ style: 'DARK' });

  // Initialize Push Notifications
  await PushNotifications.requestPermissions();
  await PushNotifications.register();

  // Add push notification listeners
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success:', token.value);
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration failed:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  // Add app state listeners
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?', isActive);
  });

  App.addListener('appUrlOpen', (data) => {
    console.log('App opened with URL:', data);
  });
};

export const triggerHapticFeedback = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: 'light' });
        break;
      case 'medium':
        await Haptics.impact({ style: 'medium' });
        break;
      case 'heavy':
        await Haptics.impact({ style: 'heavy' });
        break;
    }
  } catch (error) {
    console.error('Haptic feedback failed:', error);
  }
}; 