import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { api } from '@/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
}

async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('project-invitations', {
    name: 'Convites de projeto',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563EB',
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  await setupAndroidNotificationChannel();

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

function getNotificationRoute(data: Notifications.NotificationContent['data']) {
  const projectId = typeof data?.projectId === 'string' ? data.projectId : undefined;
  const invitationId = typeof data?.invitationId === 'string' ? data.invitationId : undefined;
  const screen = typeof data?.screen === 'string' ? data.screen : undefined;

  if (projectId) {
    return {
      pathname: '/(project)/[id]',
      params: {
        id: projectId,
        invitationId,
      },
    } as const;
  }

  if (screen === 'project-invitation' || invitationId) {
    return '/(drawer)/(tabs)/profile' as const;
  }

  return null;
}

export function useNotificationNavigation(enabled: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const openNotification = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;

      const route = getNotificationRoute(response.notification.request.content.data);
      if (route) {
        router.push(route);
      }
    };

    Notifications.getLastNotificationResponseAsync().then(openNotification);

    const subscription = Notifications.addNotificationResponseReceivedListener(openNotification);
    return () => subscription.remove();
  }, [enabled, router]);
}
