import React, {useState} from 'react';
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

import {getUserByPhone} from '../../database/users/userQueries';
import {hashText} from '../../utils/crypto';

import {User} from '../../types/user';
import {useContext} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {normalizePhone} from '../../utils/phone';

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
      const user: User | null = await getUserByPhone(normalizedPhone);

      if (!user) {
        setPhoneError(STRINGS.login.errorPhoneNotFound);
        setIsLoading(false);
        return;
      }

      const hashedInputPassword = await hashText(trimmedPassword);

      if (user.password !== hashedInputPassword) {
        setPasswordError(STRINGS.login.errorPasswordWrong);
        setIsLoading(false);
        return;
      }

      login(user.name, user.phone);
    } catch (error) {
      console.error('Login failed:', error);
      setFormError('Terjadi kesalahan. Coba lagi nanti.');
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
  container: {
    padding: 24,
  },
  screenTitle: {
    marginBottom: 8,
  },
  screenSubtitle: {
    marginBottom: 24,
  },
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

export default LoginScreen;
