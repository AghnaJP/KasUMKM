import {Platform} from 'react-native';

export const API_BASE = Platform.select({
  android: 'https://ckyjksdwfnzjynzpurce.supabase.co/functions/v1',
  ios: 'https://ckyjksdwfnzjynzpurce.supabase.co/functions/v1',
  default: 'https://ckyjksdwfnzjynzpurce.supabase.co/functions/v1',
})!;
