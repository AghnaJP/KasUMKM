import {PermissionsAndroid, Platform} from 'react-native';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];

      // For Android 13+ (API 33+)
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      }

      const results = await PermissionsAndroid.requestMultiple(permissions);

      console.log('Permission results:', results);

      // Check if all required permissions are granted
      const allGranted = Object.values(results).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED,
      );

      return allGranted;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }
  return true;
};
