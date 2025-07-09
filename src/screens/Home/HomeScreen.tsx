import React, {useContext} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import {AuthContext} from '../../context/AuthContext';

const HomeScreen = () => {
  const {userName} = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.wrapper}>
      <CustomText variant="subtitle">Selamat Sore,</CustomText>
      <CustomText variant="title">{userName}</CustomText>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default HomeScreen;
