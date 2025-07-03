import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../../constants';

type Option<T> = {label: string; value: T};

type SwitchBarProps<T extends string> = {
  options: Option<T>[] | T[]; // bisa array of string atau object
  selected: T;
  onChange: (value: T) => void;
  size?: 'small';
};

function SwitchBar<T extends string>({
  options,
  selected,
  onChange,
  size,
}: SwitchBarProps<T>) {
  // ubah semua opsi jadi bentuk { label, value }
  const normalizedOptions: Option<T>[] = options.map(opt =>
    typeof opt === 'string' ? {label: opt, value: opt as T} : opt,
  );

  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall]}>
      {normalizedOptions.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.tab,
            size === 'small' && styles.tabSmall,
            selected === option.value && styles.activeTab,
          ]}
          onPress={() => onChange(option.value)}>
          <Text
            style={[
              styles.text,
              size === 'small' && styles.textSmall,
              selected === option.value && styles.activeText,
            ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 20,
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
  containerSmall: {
    marginVertical: 5,
  },
  tabSmall: {
    paddingVertical: 4,
  },
  textSmall: {
    fontSize: 13,
  },
});

export default SwitchBar;
