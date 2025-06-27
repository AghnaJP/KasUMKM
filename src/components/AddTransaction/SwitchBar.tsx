import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface SwitchBarProps {
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
  size?: 'small';
}

const SwitchBar: React.FC<SwitchBarProps> = ({ options, selected, onChange, size }) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.tab,
            size === 'small' && styles.tabSmall,
            selected === option && styles.activeTab,
          ]}
          onPress={() => onChange(option)}
        >
          <Text style={[
            styles.text,
            size === 'small' && styles.textSmall,
            selected === option && styles.activeText,
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  activeTab: {
    backgroundColor: COLORS.softBlue,
  },
  text: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  activeText: {
    color: COLORS.black,
  },
  tabSmall: {
    paddingVertical: 4,
  },
  textSmall: {
    fontSize: 13,
  },
});

export default SwitchBar;
