import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {COLORS} from '../../constants';
import {AuthContext} from '../../context/AuthContext';
import {getUserByPhone} from '../../database/users/userQueries';
import type {User} from '../../types/user';
import CustomText from '../../components/Text/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';

const ProfileScreen = () => {
  const {userPhone} = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);

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
        <Image
          source={require('../../assets/images/profile.png')}
          style={styles.avatar}
        />
        <CustomText variant="title">{user?.name || '-'}</CustomText>
        <CustomText variant="body">{user?.phone || '-'}</CustomText>
      </View>

      <TouchableOpacity
        style={styles.menu}
        onPress={() => navigation.navigate('App', {screen: 'EditProfile'})}>
        <CustomText variant="body">Akun Saya</CustomText>
        <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menu}
        onPress={() => navigation.navigate('App', {screen: 'TransactionReport'})}>
        <CustomText variant="body">Laporan keuangan</CustomText>
        <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    marginVertical: 50,
    borderWidth: 0.8,
    borderColor: '#e0e0e0',
    borderRadius: 10,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 60,
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
