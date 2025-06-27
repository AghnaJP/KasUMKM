import React from 'react';
import {
  StyleProp,
  TextInputProps,
  View,
  ViewStyle,
  StyleSheet,
  TextInput,
} from 'react-native';
import {COLORS} from '../../constants';

interface Props extends TextInputProps {
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  children?: React.ReactNode;
}

const CustomTextInput: React.FC<Props> = ({
  rightIcon,
  containerStyle,
  style,
  error,
  children,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.container,
        error ? styles.errorBorder : styles.normalBorder,
        containerStyle,
      ]}>
      {children ? (
        children
      ) : (
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.gray}
          {...rest}
        />
      )}
      {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  icon: {
    marginLeft: 8,
  },
  normalBorder: {
    borderColor: COLORS.lightGray,
  },
  errorBorder: {
    borderColor: COLORS.red,
  },
});

export default CustomTextInput;
