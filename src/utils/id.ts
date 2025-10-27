import uuid from 'react-native-uuid';
export function newId(): string {
  return String(uuid.v4());
}
