import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import CustomText from '../Text/CustomText';

type PeriodOption = 'Hari' | 'Minggu' | 'Bulan' | 'Tahun';

interface Props {
  selected: PeriodOption;
  onSelect: (period: PeriodOption) => void;
}

const ChartPeriodTabs: React.FC<Props> = ({selected, onSelect}) => {
  const options: PeriodOption[] = ['Hari', 'Minggu', 'Bulan', 'Tahun'];

  return (
    <View style={styles.container}>
      {options.map(option => {
        const isActive = selected === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.tab, isActive && styles.activeTab]}>
            <CustomText
              variant="caption"
              style={[styles.text, isActive && styles.activeText]}>
              {option}
            </CustomText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#C9E7F1',
  },
  text: {
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  activeText: {
    color: '#0E3345',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default ChartPeriodTabs;
