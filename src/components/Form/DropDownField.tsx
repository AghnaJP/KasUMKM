import React, {useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CustomText from '../Text/CustomText';
import {COLORS} from '../../constants';

interface Props<T extends string> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  items: {label: string; value: T}[];
  placeholder?: string;
  containerStyle?: ViewStyle;
  error?: string;
  autoCloseOnSelect?: boolean;
}

const DropdownField = <T extends string>({
  label,
  value,
  onValueChange,
  items,
  placeholder = 'Pilih salah satu',
  containerStyle,
  error,
  autoCloseOnSelect = false,
}: Props<T>) => {
  const [pickerVisible, setPickerVisible] = useState(false);

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);

  const selectedLabel = useMemo(
    () => items.find(item => item.value === value)?.label || '',
    [value, items],
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.wrapper, containerStyle]}>
        <CustomText variant="body" style={styles.label}>
          {label}
        </CustomText>

        <Pressable
          style={[styles.inputContainer, error && styles.errorBorder]}
          onPress={showPicker}
          accessible
          accessibilityRole="button"
          accessibilityLabel={label}>
          <CustomText
            variant="body"
            style={[styles.inputText, !value && styles.placeholderText]}>
            {value ? selectedLabel : placeholder}
          </CustomText>
        </Pressable>

        <Modal visible={pickerVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Pressable style={styles.overlayTouch} onPress={hidePicker} />
            <View style={styles.modalContent}>
              <View style={styles.iosPickerHeader}>
                <Pressable onPress={hidePicker}>
                  <CustomText variant="body" style={styles.iosPickerDone}>
                    Selesai
                  </CustomText>
                </Pressable>
              </View>
              <Picker
                selectedValue={value}
                onValueChange={val => {
                  onValueChange(val);
                  if (autoCloseOnSelect) {
                    hidePicker();
                  }
                }}
                style={styles.iosPicker}>
                {placeholder && (
                  <Picker.Item
                    label={placeholder}
                    value={'' as T}
                    enabled={false}
                    color={COLORS.gray}
                  />
                )}
                {items.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={item.label}
                    value={item.value}
                    enabled={item.value !== ''}
                    color={COLORS.black}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {error && (
          <CustomText variant="caption" style={styles.errorText}>
            {error}
          </CustomText>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <CustomText variant="body" style={styles.label}>
        {label}
      </CustomText>

      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={COLORS.gray}
          mode="dropdown"
          accessibilityLabel={label}>
          {placeholder && (
            <Picker.Item label={placeholder} value={'' as T} enabled={false} />
          )}
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>

      {error && (
        <CustomText variant="caption" style={styles.errorText}>
          {error}
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    marginLeft: 4,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    justifyContent: 'center',
    height: 48,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  errorText: {
    color: COLORS.red,
    marginTop: 4,
    marginLeft: 4,
  },
  errorBorder: {
    borderColor: COLORS.red,
  },
  picker: {
    width: '100%',
    height: 60,
    color: COLORS.black,
    paddingTop: 12,
    paddingBottom: 12,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iosPickerDone: {
    color: COLORS.black,
    fontWeight: '600',
    fontSize: 16,
  },
  iosPicker: {
    width: '100%',
    height: 200,
    color: COLORS.black,
  },
});

export default DropdownField;
