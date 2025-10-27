import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {COLORS} from '../constants';

const BottomNav: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  const currentTabIndex = state.index;

  const handlePress = (index: number) => {
    if (index !== currentTabIndex) {
      navigation.navigate(state.routes[index].name);
    }
  };

  const getColor = (index: number) =>
    index === currentTabIndex ? COLORS.darkBlue : COLORS.gray;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => handlePress(0)}>
        <Icon name="home" size={28} color={getColor(0)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} onPress={() => handlePress(1)}>
        <Icon name="wallet" size={28} color={getColor(1)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addBtn} onPress={() => handlePress(2)}>
        <Icon name="add" size={35} color={COLORS.white} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} onPress={() => handlePress(3)}>
        <Icon name="document-text" size={28} color={getColor(3)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} onPress={() => handlePress(4)}>
        <Icon name="person" size={28} color={getColor(4)} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 50,
    backgroundColor: COLORS.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BottomNav;
