import {Platform} from 'react-native';

export const API_BASE = Platform.select({
  android: __DEV__ ? 'http://10.0.2.2:3000' : 'https://your.api',
  ios: __DEV__ ? 'http://localhost:3000' : 'https://your.api',
  default: __DEV__ ? 'http://localhost:3000' : 'https://your.api',
})!;
