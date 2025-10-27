import EncryptedStorage from 'react-native-encrypted-storage';
import {executeSql, rowsToArray} from '../db';

const ACCESS_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

export async function saveSession({
  userId, accessToken, refreshToken, expiresAt, deviceId,
}: { userId:string; accessToken:string; refreshToken?:string; expiresAt?:number; deviceId?:string }) {
  await EncryptedStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) {await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);}

  const now = Date.now();
  await executeSql(
    `INSERT INTO sessions (id,user_id,device_id,created_at,updated_at,expires_at,is_logged_in)
     VALUES (?,?,?,?,?,?,1)
     ON CONFLICT(id) DO UPDATE SET device_id=excluded.device_id, updated_at=excluded.updated_at,
       expires_at=excluded.expires_at, is_logged_in=1`,
    [userId, userId, deviceId ?? null, now, now, expiresAt ?? null],
  );
}

export async function getActiveSession() {
  const rs = await executeSql('SELECT id,user_id,expires_at FROM sessions WHERE is_logged_in=1 LIMIT 1');
  const arr = rowsToArray(rs);
  return arr[0] ?? null;
}

export const getAccessToken = () => EncryptedStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => EncryptedStorage.getItem(REFRESH_KEY);

export async function clearSession() {
  await EncryptedStorage.removeItem(ACCESS_KEY);
  await EncryptedStorage.removeItem(REFRESH_KEY);
  await executeSql('UPDATE sessions SET is_logged_in=0, updated_at=?', [Date.now()]);
}

export async function setSyncCursor(cursor: string | null, lastSyncAt?: number) {
  const s = await getActiveSession(); if (!s) {return;}
  await executeSql('UPDATE sessions SET sync_cursor=?, last_sync_at=?, updated_at=? WHERE id=?',
    [cursor, lastSyncAt ?? Date.now(), Date.now(), s.id]);
}

export async function getSyncState() {
  const s = await getActiveSession(); if (!s) {return null;}
  const rs = await executeSql('SELECT sync_cursor,last_sync_at FROM sessions WHERE id=?', [s.id]);
  return rowsToArray(rs)[0] ?? null;
}
