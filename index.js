import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';

// This runs even when the app is killed (Android, data-only FCM)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Headless Task: ', remoteMessage);

  // Your custom code here
  await fetch('https://apis.kameocabs.com/api/test', {
    method: 'POST',
    body: JSON.stringify({ status: "killed-mode-ran" }),
    headers: { "Content-Type": "application/json" }
  });
});

AppRegistry.registerComponent('geochat', () => App);