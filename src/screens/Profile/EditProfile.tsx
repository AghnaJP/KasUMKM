import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Alert, Text} from 'react-native';
import {COLORS} from '../../constants';
import {useAuth} from '../../context/AuthContext';
import {updateUserPassword} from '../../database/users/userQueries';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FormField from '../../components/Form/FormField';
import CustomText from '../../components/Text/CustomText';
import EditProfileModal from '../../components/Modal/EditProfileModal';
import EditPasswordModal from '../../components/Modal/EditPasswordModal';
import InitialAvatar from '../../components/Avatar/InitialAvatar';
import {API_BASE} from '../../constants/api';

const EditProfile = () => {
  const {profile, logout, deleteAccount, updateUserName} = useAuth();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin ingin keluar dari akun?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Hapus Akun', 'Apakah Anda yakin ingin menghapus akun ini?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            Alert.alert('Berhasil', 'Akun berhasil dihapus');
          } catch {
            Alert.alert('Gagal', 'Gagal menghapus akun');
          }
        },
      },
    ]);
  };

  const handleSaveName = async ({name}: {name: string}) => {
    try {
      await updateUserName(name); // update Supabase + SQLite + state
      setShowEditProfileModal(false);
      Alert.alert('Berhasil', 'Nama berhasil diperbarui');
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Gagal memperbarui nama');
    }
  };

  const handleSavePassword = async ({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      // 1) Update di Supabase via Edge Function (tanpa auth header)
      const resp = await fetch(`${API_BASE}/update_password`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          phone: profile.phone,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const raw = await resp.text();
      let json: any = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {}

      if (!resp.ok) {
        throw new Error(json?.error || `server_${resp.status}`);
      }

      // 2) Setelah server OK, update di SQLite
      await updateUserPassword(profile.phone, newPassword);

      setShowEditPasswordModal(false);
      Alert.alert('Berhasil', 'Kata sandi berhasil diperbarui');
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Gagal memperbarui kata sandi');
    }
  };

  return (
    <View style={styles.container}>
      <InitialAvatar name={profile.name} style={styles.avatar} />

      <View style={styles.profile}>
        <FormField
          label="Nama Pengguna"
          value={profile.name}
          touchableOnly
          onPress={() => setShowEditProfileModal(true)}
          rightIcon={<Icon name="edit" size={16} color={COLORS.darkBlue} />}
        />

        <FormField label="Nomor Telepon" value={profile.phone} touchableOnly />

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
        profileData={{name: profile.name}}
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
    marginVertical: 50,
    marginHorizontal: 24,
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {width: 150, height: 150, borderRadius: 75, marginBottom: 24},
  profile: {alignSelf: 'stretch', marginBottom: 32},
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
  buttonText: {color: COLORS.white, fontSize: 16, fontWeight: '600'},
});

export default EditProfile;
