import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Text,
} from 'react-native';
import {COLORS} from '../../constants';
import {AuthContext} from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserByPhone,
  editUsername,
  updateUserPassword,
  deleteUser,
} from '../../database/users/userQueries';
import type {User} from '../../types/user';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FormField from '../../components/Form/FormField';
import CustomText from '../../components/Text/CustomText';
import EditProfileModal from '../../components/Modal/EditProfileModal';
import EditPasswordModal from '../../components/Modal/EditPasswordModal';

const EditProfile = () => {
  const {userName, userPhone, logout} = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (userPhone) {
        const userData = await getUserByPhone(userPhone);
        setUser(userData);
      }
    };
    fetchUser();
  }, [userPhone]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin ingin keluar dari akun?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('isLoggedIn');
          logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      return;
    }
    Alert.alert(
      'Hapus Akun',
      'Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.phone);
              await AsyncStorage.removeItem('isLoggedIn');
              logout();
              Alert.alert('Akun berhasil dihapus');
            } catch (e) {
              Alert.alert('Gagal', 'Gagal menghapus akun');
            }
          },
        },
      ],
    );
  };

  const {updateUserName} = useContext(AuthContext);

  const handleSaveName = async ({name}: {name: string}) => {
    if (!user) {
      return;
    }
    try {
      await editUsername(name, user.phone);
      setUser({...user, name});
      updateUserName(name);
      setShowEditProfileModal(false);
      Alert.alert('Berhasil', 'Nama berhasil diperbarui');
    } catch (e) {
      Alert.alert('Gagal', 'Gagal memperbarui nama');
    }
  };

  const handleSavePassword = async ({password}: {password: string}) => {
    if (!user) {
      return;
    }
    await updateUserPassword(user.phone, password);
    setShowEditPasswordModal(false);
    Alert.alert('Berhasil', 'Kata sandi berhasil diperbarui');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/profile.png')}
        style={styles.avatar}
      />
      <View style={styles.profile}>
        <FormField
          label="Nama Pengguna"
          value={userName}
          touchableOnly
          onPress={() => setShowEditProfileModal(true)}
          rightIcon={<Icon name="edit" size={16} color={COLORS.darkBlue} />}
        />

        <FormField label="Nomor Telepon" value={userPhone} touchableOnly />

        <TouchableOpacity
          style={styles.password}
          onPress={() => setShowEditPasswordModal(true)}>
          <CustomText>Ganti Kata Sandi</CustomText>
          <Icon name="chevron-right" size={20} color={COLORS.darkBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Keluar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button]} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Hapus Akun</Text>
        </TouchableOpacity>
      </View>

      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSave={handleSaveName}
        profileData={user ? {name: user.name} : null}
      />
      <EditPasswordModal
        visible={showEditPasswordModal}
        onClose={() => setShowEditPasswordModal(false)}
        onSave={handleSavePassword}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    marginVertical: 70,
    marginHorizontal: 15,
    borderWidth: 0.8,
    borderColor: '#e0e0e0',
    borderRadius: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 24,
  },
  profile: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  password: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 26,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.red,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;
