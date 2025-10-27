import {Platform} from 'react-native';

export const API_BASE = Platform.select({
  android: 'https://hzkglnqsiamcclyxlyjb.supabase.co/functions/v1',
  ios: 'https://hzkglnqsiamcclyxlyjb.supabase.co/functions/v1',
  default: 'https://hzkglnqsiamcclyxlyjb.supabase.co/functions/v1',
})!;
