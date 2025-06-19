import React from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import FormField from '../../components/Form/FormField';
import Button from '../../components/Button/Button';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../types/navigation';
import {COLORS} from '../../constants';

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <CustomText variant="title" style={styles.screenTitle}>
          Selamat Datang
        </CustomText>
        <CustomText variant="body" style={styles.screenSubtitle}>
          Masuk ke akun kamu dengan nomor HP
        </CustomText>

        <FormField
          label="Nomor Telepon"
          placeholder="Nomor HP"
          keyboardType="phone-pad"
        />
        <FormField label="Password" placeholder="Password" secureTextEntry />

        <Button title="Masuk" variant="primary" onPress={() => {}} />

        <View style={styles.loginRow}>
          <CustomText variant="caption">Belum punya akun?</CustomText>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <CustomText variant="caption" style={styles.loginLink}>
              Daftar Sekarang
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
});

export default LoginScreen;
