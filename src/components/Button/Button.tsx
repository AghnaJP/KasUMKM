import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import {BUTTON_COLORS} from '../../constants';
import CustomText from '../Text/CustomText';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  fullWidth?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textVariant?: 'title' | 'subtitle' | 'body' | 'caption';
  disabled?: boolean;
}

const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  fullWidth = true,
  customStyle,
  textStyle,
  textVariant = 'body',
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
      <CustomText
        variant={textVariant}
        color={text}
        align="center"
        style={textStyle}>
        {title}
      </CustomText>
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
  outlineBorder: {
    borderWidth: 1,
    borderColor: '#163CAA',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});

export default Button;
