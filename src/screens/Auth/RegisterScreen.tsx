import React, {useState} from 'react';
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
import {AuthStackParamList} from '../../types/navigation';
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import FormField from '../../components/Form/FormField';
import {COLORS} from '../../constants';
import PhoneInputField from '../../components/Form/PhoneInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RegisterScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [pin, setPin] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
      style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <CustomText variant="title" style={styles.screenTitle}>
          Ayo Daftar
        </CustomText>

        <CustomText variant="body" style={styles.screenSubtitle}>
          Buat akun dan mulai kelola keuanganmu
        </CustomText>

        <FormField
          label="Nama Pengguna"
          placeholder="Masukkan nama kamu"
          value={name}
          onChangeText={setName}
        />

        <PhoneInputField
          label="Nomor Handphone"
          value={phone}
          onChangeText={setPhone}
          placeholder="xxxxxxxxxxxx"
        />

        <FormField
          key={isPasswordVisible ? 'visible' : 'hidden'} // 🔧 Tambahan ini
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
        />

        <FormField
          label="PIN"
          placeholder="PIN (6 angka)"
          keyboardType="numeric"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />
        <CustomText variant="caption" style={styles.pinNote}>
          PIN digunakan untuk mereset password jika kamu lupa.
        </CustomText>

        <Button
          title="Daftar Sekarang"
          variant="primary"
          onPress={() => {
            console.log({name, phone, password});
          }}
        />

        <View style={styles.loginRow}>
          <CustomText variant="caption">Sudah punya akun?</CustomText>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <CustomText variant="caption" style={styles.loginLink}>
              Masuk
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  pinNote: {
    marginLeft: 4,
    marginBottom: 16,
    fontSize: 12,
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
});

export default RegisterScreen;
