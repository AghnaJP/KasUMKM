import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import {AVATAR_COLORS} from '../../constants/colors';

type Props = {
  name?: string | null;
  style?: ViewStyle;
};

function getInitial(name?: string | null) {
  if (!name || !name.trim()) {return '?';}
  const firstWord = name.trim().split(/\s+/)[0];
  return firstWord[0].toUpperCase();
}

function colorFromName(name?: string | null) {
  if (!name) {return AVATAR_COLORS[0];}
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const InitialAvatar: React.FC<Props> = ({name, style}) => {
  const initial = getInitial(name);
  const bg = colorFromName(name);

  const width = (style as any)?.width ?? 100;
  const height = (style as any)?.height ?? 100;
  const fontSize = Math.min(width, height) * 0.4;

  return (
    <View style={[styles.container, style, {backgroundColor: bg}]}>
      <CustomText style={[styles.text, {fontSize}]} color="#fff">
        {initial}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default InitialAvatar;
