import React, {useState, useContext} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
// Navigation
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
// UI Components
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import FormField from '../../components/Form/FormField';
import PhoneInputField from '../../components/Form/PhoneInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Modal & Colors
import SuccessModal from '../../components/Modal/SuccessModal';
import {COLORS, STRINGS} from '../../constants';
// Utils & Context
import {validateRegisterInput} from '../../utils/form';
import {normalizePhone} from '../../utils/phone';
import {AuthContext} from '../../context/AuthContext';
// 🔒 Encrypted storage (non-Expo)
import EncryptedStorage from 'react-native-encrypted-storage';
import {API_BASE} from '../../constants/api';

type RegisterResponse = {
  session_token: string;
  company_id?: string | number;
  role?: string;
  name?: string;
  phone?: string;
  message?: string;
  [key: string]: any;
};

const RegisterScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [showModal, setShowModal] = useState(false); // optional flow
  const [isLoading, setIsLoading] = useState(false);

  const {login} = useContext(AuthContext);

  const handleRegister = async () => {
    setIsLoading(true);
    setFormError('');
    setNameError('');
    setPhoneError('');
    setPasswordError('');

    const trimmedName = name.trim();
    const normalized = normalizePhone(phone.trim());
    const trimmedPassword = password.trim();

    const errors = validateRegisterInput(
      trimmedName,
      normalized,
      trimmedPassword,
    );

    setNameError(errors.nameError);
    setPhoneError(errors.phoneError);
    setPasswordError(errors.passwordError);

    if (errors.nameError || errors.phoneError || errors.passwordError) {
      setIsLoading(false);
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: trimmedName,
          phone: normalized,
          password: trimmedPassword,
          invite_code: inviteCode || undefined,
        }),
      });

      const data: RegisterResponse = await r.json();

      if (!r.ok) {
        if (r.status === 409) setPhoneError('Nomor handphone sudah terdaftar');
        else if (r.status === 400)
          setFormError(data?.message || 'Data tidak valid');
        else setFormError(data?.message || 'Gagal mendaftar');
        return;
      }

      if (!data?.session_token) {
        setFormError('Respon server tidak valid (token kosong).');
        return;
      }

      // 🔒 Simpan ke EncryptedStorage
      try {
        await EncryptedStorage.setItem(
          'session_token',
          String(data.session_token),
        );
        if (data.company_id != null) {
          await EncryptedStorage.setItem('company_id', String(data.company_id));
        } else {
          await EncryptedStorage.removeItem('company_id');
        }
        if (data.role != null) {
          await EncryptedStorage.setItem('role', String(data.role));
        } else {
          await EncryptedStorage.removeItem('role');
        }
      } catch (e) {
        console.warn('Failed to persist secure data:', e);
      }

      console.log('token:', await EncryptedStorage.getItem('session_token'));
      console.log('company_id:', await EncryptedStorage.getItem('company_id'));
      console.log('role:', await EncryptedStorage.getItem('role'));

      // 🔐 Update context: FORMAT OBJECT (wajib)
      await (login as any)({
        token: data.session_token,
        companyId: (data.company_id as string) ?? null,
        role: (data.role as string) ?? null,
        profile: {name: trimmedName, phone: normalized},
      });

      // ✅ UX: Auto-login ke Home (disarankan)
      navigation.replace('App', {
        screen: 'AppTabs',
        params: {
          screen: 'Home',
        },
      });

      // --- ALTERNATIF FLOW (pakai modal & ke Login):
      // setShowModal(true);
      // navigation.replace('Auth', { screen: 'Login' });
    } catch (error) {
      console.error('Registration failed:', error);
      setFormError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
      style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <CustomText variant="title" style={styles.screenTitle}>
          {STRINGS.register.title}
        </CustomText>
        <CustomText variant="body" style={styles.screenSubtitle}>
          {STRINGS.register.description}
        </CustomText>

        <FormField
          label="Nama Pengguna"
          placeholder="Masukkan nama kamu"
          value={name}
          onChangeText={setName}
          error={nameError}
        />

        <PhoneInputField
          label="Nomor Handphone"
          value={phone}
          onChangeText={setPhone}
          placeholder="xxxxxxxxxxxx"
          error={phoneError}
        />

        {/* Opsional: Kode undangan */}
        <FormField
          label="Kode Undangan (opsional)"
          placeholder="Masukkan kode jika ada"
          value={inviteCode}
          onChangeText={setInviteCode}
        />

        <FormField
          label="Buat Kata Sandi"
          placeholder="tulis kata sandi anda"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          rightIcon={
            <TouchableOpacity
              onPress={() => setPasswordVisible(!isPasswordVisible)}>
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          }
          error={passwordError}
        />

        {formError ? (
          <CustomText variant="caption" style={styles.formError}>
            {formError}
          </CustomText>
        ) : null}

        <Button
          title={isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          variant="primary"
          onPress={handleRegister}
          disabled={isLoading}
        />

        <View style={styles.loginRow}>
          <CustomText variant="caption">Sudah punya akun?</CustomText>
          <TouchableOpacity
            onPress={() => navigation.navigate('Auth', {screen: 'Login'})}>
            <CustomText variant="caption" style={styles.loginLink}>
              {STRINGS.register.loginLink}
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal ini hanya dipakai kalau kamu pilih flow modal */}
      <SuccessModal
        visible={showModal}
        title={STRINGS.register.successTitle}
        description="Silakan login untuk mulai menggunakan aplikasi"
        buttonLabel="Login"
        onClose={() => {
          setShowModal(false);
          setName('');
          setPhone('');
          setInviteCode('');
          setPassword('');
          setFormError('');
          navigation.navigate('Auth', {screen: 'Login'});
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {flex: 1},
  container: {padding: 24, paddingBottom: 40},
  screenTitle: {marginBottom: 8},
  screenSubtitle: {marginBottom: 24},
  loginRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  loginLink: {
    color: COLORS.lightBlue,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  formError: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default RegisterScreen;
