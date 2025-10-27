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

import {AuthContext} from '../../context/AuthContext';
import {normalizePhone} from '../../utils/phone';
import {API_BASE} from '../../constants/api';

import EncryptedStorage from 'react-native-encrypted-storage';

type LoginResponse = {
  ok?: boolean;
  token?: string;
  expires_at?: string | null;
  user?: {id: string; name: string; phone: string};
  memberships?: Array<{company_id: string; role: string}>;
  default_company_id?: string | null;
  default_role?: string | null;
  message?: string;
  error?: string;
  [k: string]: any;
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
    setFormError('');
    setPhoneError('');
    setPasswordError('');
    setIsLoading(true);

    const normalizedPhone = normalizePhone(phone.trim());
    const trimmedPassword = password.trim();

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
        const msg =
          data?.message || data?.error || 'Nomor HP atau password salah';
        if (r.status === 401) {setFormError('Nomor HP atau password salah');}
        else {setFormError(msg);}
        return;
      }

      const sessionToken = data?.token ?? null;
      const companyId = data?.default_company_id ?? null;
      const role = data?.default_role ?? null;

      if (!sessionToken) {
        setFormError('Respon server tidak valid (token kosong).');
        return;
      }

      try {
        await EncryptedStorage.setItem('session_token', String(sessionToken));
        if (companyId != null) {
          await EncryptedStorage.setItem('company_id', String(companyId));
        } else {
          await EncryptedStorage.removeItem('company_id');
        }
        if (role != null) {
          await EncryptedStorage.setItem('role', String(role));
        } else {
          await EncryptedStorage.removeItem('role');
        }
      } catch (e) {
        console.warn('Failed to persist secure data:', e);
      }

      await (login as any)({
        token: sessionToken,
        companyId,
        role,
        profile: {
          name: data?.user?.name ?? normalizedPhone,
          phone: data?.user?.phone ?? normalizedPhone,
        },
      });

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
