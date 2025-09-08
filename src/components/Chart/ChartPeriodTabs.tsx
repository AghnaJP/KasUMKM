import React, {useMemo} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import CustomText from '../Text/CustomText';

type PeriodOption = 'Hari' | 'Minggu' | 'Bulan' | 'Tahun';

interface Props {
  selected: PeriodOption;
  onSelect: (period: PeriodOption) => void;
}

const OPTIONS: PeriodOption[] = ['Hari', 'Minggu', 'Bulan', 'Tahun'];

const ChartPeriodTabs: React.FC<Props> = ({selected, onSelect}) => {
  const renderOptions = useMemo(() => {
    return OPTIONS.map(option => {
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
    });
  }, [selected, onSelect]);

  return <View style={styles.container}>{renderOptions}</View>;
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
    marginBottom: 15,
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

export default React.memo(ChartPeriodTabs);
