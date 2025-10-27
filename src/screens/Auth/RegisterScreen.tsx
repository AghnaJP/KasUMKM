import React, {useState, useContext} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import FormField from '../../components/Form/FormField';
import PhoneInputField from '../../components/Form/PhoneInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SuccessModal from '../../components/Modal/SuccessModal';
import {COLORS, STRINGS} from '../../constants';
import {validateRegisterInput} from '../../utils/form';
import {normalizePhone} from '../../utils/phone';
import {AuthContext} from '../../context/AuthContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import {API_BASE} from '../../constants/api';
import {insertUserWithId} from '../../database/users/userQueries';

type RegisterResponse = {
  ok?: boolean;

  token?: string | null;
  expires_at?: string | null;
  user?: {id: string; name: string; phone: string; created_at: string};
  company?: {id: string; name: string; created_at: string};
  membership?: {
    id: string;
    company_id: string;
    role: string;
    created_at: string;
  };
  error?: string;
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
  const [showModal, setShowModal] = useState(false);
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
      const url = `${API_BASE}/register`;
      console.log('POST', url);

      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: normalized,
          password: trimmedPassword,
          invite_code: inviteCode ? inviteCode.trim().toUpperCase() : undefined,
        }),
      });

      const raw = await r.text();
      console.log('Register raw:', raw);

      const data: RegisterResponse = JSON.parse(raw);
      console.log('Register parsed:', data);

      if (!r.ok) {
        if (r.status === 409) {
          setPhoneError('Nomor handphone sudah terdaftar');
        } else if (r.status === 400) {
          setFormError(data?.message || 'Data tidak valid');
        } else {
          setFormError(data?.message || 'Gagal mendaftar');
        }
        return;
      }

      const loginRes = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: normalized, password: trimmedPassword}),
      });

      const loginJson: any = await loginRes.json();
      if (!loginRes.ok) {
        const msg =
          loginJson?.message || loginJson?.error || 'Gagal login otomatis';
        setFormError(msg);
        return;
      }

      const sessionToken = loginJson?.token ?? null;
      if (!sessionToken) {
        setFormError('Login berhasil tapi token kosong.');
        return;
      }

      const companyId = loginJson?.default_company_id ?? null;
      const role = loginJson?.default_role ?? null;

      try {
        await EncryptedStorage.setItem('session_token', String(sessionToken));
        if (companyId != null)
          {await EncryptedStorage.setItem('company_id', String(companyId));}
        else {await EncryptedStorage.removeItem('company_id');}
        if (role != null) {await EncryptedStorage.setItem('role', String(role));}
        else {await EncryptedStorage.removeItem('role');}
      } catch (e) {
        console.warn('Failed to persist secure data:', e);
      }

      await (login as any)({
        token: sessionToken,
        companyId,
        role,
        profile: {
          name: loginJson?.user?.name ?? trimmedName,
          phone: loginJson?.user?.phone ?? normalized,
        },
      });

      try {
        await insertUserWithId(
          loginJson?.user?.id ?? '',
          loginJson?.user?.name ?? trimmedName,
          loginJson?.user?.phone ?? normalized,
          trimmedPassword,
        );
        console.log('User inserted locally in SQLite');
      } catch (err) {
        console.warn('Failed to insert user locally:', err);
      }

      navigation.replace('App', {screen: 'AppTabs', params: {screen: 'Home'}});

      try {
        await insertUserWithId(
          data?.user?.id ?? '',
          data?.user?.name ?? trimmedName,
          data?.user?.phone ?? normalized,
          trimmedPassword,
        );

        console.log('User inserted locally in SQLite');
      } catch (err) {
        console.warn('Failed to insert user locally:', err);
        console.warn('Full error:', JSON.stringify(err, null, 2));
      }

      navigation.replace('App', {
        screen: 'AppTabs',
        params: {screen: 'Home'},
      });
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
