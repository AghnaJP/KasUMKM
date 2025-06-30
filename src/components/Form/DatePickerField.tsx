import React, {useState} from 'react';
import {View, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import {COLORS} from '../../constants';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

const DatePickerField: React.FC<Props> = ({value, onChange}) => {
  const [show, setShow] = useState(false);

  const formattedDate = value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <CustomText>{formattedDate}</CustomText>
        <Icon name="calendar" size={20} color={COLORS.darkBlue} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
  },
});

export default DatePickerField;
