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
}

const CustomTextInput: React.FC<Props> = ({
  rightIcon,
  containerStyle,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.gray}
        {...rest}
      />{' '}
      {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  icon: {
    marginLeft: 8,
  },
});

export default CustomTextInput;
