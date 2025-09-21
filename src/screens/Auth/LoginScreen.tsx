import React, {useState, useContext} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';

import CustomText from '../../components/Text/CustomText';
import FormField from '../../components/Form/FormField';
import Button from '../../components/Button/Button';
import {COLORS, STRINGS} from '../../constants';

// Context & Utils
import {AuthContext} from '../../context/AuthContext';
import {normalizePhone} from '../../utils/phone';
import {API_BASE} from '../../constants/api';

// 🔒 Non-Expo secure storage
import EncryptedStorage from 'react-native-encrypted-storage';

type LoginResponse = {
  session_token: string;
  company_id?: string | number;
  role?: string;
  name?: string;
  phone?: string;
  message?: string; // optional backend error message
  [key: string]: any;
};

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {login} = useContext(AuthContext);

  const handleLogin = async () => {
    // reset error & set loading
    setFormError('');
    setPhoneError('');
    setPasswordError('');
    setIsLoading(true);

    const normalizedPhone = normalizePhone(phone.trim());
    const trimmedPassword = password.trim();

    // Validasi dasar
    if (!normalizedPhone) {
      setPhoneError('Nomor handphone wajib diisi');
      setIsLoading(false);
      return;
    }
    if (!trimmedPassword) {
      setPasswordError('Password tidak boleh kosong');
      setIsLoading(false);
      return;
    }

    try {
      // Call API
      const r = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          phone: normalizedPhone,
          password: trimmedPassword,
        }),
      });

      const data: LoginResponse = await r.json();

      if (!r.ok) {
        const msg = data?.message || 'Nomor HP atau password salah';
        if (r.status === 404) setPhoneError('Nomor handphone tidak terdaftar');
        else if (r.status === 401) setPasswordError('Password salah');
        else setFormError(msg);
        return;
      }

      if (!data?.session_token) {
        setFormError('Respon server tidak valid (token kosong).');
        return;
      }

      // 🔒 Simpan ke secure storage
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

      // 🔐 Update context pakai FORMAT OBJECT
      await (login as any)({
        token: data.session_token,
        companyId: (data.company_id as string) ?? null,
        role: (data.role as string) ?? null,
        profile: {name: data.name ?? normalizedPhone, phone: normalizedPhone},
      });

      // (opsional) navigate ke home
      // navigation.replace('Home');
    } catch (error) {
      console.error('Login failed:', error);
      setFormError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <CustomText variant="title" style={styles.screenTitle}>
          {STRINGS.login.title}
        </CustomText>

        <CustomText variant="body" style={styles.screenSubtitle}>
          {STRINGS.login.description}
        </CustomText>

        <FormField
          label="Nomor Telepon"
          placeholder="Nomor HP"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          error={phoneError}
        />

        <FormField
          label="Password"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />

        {formError ? (
          <CustomText variant="caption" style={styles.formError}>
            {formError}
          </CustomText>
        ) : null}

        <Button
          title={isLoading ? 'Memproses...' : 'Masuk'}
          variant="primary"
          onPress={handleLogin}
          disabled={isLoading}
        />

        <View style={styles.loginRow}>
          <CustomText variant="caption">Belum punya akun?</CustomText>
          <TouchableOpacity
            onPress={() => navigation.navigate('Auth', {screen: 'Register'})}>
            <CustomText variant="caption" style={styles.loginLink}>
              {STRINGS.login.registerLink}
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {padding: 24},
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
  formError: {color: 'red', textAlign: 'center', marginBottom: 12},
});

export default LoginScreen;
