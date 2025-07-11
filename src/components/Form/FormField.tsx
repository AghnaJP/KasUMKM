import React from 'react';
import {View, StyleSheet, ViewStyle, TouchableOpacity} from 'react-native';
import CustomText from '../Text/CustomText';
import CustomTextInput from '../Text/CustomTextInput';
import {COLORS} from '../../constants';

interface Props {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  maxLength?: number;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  error?: string;
  editable?: boolean;
  touchableOnly?: boolean;
  onPress?: () => void;
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
  editable = true,
  touchableOnly = false,
  onPress,
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <CustomText variant="body" style={styles.label}>
        {label}
      </CustomText>

      {touchableOnly ? (
        <TouchableOpacity
          style={styles.readOnlyContainer}
          onPress={onPress}
          activeOpacity={0.7}>
          <CustomText variant="body" style={styles.readOnlyText}>
            {value || placeholder}
          </CustomText>
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </TouchableOpacity>
      ) : (
        <CustomTextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          rightIcon={rightIcon}
          error={error}
          editable={editable}
        />
      )}

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
  readOnlyContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  readOnlyText: {
    fontSize: 16,
    color: COLORS.black,
  },
  icon: {
    marginLeft: 8,
  },
});

export default FormField;
