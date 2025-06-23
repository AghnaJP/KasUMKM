import React, {useState} from 'react';
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
import {AuthStackParamList} from '../../types/navigation';
// UI Components
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import FormField from '../../components/Form/FormField';
import PhoneInputField from '../../components/Form/PhoneInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Modal & Colors
import SuccessModal from '../../components/Modal/SuccessModal';
import {COLORS, STRINGS} from '../../constants';
// DB & Utils
import {insertUser, getUserByPhone} from '../../database/users/userQueries';
import {validateRegisterInput} from '../../utils/form';
import {hashText} from '../../utils/crypto';

const RegisterScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setFormError('');

    const trimmedName = name.trim();
    const trimmedPhone = '08' + phone.trim();
    const trimmedPassword = password.trim();

    const errors = validateRegisterInput(
      trimmedName,
      trimmedPhone,
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
      const existingUser = await getUserByPhone(trimmedPhone);

      if (existingUser) {
        setPhoneError('Nomor handphone sudah terdaftar');
        setIsLoading(false);
        return;
      }

      const hashedPassword = await hashText(trimmedPassword);
      await insertUser(trimmedName, trimmedPhone, hashedPassword);

      setShowModal(true);
    } catch (error) {
      console.error('Registration failed:', error);
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
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
          setPassword('');
          setFormError('');
          navigation.navigate('Login');
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
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

export default RegisterScreen;
