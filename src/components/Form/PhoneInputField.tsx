import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import CustomText from '../Text/CustomText'; // import label text

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const PhoneInputField = ({label, value, onChangeText, placeholder}: Props) => {
  return (
    <View style={styles.container}>
      {label && (
        <CustomText variant="body" style={styles.label}>
          {label}
        </CustomText>
      )}
      <View style={styles.wrapper}>
        <Text style={styles.prefix}>08</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    color: '#111827',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  prefix: {
    fontSize: 16,
    color: '#111827',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
});

export default PhoneInputField;
