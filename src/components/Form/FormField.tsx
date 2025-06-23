import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import CustomText from '../Text/CustomText';
import CustomTextInput from '../Text/CustomTextInput';
import {COLORS} from '../../constants';

interface Props {
  label: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  maxLength?: number;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  error?: string;
}

const FormField: React.FC<Props> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  containerStyle,
  rightIcon,
  error,
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <CustomText variant="body" style={styles.label}>
        {label}
      </CustomText>
      <CustomTextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        rightIcon={rightIcon}
        error={error}
      />
      {error ? (
        <CustomText variant="caption" style={styles.errorText}>
          {error}
        </CustomText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    marginLeft: 4,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.red,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormField;
