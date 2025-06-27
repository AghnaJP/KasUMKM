// src/screens/Add/AddExpense.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { ExpenseItem } from '../../data/data';
import CustomText from '../../components/Text/CustomText';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants';
import ExpenseInputModal from '../../components/Modal/ExpenseInputModal';
import SelectedMenuItem from '../../components/AddTransaction/SelectedMenuItem';
import Button from '../../components/Button/Button';

const AddExpense = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const onChange = (_: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = () => {
    const existing = expenses.find(exp => exp.description === description.trim());

    if (existing) {
        // Jika deskripsi sudah ada, tambahkan quantity
        setExpenses(prev =>
        prev.map(exp =>
            exp.description === description.trim()
            ? { ...exp, quantity: exp.quantity + 1 }
            : exp
        )
        );
    } else {
        // Jika deskripsi belum ada, tambahkan item baru
        setExpenses(prev => [
        ...prev,
        { description: description.trim(), amount: Number(amount), quantity: 1 },
        ]);
    }

    setDescription('');
    setAmount('');
    setShowFormModal(false);
  };

  const totalPrice = expenses.reduce(
        (acc, curr) => acc + curr.amount * curr.quantity,
        0
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.datePickerButton}>
          {/* Tanggal */}
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
          <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onChange} />
        )}

        {/* Masukkan Pengeluaran */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.expense} onPress={() => setShowFormModal(true)}>
            <CustomText>Masukkan Pengeluaran</CustomText>
            <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>
        </View>

        {/* List Data Pengeluaran */}
        {expenses.map((item, index) => (
            <SelectedMenuItem
                key={index}
                item={item}
                quantity={item.quantity}
                onIncrease={() =>
                setExpenses(prev =>
                    prev.map((exp, i) =>
                    i === index ? { ...exp, quantity: exp.quantity + 1 } : exp
                    )
                )
                }
                onDecrease={() =>
                setExpenses(prev =>
                    prev
                    .map((exp, i) =>
                        i === index ? { ...exp, quantity: exp.quantity - 1 } : exp
                    )
                    .filter(exp => exp.quantity > 0)
                )
                }
            />
        ))}

        {/* Total */}
        {expenses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <CustomText variant="subtitle">Total Harga</CustomText>
              <CustomText variant="body">Rp{totalPrice.toLocaleString('id-ID')}</CustomText>
            </View>
            <Button variant="primary" title="Simpan" onPress={() => { /* TODO: handle save */ }} />
          </View>
        )}

        {/* Modal Form Pengeluaran */}
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
      </View>
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
  expenseItem: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
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
