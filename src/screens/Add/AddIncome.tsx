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
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {AppTabParamList} from '../../types/navigation';
import {BukuEntry} from '../../utils/parser';
import TransactionScanner from '../../components/AddTransaction/TransactionScanner';

const AddIncome = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<AppTabParamList, 'Add'>>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<
    {item: MenuItem; quantity: number}[]
  >([]);
  const [showScanner, setShowScanner] = useState(false);

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
        Alert.alert('Berhasil', 'Pendapatan berhasil disimpan');
        setSelectedMenus([]);
      }
      navigation.navigate('Wallet', {initialTab: 'income'});
    } catch (e) {
      console.error('Insert income error:', e);
      Alert.alert('Error', 'Gagal menyimpan pendapatan');
    }
  };

  const handleScannerResult = (entries: BukuEntry[]) => {
    // Convert entries ke format MenuItem jika memungkinkan
    const scannedMenus = entries.map(entry => ({
      item: {
        name: entry.keterangan,
        price: entry.pemasukan,
        category: 'food', // default or map from entry if available
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as MenuItem,
      quantity: 1,
    }));
    setSelectedMenus(prev => [...prev, ...scannedMenus]);
    setShowScanner(false);
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
          <Button
            title="Scan Pendapatan"
            variant="secondary"
            onPress={() => setShowScanner(true)}
          />
        </View>

        {showScanner && (
          <TransactionScanner
            mode="income"
            onResultDetected={handleScannerResult}
            onClose={() => setShowScanner(false)}
          />
        )}

        {selectedMenus.map(({item, quantity}, index) => (
          <SelectedMenuItem
            key={`${item.id}-${index}`} // gabungan id + index untuk unik
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
