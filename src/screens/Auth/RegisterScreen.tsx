import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomText from '../../components/Text/CustomText';

const RegisterScreen = () => {
  return (
    <View style={styles.container}>
      <CustomText variant="title" align="center">
        Hello from Register Screen
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default RegisterScreen;
