import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkTodayTransactions} from '../database/transactions/transactionQueries';

async function requestAlarmPermissions() {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    const hasNotif = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (!hasNotif) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Izin Notifikasi Diperlukan',
          'Untuk menerima notifikasi, aktifkan izin notifikasi di pengaturan.',
          [
            {text: 'Batal', style: 'cancel'},
            {text: 'Buka Pengaturan', onPress: () => Linking.openSettings()},
          ],
        );
      }
    }
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
  }
}

export async function configureNotifications() {
  await requestAlarmPermissions();

  PushNotification.configure({
    onRegister: token => console.log('Push token:', token),
    onNotification: notification => {
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },
    popInitialNotification: true,
    requestPermissions: false,
  });

  PushNotification.createChannel(
    {
      channelId: 'transaction-reminder',
      channelName: 'Pengingat Transaksi Harian',
      channelDescription:
        'Pengingat untuk mencatat pemasukan & pengeluaran setiap hari',
      importance: 4,
      vibrate: true,
    },
    created => console.log('Channel created:', created),
  );
}

export function scheduleReminder(message: string) {
  const now = new Date();
  const nextReminder = new Date();
  nextReminder.setHours(16, 14, 0, 0);
  if (now >= nextReminder) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  console.log('Menjadwalkan notifikasi untuk:', nextReminder);

  PushNotification.localNotificationSchedule({
    channelId: 'transaction-reminder',
    message,
    date: nextReminder,
    allowWhileIdle: true,
    importance: 'high',
    priority: 'high',
    vibrate: true,
    repeatType: 'day',
  });
}

export async function checkTransactions() {
  try {
    const todayKey = new Date().toDateString();
    const lastNotify = await AsyncStorage.getItem('lastNotificationDate');
    if (lastNotify === todayKey) {
      return;
    }

    const {hasIncome, hasExpense} = await checkTodayTransactions();
    let msg = null;
    if (!hasIncome && !hasExpense) {
      msg = 'Anda belum mencatat pemasukan & pengeluaran hari ini';
    } else if (!hasIncome) {
      msg = 'Anda belum mencatat pemasukan hari ini';
    } else if (!hasExpense) {
      msg = 'Anda belum mencatat pengeluaran hari ini';
    }

    if (msg) {
      scheduleReminder(msg);
      await AsyncStorage.setItem('lastNotificationDate', todayKey);
    }
  } catch (err) {
    console.error('checkTransactions error:', err);
  }
}
