import {Platform} from 'react-native';

export const API_BASE = Platform.select({
  android: 'https://rmrdjevgummesgdbdmxs.supabase.co/functions/v1',
  ios: 'https://rmrdjevgummesgdbdmxs.supabase.co/functions/v1',
  default: 'https://rmrdjevgummesgdbdmxs.supabase.co/functions/v1',
})!;
