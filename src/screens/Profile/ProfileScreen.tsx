import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '../../constants';
import {AuthContext} from '../../context/AuthContext';
import {getUserByPhone} from '../../database/users/userQueries';
import type {User} from '../../types/user';
import CustomText from '../../components/Text/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';
import InitialAvatar from '../../components/Avatar/InitialAvatar';

const ProfileScreen = () => {
  const {userPhone, userName} = useContext(AuthContext);
  const [_user, setUser] = useState<User | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchUser = async () => {
      if (userPhone) {
        const userData = await getUserByPhone(userPhone);
        setUser(userData);
      }
    };
    fetchUser();
  }, [userPhone]);

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        {/* sebelum:
  <Image source={require('../../assets/images/profile.png')} style={styles.avatar} />
  */}
        <InitialAvatar name={userName} style={styles.avatar} />
        <CustomText variant="title">{userName || '-'}</CustomText>
        <CustomText variant="body">{userPhone || '-'}</CustomText>
      </View>

      <TouchableOpacity
        style={styles.menu}
        onPress={() => navigation.navigate('App', {screen: 'EditProfile'})}>
        <CustomText variant="body">Akun Saya</CustomText>
        <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menu}
        onPress={() =>
          navigation.navigate('App', {screen: 'TransactionReport'})
        }>
        <CustomText variant="body">Laporan keuangan</CustomText>
        <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
      </TouchableOpacity>
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
    width: 200,
    height: 200,
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
