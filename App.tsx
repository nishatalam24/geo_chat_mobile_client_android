import React, { useEffect, useState } from 'react';
import { Alert, View, Text, Button, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import axios from 'axios';

const API_URL = 'https://apis.kameocabs.com/api/test'; // Change to your API endpoint

async function createChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    sound: 'default',
    importance: AndroidImportance.HIGH,
  });
}

async function requestPermissions() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
  await notifee.requestPermission();
  await messaging().requestPermission();
}

const App = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Permissions and channel
    requestPermissions();
    createChannel();

    // Get FCM token
    messaging()
      .getToken()
      .then(token => {
        setFcmToken(token);
        console.log('FCM Token:', token);
      });

    // Foreground FCM handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || 'You got a notification',
        android: {
          channelId: 'default',
          sound: 'default',
          pressAction: { id: 'default' },
        },
      });
      axios.post(API_URL, { status: 'success' }).catch(() => {});
    });

    return unsubscribe;
  }, []);

  // Background handler (must be outside component, but for demo, we keep here)
  useEffect(() => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification',
        body: remoteMessage.notification?.body || remoteMessage.data?.body || 'You got a notification',
        android: {
          channelId: 'default',
          sound: 'default',
        },
      });
      axios.post(API_URL, { status: 'success' }).catch(() => {});
    });
  }, []);

  const copyToken = () => {
    if (fcmToken) {
      Clipboard.setString(fcmToken);
      Alert.alert('Copied', 'FCM token copied to clipboard!');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>GeoChat FCM Demo</Text>
      {fcmToken ? (
        <>
          <Text selectable style={{ marginVertical: 10, color: 'blue' }}>{fcmToken}</Text>
          <Button title="Copy FCM Token" onPress={copyToken} />
        </>
      ) : (
        <Text>Fetching FCM token...</Text>
      )}
      <Text style={{ marginTop: 20, color: 'gray', fontSize: 12 }}>
        Send FCM with notification payload for sound/banner.
      </Text>
    </View>
  );
};

export default App;