import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
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

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'transaction-reminder',
      name: 'Pengingat Transaksi Harian',
      description:
        'Pengingat untuk mencatat pendapatan & pengeluaran setiap hari',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
    console.log('Channel created');
  }
}

async function scheduleReminder(message: string) {
  await notifee.cancelNotification('daily-transaction-reminder');

  const now = new Date();
  const nextReminder = new Date();
  nextReminder.setHours(18, 0, 0, 0);
  if (now >= nextReminder) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextReminder.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  await notifee.createTriggerNotification(
    {
      id: 'daily-transaction-reminder',
      title: 'Pengingat Transaksi',
      body: message,
      android: {
        channelId: 'transaction-reminder',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );
  console.log(
    'Test notification scheduled for:',
    nextReminder.toLocaleTimeString(),
  );
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
      msg = 'Anda belum mencatat pendapatan & pengeluaran hari ini';
    } else if (!hasIncome) {
      msg = 'Anda belum mencatat pendapatan hari ini';
    } else if (!hasExpense) {
      msg = 'Anda belum mencatat pengeluaran hari ini';
    }

    if (msg) {
      await scheduleReminder(msg);
      await AsyncStorage.setItem('lastNotificationDate', todayKey);
    }
  } catch (err) {
    console.error('checkTransactions error:', err);
  }
}
