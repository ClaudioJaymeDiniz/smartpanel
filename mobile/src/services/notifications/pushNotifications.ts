import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '@/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function syncPushTokenWithBackend(pushToken: string): Promise<void> {
  await api.patch('/auth/me', {
    globalMetadata: {
      expoPushToken: pushToken,
      pushProvider: Platform.OS,
      pushUpdatedAt: new Date().toISOString(),
    },
  });
}
