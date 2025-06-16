import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants';

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('home');

  const getColors = (tabName: string) => {
    return activeTab === tabName ? COLORS.darkBlue : COLORS.gray;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          setActiveTab('home');
        }}>
        <Icon name="home" size={28} color={getColors('home')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          setActiveTab('wallet');
        }}>
        <Icon name="wallet" size={28} color={getColors('wallet')} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.addBtn}>
        <Icon name="add" size={35} color={COLORS.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          setActiveTab('document-text');
        }}>
        <Icon
          name="document-text"
          size={28}
          color={getColors('document-text')}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          setActiveTab('person');
        }}>
        <Icon name="person" size={28} color={getColors('person')} />
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
    // borderColor: 'red',
    // borderWidth: 1,
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
