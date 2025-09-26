import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '../../constants';
import CustomText from '../../components/Text/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';
import InitialAvatar from '../../components/Avatar/InitialAvatar';
import {useAuth} from '../../context/AuthContext';

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ✅ ambil dari AuthContext baru
  const {companyId, role, profile} = useAuth();
  const isOwner = role === 'OWNER';
  const displayName = profile?.name || '-';
  const displayPhone = profile?.phone || '-';

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <InitialAvatar name={displayName} style={styles.avatar} />

        <CustomText variant="title" style={styles.name}>
          {displayName}
        </CustomText>
        <CustomText variant="body" style={styles.email}>
          {displayPhone}
        </CustomText>

        {/* Info tambahan opsional */}
        <View style={{marginTop: 8}}>
          <CustomText
            variant="caption"
            style={{textAlign: 'center', color: COLORS.gray}}>
            Role: {role ?? '-'}
          </CustomText>
          <CustomText
            variant="caption"
            style={{textAlign: 'center', color: COLORS.gray}}>
            Company: {companyId ?? '-'}
          </CustomText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.menu}
        onPress={() => navigation.navigate('App', {screen: 'EditProfile'})}>
        <CustomText variant="body">Akun Saya</CustomText>
        <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
      </TouchableOpacity>

      {isOwner && (
        <TouchableOpacity
          style={styles.menu}
          onPress={() =>
            navigation.navigate('App', {screen: 'TransactionReport'})
          }>
          <CustomText variant="body">Laporan keuangan</CustomText>
          <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    marginVertical: 50,
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkBlue,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
  },
});

export default ProfileScreen;
