import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../types/navigation';
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import {ScrollView} from 'react-native-gesture-handler';

const OnboardingScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Image
        source={require('../../assets/images/onboarding-money.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <CustomText
        variant="title"
        color="#1f1f1f"
        align="center"
        style={styles.titleSpacing}>
        Know where your money goes
      </CustomText>

      <CustomText
        variant="caption"
        color="#9ca3af"
        align="center"
        style={styles.subtitleSpacing}>
        Track your transaction easily, with categories and financial report
      </CustomText>

      <Button
        title="Sign Up"
        variant="primary"
        onPress={() => navigation.navigate('Register')}
      />

      <Button
        title="Login"
        variant="secondary"
        onPress={() => navigation.navigate('Login')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    height: 250,
    marginBottom: 32,
  },
  titleSpacing: {
    marginBottom: 8,
  },
  subtitleSpacing: {
    marginBottom: 20,
  },
});

export default OnboardingScreen;
