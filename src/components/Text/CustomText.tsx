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
  uppercase?: boolean;
  children: React.ReactNode;
}

function safeStringify(obj: any): string {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, function (_key, value) {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (e) {
    return '[Unserializable]';
  }
}

const CustomText: React.FC<Props> = ({
  variant = 'body',
  color = COLORS.darkBlue,
  align = 'left',
  style,
  onPress,
  children,
  uppercase = false,
  numberOfLines,
  ellipsizeMode,
  ...rest
}) => {
  const safeChildren = React.Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      if (uppercase && typeof child === 'string') {
        return child.toUpperCase();
      }
      return child;
    }
    if (__DEV__) {
      return safeStringify(child);
    }
    return '';
  });

  const content = (
    <Text
      style={[baseStyles[variant], {color, textAlign: align}, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...rest}>
      {safeChildren}
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
    fontSize: 20,
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
