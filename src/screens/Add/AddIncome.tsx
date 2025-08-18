import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import MenuModal from '../../components/Modal/MenuModal';
import {MenuItem} from '../../types/menu';
import {COLORS} from '../../constants';
import Button from '../../components/Button/Button';
import SelectedMenuItem from '../../components/AddTransaction/SelectedMenuItem';
import {insertIncome} from '../../database/Incomes/incomeQueries';
import DatePickerField from '../../components/Form/DatePickerField';
import {useIsFocused} from '@react-navigation/native';

const AddIncome = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<
    {item: MenuItem; quantity: number}[]
  >([]);

  const totalPrice = selectedMenus.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0,
  );

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setSelectedDate(new Date());
    }
  }, [isFocused]);

  const handleSubmit = async () => {
    try {
      const now = selectedDate.toISOString();
      for (const {item, quantity} of selectedMenus) {
        await insertIncome(item.id, quantity, now, now);
        Alert.alert('Berhasil', 'Menu berhasil disimpan');
        setSelectedMenus([]);
      }
    } catch (e) {
      console.error('Insert income error:', e);
      Alert.alert('Error', 'Gagal menyimpan pemasukan');
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <DatePickerField value={selectedDate} onChange={setSelectedDate} />

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menu}
            onPress={() => setShowMenuModal(true)}>
            <CustomText>Pilih Menu</CustomText>
            <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>
        </View>

        {selectedMenus.map(({item, quantity}) => (
          <SelectedMenuItem
            key={item.id}
            item={item}
            quantity={quantity}
            onIncrease={() =>
              setSelectedMenus(prev =>
                prev.map(m =>
                  m.item.id === item.id ? {...m, quantity: m.quantity + 1} : m,
                ),
              )
            }
            onDecrease={() =>
              setSelectedMenus(prev =>
                prev
                  .map(m =>
                    m.item.id === item.id
                      ? {...m, quantity: m.quantity - 1}
                      : m,
                  )
                  .filter(m => m.quantity > 0),
              )
            }
          />
        ))}

        {selectedMenus.length > 0 && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <CustomText variant="subtitle">Total Harga</CustomText>
              <CustomText variant="body">
                Rp{totalPrice.toLocaleString('id-ID')}
              </CustomText>
            </View>
            <Button title="SIMPAN" variant="primary" onPress={handleSubmit} />
          </View>
        )}
      </ScrollView>

      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onSelect={(item: MenuItem) => {
          setSelectedMenus(prev => {
            const existing = prev.find(m => m.item.id === item.id);
            return existing
              ? prev.map(m =>
                  m.item.id === item.id ? {...m, quantity: m.quantity + 1} : m,
                )
              : [...prev, {item: item, quantity: 1}];
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
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  section: {
    width: '100%',
    marginTop: 10,
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
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AddIncome;
