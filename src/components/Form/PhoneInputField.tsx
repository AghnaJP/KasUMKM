import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import CustomText from '../Text/CustomText';
import {COLORS} from '../../constants';

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

const PhoneInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
}: Props) => {
  return (
    <View style={styles.container}>
      {label && (
        <CustomText variant="body" style={styles.label}>
          {label}
        </CustomText>
      )}
      <View style={[styles.wrapper, error && styles.wrapperError]}>
        <Text style={styles.prefix}>+62</Text>
        <TextInput
          value={value}
          onChangeText={text => {
            let cleaned = text;

            if (text.startsWith('62')) {
              cleaned = text.slice(2);
            } else if (text.startsWith('0')) {
              cleaned = text.slice(1);
            }

            onChangeText(cleaned);
          }}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>
      {error ? (
        <CustomText variant="caption" style={styles.errorText}>
          {error}
        </CustomText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  prefix: {
    fontSize: 16,
    color: COLORS.darkBlue,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkBlue,
  },
  errorText: {
    color: COLORS.red,
    marginTop: 4,
    marginLeft: 4,
  },
  wrapperError: {
    borderColor: COLORS.red,
  },
});

export default PhoneInputField;
