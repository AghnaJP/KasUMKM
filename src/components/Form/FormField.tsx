import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import CustomText from '../Text/CustomText';
import CustomTextInput from '../Text/CustomTextInput';

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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    marginLeft: 4,
    marginBottom: 8,
  },
});

export default FormField;
