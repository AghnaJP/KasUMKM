import React from 'react';
import {
  Text,
  StyleProp,
  TextProps,
  TextStyle,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {COLORS, FONTS} from '../../constants';

interface Props extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  color?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
  children: React.ReactNode;
}

const CustomText: React.FC<Props> = ({
  variant = 'body',
  color = COLORS.darkBlue,
  align = 'left',
  style,
  onPress,
  children,
  ...rest
}) => {
  const content = (
    <Text
      style={[baseStyles[variant], {color, textAlign: align}, style]}
      {...rest}>
      {children}
    </Text>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
};

const baseStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  body: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  caption: {
    fontSize: 14,
    fontFamily: FONTS.light,
  },
});

export default CustomText;
