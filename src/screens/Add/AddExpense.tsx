import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {ExpenseItem} from '../../types/menu';
import CustomText from '../../components/Text/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../constants';
import ExpenseInputModal from '../../components/Modal/ExpenseInputModal';
import SelectedMenuItem from '../../components/AddTransaction/SelectedMenuItem';
import Button from '../../components/Button/Button';
import {insertExpense} from '../../database/Expense/expenseQueries';
import DatePickerField from '../../components/Form/DatePickerField';
import {useIsFocused} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {AppTabParamList} from '../../types/navigation';
import {addTransaction} from '../../database/transactions/transactionUnified';

const AddExpense = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<AppTabParamList, 'Add'>>();
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setSelectedDate(new Date());
    }
  }, [isFocused]);

  const handleSave = () => {
    const existing = expenses.find(
      exp => exp.description === description.trim(),
    );

    if (existing) {
      setExpenses(prev =>
        prev.map(exp =>
          exp.description === description.trim()
            ? {...exp, quantity: exp.quantity + 1}
            : exp,
        ),
      );
    } else {
      setExpenses(prev => [
        ...prev,
        {
          id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1,
          description: description.trim(),
          price: Number(amount),
          quantity: 1,
          created_at: selectedDate.toISOString(),
        },
      ]);
    }

    setDescription('');
    setAmount('');
    setShowFormModal(false);
  };

  const handleSubmit = async () => {
    try {
      const now = selectedDate.toISOString();

      for (const item of expenses) {
        // 1) simpan detail ke tabel expenses (yang lama)
        await insertExpense(
          item.description,
          item.price,
          item.quantity,
          now,
          now,
        );

        // 2) simpan ringkasannya ke unified -> untuk sinkronisasi
        await addTransaction({
          name: item.description,
          type: 'EXPENSE',
          amount: item.price * item.quantity,
          occurred_at: now,
        });
      }

      Alert.alert('Berhasil', 'Pengeluaran berhasil disimpan');
      setExpenses([]);
      navigation.navigate('Wallet', {initialTab: 'expense'});
    } catch (e) {
      console.error('Insert expense error:', e);
      Alert.alert('Error', 'Gagal menyimpan pengeluaran');
    }
  };

  const totalPrice = expenses.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <DatePickerField value={selectedDate} onChange={setSelectedDate} />

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.expense}
            onPress={() => setShowFormModal(true)}>
            <CustomText>Masukkan Pengeluaran</CustomText>
            <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>
        </View>

        {expenses.map((item, index) => (
          <SelectedMenuItem
            key={item.id}
            item={item}
            quantity={item.quantity}
            onIncrease={() =>
              setExpenses(prev =>
                prev.map((exp, i) =>
                  i === index ? {...exp, quantity: exp.quantity + 1} : exp,
                ),
              )
            }
            onDecrease={() =>
              setExpenses(prev =>
                prev
                  .map((exp, i) =>
                    i === index ? {...exp, quantity: exp.quantity - 1} : exp,
                  )
                  .filter(exp => exp.quantity > 0),
              )
            }
          />
        ))}

        {expenses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <CustomText variant="subtitle">Total Harga</CustomText>
              <CustomText variant="body">
                Rp{totalPrice.toLocaleString('id-ID')}
              </CustomText>
            </View>
            <Button variant="primary" title="Simpan" onPress={handleSubmit} />
          </View>
        )}

        <ExpenseInputModal
          visible={showFormModal}
          onClose={() => setShowFormModal(false)}
          description={description}
          setDescription={setDescription}
          amount={amount}
          setAmount={setAmount}
          onSave={() => {
            handleSave();
          }}
        />
      </ScrollView>
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
  expense: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
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

export default AddExpense;
