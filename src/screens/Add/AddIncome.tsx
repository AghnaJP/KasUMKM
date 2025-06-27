// src/screens/Add/AddIncome.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import MenuModal from '../../components/Modal/MenuModal';
import { MenuItem } from '../../data/data';
import { COLORS } from '../../constants';
import Button from '../../components/Button/Button';
import SelectedMenuItem from '../../components/AddTransaction/SelectedMenuItem';

const AddIncome = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<{ item: MenuItem; quantity: number }[]>([]);

  const onChange = (_event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const totalPrice = selectedMenus.reduce(
    (acc, curr) => acc + curr.item.harga * curr.quantity,
    0
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Tanggal */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowPicker(true)}
          >
            <CustomText>
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CustomText>
            <Icon name="calendar" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onChange}
            />
          )}
        </View>

        {/* Pilih Menu */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menu} onPress={() => setShowMenuModal(true)}>
            <CustomText>Pilih Menu</CustomText>
            <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>
        </View>

        {/* Menu Yang Dipilih */}
        {selectedMenus.map(({ item, quantity }) => (
            <SelectedMenuItem
                key={item.namaMenu}
                item={item}
                quantity={quantity}
                onIncrease={() =>
                setSelectedMenus(prev =>
                    prev.map(m =>
                    m.item.namaMenu === item.namaMenu ? { ...m, quantity: m.quantity + 1 } : m
                    )
                )
                }
                onDecrease={() =>
                setSelectedMenus(prev =>
                    prev
                    .map(m =>
                        m.item.namaMenu === item.namaMenu ? { ...m, quantity: m.quantity - 1 } : m
                    )
                    .filter(m => m.quantity > 0)
                )
                }
            />
        ))}

        {/* Total */}
        {selectedMenus.length > 0 && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <CustomText variant="subtitle">Total Harga</CustomText>
              <CustomText variant="body">Rp{totalPrice.toLocaleString('id-ID')}</CustomText>
            </View>
            <Button variant="primary" title="Simpan" onPress={() => { /* TODO: handle save */ }} />
          </View>
        )}
      </ScrollView>

      {/* Modal Menu */}
      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onSelect={(menu: MenuItem) => {
          setSelectedMenus(prev => {
            const existing = prev.find(m => m.item.namaMenu === menu.namaMenu);
            return existing
              ? prev.map(m =>
                  m.item.namaMenu === menu.namaMenu ? { ...m, quantity: m.quantity + 1 } : m
                )
              : [...prev, { item: menu, quantity: 1 }];
          });
          setShowMenuModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  title: {
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    width: '100%',
    marginTop: 10,
  },
  datePickerButton: {
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
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
  },
  menuName: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
});

export default AddIncome;
