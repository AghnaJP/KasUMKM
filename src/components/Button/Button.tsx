import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import {BUTTON_COLORS} from '../../constants';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  fullWidth = true,
  customStyle,
  textStyle,
  disabled = false,
}) => {
  const {bg, text} = BUTTON_COLORS[variant] ?? BUTTON_COLORS.primary;

  const buttonStyle = [
    styles.button,
    fullWidth && styles.fullWidth,
    variant === 'outline' && styles.outlineBorder,
    {backgroundColor: disabled ? '#ccc' : bg},
    customStyle,
  ];

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      style={buttonStyle}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}>
      <Text style={[styles.text, {color: text}, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});

export default Button;
