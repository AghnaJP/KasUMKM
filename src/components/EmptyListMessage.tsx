import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from './Text/CustomText';

interface Props {
  message?: string;
}

const EmptyListMessage: React.FC<Props> = ({ message = 'Tidak ada data' }) => {
  return (
    <View style={styles.container}>
      <CustomText variant="caption">{message}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});

export default EmptyListMessage;
